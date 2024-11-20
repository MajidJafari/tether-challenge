const SchedulerService = require('../../src/services/scheduler.service');
jest.mock('node-cron');

describe('SchedulerService', () => {
  let mockTask;
  let scheduler;

  beforeEach(() => {
    mockTask = jest.fn();
    scheduler = new SchedulerService(mockTask);
  });

  afterEach(() => {
    scheduler.stop();
  });

  it('should start and execute the task on schedule', () => {
    const cronSpy = require('node-cron').schedule;
    cronSpy.mockImplementation((_, callback) => {
      callback(); // Immediately invoke the task to simulate execution
      return { stop: jest.fn() };
    });

    scheduler.start('*/30 * * * * *');
    expect(cronSpy).toHaveBeenCalledWith('*/30 * * * * *', expect.any(Function));
    expect(mockTask).toHaveBeenCalled();
  });

  it('should stop the scheduler', () => {
    const stopSpy = jest.fn();
    const cronSpy = require('node-cron').schedule;
    cronSpy.mockReturnValue({ stop: stopSpy });

    scheduler.start('*/30 * * * * *');
    scheduler.stop();

    expect(stopSpy).toHaveBeenCalled();
  });

  it('should execute the task on demand', async () => {
    await scheduler.executeNow();
    expect(mockTask).toHaveBeenCalled();
  });

  it('should warn if a job is already running when starting a new one', () => {
    scheduler.start('*/30 * * * * *');
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    scheduler.start('*/30 * * * * *'); // Attempt to start another job
    expect(consoleWarnSpy).toHaveBeenCalledWith('A job is already running. Stop it before starting a new one.');

    consoleWarnSpy.mockRestore();
  });
});
