const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../services/prisma');
const config = require('../../config');
const { ApiError } = require('../../middleware/errorHandler');
const auditLog = require('../../services/auditLog');

const SALT_ROUNDS = 12;

function generateToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, type: user.type }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
}

function sanitizeUser(user) {
  const { password_hash, id_number_hash, ...safe } = user;
  return safe;
}

const usersService = {
  async register({ email, password, first_name, last_name, phone, type }, req) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ApiError(409, 'Email already registered');
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({ data: { email, password_hash, first_name: first_name || null, last_name: last_name || null, phone: phone || null, type: type || 'worker' } });
    await auditLog.log({ userId: user.id, action: 'user.registered', entityType: 'User', entityId: user.id, req });
    return { user: { id: user.id, email: user.email, type: user.type }, access_token: generateToken(user) };
  },

  async login({ email, password }, req) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ApiError(401, 'Invalid credentials');
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new ApiError(401, 'Invalid credentials');
    await prisma.user.update({ where: { id: user.id }, data: { last_login_at: new Date() } });
    await auditLog.log({ userId: user.id, action: 'user.login', entityType: 'User', entityId: user.id, req });
    return { user: { id: user.id, email: user.email, type: user.type }, access_token: generateToken(user) };
  },

  async findById(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ApiError(404, 'User not found');
    return sanitizeUser(user);
  },

  async findAll(page = 1, limit = 20) {
    limit = Math.min(limit, 100);
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.user.findMany({ skip, take: limit, where: { is_active: true }, orderBy: { created_at: 'desc' }, select: { id: true, type: true, email: true, phone: true, first_name: true, last_name: true, kyc_status: true, trust_score: true, avg_rating: true, total_reviews: true, sa_province: true, is_active: true, created_at: true } }),
      prisma.user.count({ where: { is_active: true } }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  },

  async update(id, updateData, req) {
    const allowed = ['first_name', 'last_name', 'phone', 'skills', 'location_lat', 'location_lng', 'sa_province', 'tools_self_provided', 'multi_client_declaration'];
    const filtered = {};
    for (const key of allowed) { if (updateData[key] !== undefined) filtered[key] = updateData[key]; }
    if (filtered.location_lat || filtered.location_lng) filtered.location_updated_at = new Date();
    const user = await prisma.user.update({ where: { id }, data: filtered });
    await auditLog.log({ userId: req?.user?.id || id, action: 'user.updated', entityType: 'User', entityId: id, details: { fields_updated: Object.keys(filtered) }, req });
    return sanitizeUser(user);
  },
};

module.exports = usersService;
