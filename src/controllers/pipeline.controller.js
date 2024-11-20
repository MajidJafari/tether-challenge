class PipelineController {
  constructor(schedulerService) {
    this.schedulerService = schedulerService;
  }

  async executePipeline() {
    console.log('On-demand pipeline execution triggered.');
    await this.schedulerService.executeNow();
    return Buffer.from(
      JSON.stringify({ message: 'Pipeline executed successfully' }),
    );
  }
}

module.exports = PipelineController;
