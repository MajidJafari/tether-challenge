const cron = require('node-cron');

class SchedulerService {
  constructor(task) {
    this.task = task;
    this.job = null;
  }

  start(cronExpression) {
    if (this.job) {
      console.warn('A job is already running. Stop it before starting a new one.');
      return;
    }

    this.job = cron.schedule(cronExpression, async () => {
      console.log(`Executing scheduled task at ${new Date().toISOString()}`);
      try {
        await this.task();
      } catch (error) {
        console.error('Error during scheduled task execution:', error.message);
      }
    });

    console.log(`Scheduler started with expression: ${cronExpression}`);
  }

  stop() {
    if (this.job) {
      this.job.stop();
      this.job = null;
      console.log('Scheduler stopped.');
    } else {
      console.warn('No job is currently running.');
    }
  }

  async executeNow() {
    console.log(`Executing task on demand at ${new Date().toISOString()}`);
    try {
      await this.task();
    } catch (error) {
      console.error('Error during on-demand task execution:', error.message);
    }
  }
}

module.exports = SchedulerService;
