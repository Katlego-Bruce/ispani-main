const s = require('./disputes.service');
module.exports = {
  async create(req, res, next) { try { const d = await s.create(req.user.id, req.body, req); res.status(201).json({ success: true, data: d }); } catch (e) { next(e); } },
  async getById(req, res, next) { try { res.json({ success: true, data: await s.findById(req.params.id) }); } catch (e) { next(e); } },
  async resolve(req, res, next) { try { const d = await s.resolve(req.params.id, req.user.id, req.body, req); res.json({ success: true, data: d }); } catch (e) { next(e); } },
  async list(req, res, next) { try { const r = await s.findAll(parseInt(req.query.page, 10) || 1, parseInt(req.query.limit, 10) || 20, req.query.status); res.json({ success: true, ...r }); } catch (e) { next(e); } },
};
