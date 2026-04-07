const { prisma } = require('../../services/prisma');
const { ApiError } = require('../../middleware/errorHandler');
const auditLog = require('../../services/auditLog');

const disputesService = {
  async create(raisedById, data, req) {
    const job = await prisma.job.findUnique({ where: { id: data.job_id } });
    if (!job) throw new ApiError(404, 'Job not found');
    const dispute = await prisma.dispute.create({ data: { job_id: data.job_id, raised_by_id: raisedById, against_id: data.against_id, category: data.category, description: data.description, evidence_urls: data.evidence_urls || [] } });
    await prisma.job.update({ where: { id: data.job_id }, data: { status: 'disputed' } });
    await auditLog.log({ userId: raisedById, action: 'dispute.opened', entityType: 'Dispute', entityId: dispute.id, req });
    return dispute;
  },
  async findById(id) {
    const d = await prisma.dispute.findUnique({ where: { id }, include: { job: { select: { id: true, title: true } }, raised_by: { select: { id: true, first_name: true, last_name: true } }, against: { select: { id: true, first_name: true, last_name: true } } } });
    if (!d) throw new ApiError(404, 'Dispute not found');
    return d;
  },
  async resolve(id, resolverId, { resolution, refund_amount, status }, req) {
    const d = await prisma.dispute.findUnique({ where: { id } });
    if (!d) throw new ApiError(404, 'Dispute not found');
    const updated = await prisma.dispute.update({ where: { id }, data: { status: status || 'resolved', resolution, refund_amount: refund_amount || null, resolved_by_id: resolverId, resolved_at: new Date() } });
    await auditLog.log({ userId: resolverId, action: 'dispute.resolved', entityType: 'Dispute', entityId: id, details: { resolution, refund_amount }, req });
    return updated;
  },
  async findAll(page = 1, limit = 20, status) {
    limit = Math.min(limit, 100); const skip = (page - 1) * limit; const where = status ? { status } : {};
    const [data, total] = await Promise.all([prisma.dispute.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' }, include: { job: { select: { id: true, title: true } }, raised_by: { select: { id: true, first_name: true, last_name: true } } } }), prisma.dispute.count({ where })]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  },
};
module.exports = disputesService;
