'use client';

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  data?: unknown;
  timestamp: number;
  retryCount: number;
}

const DB_NAME = 'sales-automation-offline';
const STORE_NAME = 'request-queue';
const DB_VERSION = 1;

class OfflineQueueService {
  private db: IDBDatabase | null = null;
  private isProcessing = false;

  async init(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async addToQueue(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    const queuedRequest: QueuedRequest = {
      ...request,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const addRequest = store.add(queuedRequest);

      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    });
  }

  async getQueuedRequests(): Promise<QueuedRequest[]> {
    if (!this.db) await this.init();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async removeFromQueue(id: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateRetryCount(id: string, retryCount: number): Promise<void> {
    if (!this.db) return;

    const requests = await this.getQueuedRequests();
    const request = requests.find((r) => r.id === id);
    if (!request) return;

    request.retryCount = retryCount;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const putRequest = store.put(request);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    });
  }

  async processQueue(): Promise<{ processed: number; failed: number }> {
    if (this.isProcessing || !navigator.onLine) {
      return { processed: 0, failed: 0 };
    }

    this.isProcessing = true;
    let processed = 0;
    let failed = 0;

    try {
      const requests = await this.getQueuedRequests();
      const token = localStorage.getItem('token');

      for (const queuedRequest of requests) {
        if (queuedRequest.retryCount >= 3) {
          await this.removeFromQueue(queuedRequest.id);
          failed++;
          continue;
        }

        try {
          const response = await fetch(queuedRequest.url, {
            method: queuedRequest.method,
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: queuedRequest.data ? JSON.stringify(queuedRequest.data) : undefined,
          });

          if (response.ok) {
            await this.removeFromQueue(queuedRequest.id);
            processed++;
          } else if (response.status >= 400 && response.status < 500) {
            // Client error - don't retry
            await this.removeFromQueue(queuedRequest.id);
            failed++;
          } else {
            // Server error - retry later
            await this.updateRetryCount(queuedRequest.id, queuedRequest.retryCount + 1);
          }
        } catch {
          await this.updateRetryCount(queuedRequest.id, queuedRequest.retryCount + 1);
        }
      }
    } finally {
      this.isProcessing = false;
    }

    return { processed, failed };
  }

  async getQueueLength(): Promise<number> {
    const requests = await this.getQueuedRequests();
    return requests.length;
  }

  async clearQueue(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineQueue = new OfflineQueueService();
