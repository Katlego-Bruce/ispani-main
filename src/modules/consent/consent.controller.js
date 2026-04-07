const s = require('./consent.service');
module.exports = {
  async give(req, res, next) { try { res.status(201).json({ success: true, data: await s.giveConsent(req.user.id, req.body) }); } catch (e) { next(e); } },
  async withdraw(req, res, next) { try { res.json({ success: true, data: await s.withdrawConsent(req.params.id, req.user.id) }); } catch (e) { next(e); } },
  async list(req, res, next) { try { res.json({ success: true, data: await s.findByUser(req.user.id) }); } catch (e) { next(e); } },
};
