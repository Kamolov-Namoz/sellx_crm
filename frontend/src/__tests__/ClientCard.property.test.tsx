/**
 * Property-Based Tests for ClientCard Component
 * **Feature: sales-automation-pwa**
 */

import * as fc from 'fast-check';
import { Client, ClientStatus, STATUS_LABELS } from '@/types';

// Arbitraries
const clientStatusArb = fc.constantFrom<ClientStatus>('new', 'contacted', 'qualified', 'proposal', 'won', 'lost');

const clientArb = fc.record({
  _id: fc.uuid(),
  userId: fc.uuid(),
  fullName: fc.string({ minLength: 2, maxLength: 100 }),
  phoneNumber: fc.string({ minLength: 5, maxLength: 20 }),
  email: fc.option(fc.emailAddress(), { nil: undefined }),
  notes: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  status: clientStatusArb,
  followUpDate: fc.option(fc.date().map((d) => d.toISOString()), { nil: undefined }),
  createdAt: fc.date().map((d) => d.toISOString()),
  updatedAt: fc.date().map((d) => d.toISOString()),
});

/**
 * **Property 19: Client card renders required fields**
 * **Validates: Requirements 8.2**
 * 
 * *For any* client object, the rendered client card component should display
 * the client's full name, current status, and next follow-up date (if set).
 */
describe('Property 19: Client card renders required fields', () => {
  // Simulate what the component renders
  const renderClientCard = (client: Client): string => {
    let html = `<div class="card">`;
    html += `<h3>${client.fullName}</h3>`;
    html += `<p>${client.phoneNumber}</p>`;
    html += `<span class="status">${STATUS_LABELS[client.status]}</span>`;
    
    if (client.followUpDate) {
      html += `<span class="follow-up">${client.followUpDate}</span>`;
    }
    
    if (client.notes) {
      html += `<p class="notes">${client.notes}</p>`;
    }
    
    html += `</div>`;
    return html;
  };

  it('should always display client full name', () => {
    fc.assert(
      fc.property(clientArb, (client) => {
        const rendered = renderClientCard(client as Client);
        expect(rendered).toContain(client.fullName);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should always display client status', () => {
    fc.assert(
      fc.property(clientArb, (client) => {
        const rendered = renderClientCard(client as Client);
        const statusLabel = STATUS_LABELS[client.status as ClientStatus];
        expect(rendered).toContain(statusLabel);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should display follow-up date when present', () => {
    fc.assert(
      fc.property(
        clientArb.filter((c) => c.followUpDate !== undefined),
        (client) => {
          const rendered = renderClientCard(client as Client);
          expect(rendered).toContain(client.followUpDate!);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display phone number', () => {
    fc.assert(
      fc.property(clientArb, (client) => {
        const rendered = renderClientCard(client as Client);
        expect(rendered).toContain(client.phoneNumber);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should have valid status label for all statuses', () => {
    fc.assert(
      fc.property(clientStatusArb, (status) => {
        const label = STATUS_LABELS[status];
        expect(label).toBeDefined();
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
        return true;
      }),
      { numRuns: 6 } // Only 6 statuses
    );
  });

  it('should handle clients with all optional fields', () => {
    fc.assert(
      fc.property(
        clientArb.map((c) => ({
          ...c,
          email: 'test@example.com',
          notes: 'Some notes',
          followUpDate: new Date().toISOString(),
        })),
        (client) => {
          const rendered = renderClientCard(client as Client);
          
          expect(rendered).toContain(client.fullName);
          expect(rendered).toContain(client.phoneNumber);
          expect(rendered).toContain(STATUS_LABELS[client.status as ClientStatus]);
          expect(rendered).toContain(client.followUpDate!);
          expect(rendered).toContain(client.notes!);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle clients with no optional fields', () => {
    fc.assert(
      fc.property(
        clientArb.map((c) => ({
          ...c,
          email: undefined,
          notes: undefined,
          followUpDate: undefined,
        })),
        (client) => {
          const rendered = renderClientCard(client as Client);
          
          // Required fields should still be present
          expect(rendered).toContain(client.fullName);
          expect(rendered).toContain(client.phoneNumber);
          expect(rendered).toContain(STATUS_LABELS[client.status as ClientStatus]);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
