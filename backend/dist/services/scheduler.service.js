"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulerService = exports.SchedulerService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const reminder_service_1 = require("./reminder.service");
class SchedulerService {
    cronJob = null;
    isProcessing = false;
    /**
     * Start the reminder scheduler
     * Runs every minute to check for due reminders
     */
    start() {
        if (this.cronJob) {
            console.warn('Scheduler already running');
            return;
        }
        // Run every minute
        this.cronJob = node_cron_1.default.schedule('* * * * *', async () => {
            // Prevent concurrent processing
            if (this.isProcessing) {
                return;
            }
            this.isProcessing = true;
            try {
                const result = await reminder_service_1.reminderService.processDueReminders();
                if (result.total > 0) {
                    console.warn(`Processed ${result.processed}/${result.total} reminders (${result.failed} failed)`);
                }
            }
            catch (error) {
                console.error('Scheduler error:', error);
            }
            finally {
                this.isProcessing = false;
            }
        });
        console.warn('Reminder scheduler started');
    }
    /**
     * Stop the scheduler
     */
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = null;
            console.warn('Reminder scheduler stopped');
        }
    }
    /**
     * Check if scheduler is running
     */
    isRunning() {
        return this.cronJob !== null;
    }
}
exports.SchedulerService = SchedulerService;
exports.schedulerService = new SchedulerService();
//# sourceMappingURL=scheduler.service.js.map