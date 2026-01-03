import cron from 'node-cron';
import { reminderService } from './reminder.service';

export class SchedulerService {
  private cronJob: cron.ScheduledTask | null = null;

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
    this.cronJob = cron.schedule('* * * * *', async () => {
      try {
        const result = await reminderService.processDueReminders();
        
        if (result.total > 0) {
          console.warn(
            `Processed ${result.processed}/${result.total} reminders (${result.failed} failed)`
          );
        }
      } catch (error) {
        console.error('Scheduler error:', error);
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

export const schedulerService = new SchedulerService();
