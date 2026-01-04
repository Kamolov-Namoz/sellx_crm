export declare class SchedulerService {
    private cronJob;
    private isProcessing;
    /**
     * Start the reminder scheduler
     * Runs every minute to check for due reminders
     */
    start(): void;
    /**
     * Stop the scheduler
     */
    stop(): void;
    /**
     * Check if scheduler is running
     */
    isRunning(): boolean;
}
export declare const schedulerService: SchedulerService;
//# sourceMappingURL=scheduler.service.d.ts.map