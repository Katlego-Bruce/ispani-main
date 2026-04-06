const jobsService = require('./jobs.service');

const jobsController = {
  async create(req, res, next) {
    try {
      const job = await jobsService.create(req.body, req.user.id);
      res.status(201).json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  },

  async listJobs(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const status = req.query.status || undefined;
      const result = await jobsService.findAll(page, limit, status);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getJobById(req, res, next) {
    try {
      const job = await jobsService.findById(req.params.id);
      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  },

  async updateJob(req, res, next) {
    try {
      const job = await jobsService.update(req.params.id, req.body);
      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  },

  async assignWorker(req, res, next) {
    try {
      const job = await jobsService.assign(req.params.id, req.body.worker_id);
      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  },

  async completeJob(req, res, next) {
    try {
      const job = await jobsService.complete(req.params.id);
      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = jobsController;
