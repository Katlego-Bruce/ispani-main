const usersService = require('./users.service');

const usersController = {
  async register(req, res, next) { try { const result = await usersService.register(req.body, req); res.status(201).json({ success: true, data: result }); } catch (err) { next(err); } },
  async login(req, res, next) { try { const result = await usersService.login(req.body, req); res.json({ success: true, data: result }); } catch (err) { next(err); } },
  async getProfile(req, res, next) { try { const user = await usersService.findById(req.user.id); res.json({ success: true, data: user }); } catch (err) { next(err); } },
  async listUsers(req, res, next) { try { const page = parseInt(req.query.page, 10) || 1; const limit = parseInt(req.query.limit, 10) || 20; const result = await usersService.findAll(page, limit); res.json({ success: true, ...result }); } catch (err) { next(err); } },
  async getUserById(req, res, next) { try { const user = await usersService.findById(req.params.id); res.json({ success: true, data: user }); } catch (err) { next(err); } },
  async updateUser(req, res, next) { try { const user = await usersService.update(req.params.id, req.body, req); res.json({ success: true, data: user }); } catch (err) { next(err); } },
};

module.exports = usersController;
