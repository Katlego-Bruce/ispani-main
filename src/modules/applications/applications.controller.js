const applicationsService = require('./applications.service');

const applicationsController = {
  async apply(req, res, next) {
    try {
      const application = await applicationsService.apply(req.user.id, req.body);
      res.status(201).json({ success: true, data: application });
    } catch (err) {
      next(err);
    }
  },

  async myApplications(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const result = await applicationsService.findByUser(req.user.id, page, limit);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async jobApplications(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const result = await applicationsService.findByJob(req.params.jobId, req.user.id, page, limit);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async accept(req, res, next) {
    try {
      const application = await applicationsService.accept(req.params.id, req.user.id);
      res.json({ success: true, data: application });
    } catch (err) {
      next(err);
    }
  },

  async reject(req, res, next) {
    try {
      const application = await applicationsService.reject(req.params.id, req.user.id);
      res.json({ success: true, data: application });
    } catch (err) {
      next(err);
    }
  },

  async withdraw(req, res, next) {
    try {
      const application = await applicationsService.withdraw(req.params.id, req.user.id);
      res.json({ success: true, data: application });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = applicationsController;
