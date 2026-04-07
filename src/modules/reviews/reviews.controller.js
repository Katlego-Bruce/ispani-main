const s = require('./reviews.service');
module.exports = {
  async create(req, res, next) { try { const r = await s.create(req.user.id, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } },
  async getByUser(req, res, next) { try { const p = parseInt(req.query.page, 10) || 1; const l = parseInt(req.query.limit, 10) || 20; const r = await s.findByUser(req.params.userId, p, l); res.json({ success: true, ...r }); } catch (e) { next(e); } },
};
