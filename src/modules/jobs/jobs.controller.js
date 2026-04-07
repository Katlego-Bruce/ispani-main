const jobsService = require('./jobs.service');

const jobsController = {
  async create(req, res, next) { try { const job = await jobsService.create(req.body, req.user.id, req); res.status(201).json({ success: true, data: job }); } catch (err) { next(err); } },
  async publish(req, res, next) { try { const job = await jobsService.publish(req.params.id, req.user.id, req); res.json({ success: true, data: job }); } catch (err) { next(err); } },
  async listJobs(req, res, next) { try { const p = parseInt(req.query.page, 10) || 1; const l = parseInt(req.query.limit, 10) || 20; const result = await jobsService.findAll(p, l, req.query.status); res.json({ success: true, ...result }); } catch (err) { next(err); } },
  async getJobById(req, res, next) { try { const job = await jobsService.findById(req.params.id); res.json({ success: true, data: job }); } catch (err) { next(err); } },
  async updateJob(req, res, next) { try { const job = await jobsService.update(req.params.id, req.body); res.json({ success: true, data: job }); } catch (err) { next(err); } },
  async startJob(req, res, next) { try { const job = await jobsService.start(req.params.id); res.json({ success: true, data: job }); } catch (err) { next(err); } },
  async assignWorker(req, res, next) { try { const job = await jobsService.assign(req.params.id, req.body.worker_id); res.json({ success: true, data: job }); } catch (err) { next(err); } },
  async completeJob(req, res, next) { try { const job = await jobsService.complete(req.params.id); res.json({ success: true, data: job }); } catch (err) { next(err); } },
};

module.exports = jobsController;
