const { prisma } = require('../../services/prisma');
const { ApiError } = require('../../middleware/errorHandler');

const notificationsService = {
  async create(userId, { type, title, body }) { return prisma.notification.create({ data: { user_id: userId, type, title, body } }); },
  async findByUser(userId, page = 1, limit = 20) {
    limit = Math.min(limit, 100); const skip = (page - 1) * limit;
    const [data, total, unread] = await Promise.all([prisma.notification.findMany({ where: { user_id: userId }, skip, take: limit, orderBy: { created_at: 'desc' } }), prisma.notification.count({ where: { user_id: userId } }), prisma.notification.count({ where: { user_id: userId, read_at: null } })]);
    return { data, meta: { total, unread, page, limit, pages: Math.ceil(total / limit) } };
  },
  async markRead(id, userId) {
    const n = await prisma.notification.findUnique({ where: { id } });
    if (!n) throw new ApiError(404, 'Notification not found');
    if (n.user_id !== userId) throw new ApiError(403, 'Not your notification');
    return prisma.notification.update({ where: { id }, data: { read_at: new Date() } });
  },
};
module.exports = notificationsService;
