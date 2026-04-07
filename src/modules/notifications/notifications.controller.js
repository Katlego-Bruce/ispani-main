const s = require('./notifications.service');
module.exports = {
  async list(req, res, next) { try { const r = await s.findByUser(req.user.id, parseInt(req.query.page, 10) || 1, parseInt(req.query.limit, 10) || 20); res.json({ success: true, ...r }); } catch (e) { next(e); } },
  async markRead(req, res, next) { try { res.json({ success: true, data: await s.markRead(req.params.id, req.user.id) }); } catch (e) { next(e); } },
};
