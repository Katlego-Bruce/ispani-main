const { prisma } = require('../../services/prisma');
const { ApiError } = require('../../middleware/errorHandler');
const auditLog = require('../../services/auditLog');

const NMW_PER_HOUR = 27.58;

const jobsService = {
  async create(data, clientId, req) {
    let belowMinFlag = false;
    if (data.rate_per_hour && parseFloat(data.rate_per_hour) < NMW_PER_HOUR) belowMinFlag = true;
    const job = await prisma.job.create({ data: { title: data.title, description: data.description, category: data.category || null, location_lat: data.location_lat || null, location_lng: data.location_lng || null, location_address: data.location_address || null, sa_province: data.sa_province || null, payment_amount: data.payment_amount, rate_per_hour: data.rate_per_hour || null, estimated_hours: data.estimated_hours || null, below_minimum_flag: belowMinFlag, pricing_acknowledged: data.pricing_acknowledged || false, deadline: data.deadline ? new Date(data.deadline) : null, status: 'draft', client_id: clientId } });
    await auditLog.log({ userId: clientId, action: 'job.created', entityType: 'Job', entityId: job.id, req });
    return job;
  },
  async publish(id, clientId, req) {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) throw new ApiError(404, 'Job not found');
    if (job.client_id !== clientId) throw new ApiError(403, 'Only the job owner can publish');
    if (job.status !== 'draft') throw new ApiError(400, 'Only draft jobs can be published');
    return prisma.job.update({ where: { id }, data: { status: 'open' } });
  },
  async findAll(page = 1, limit = 20, status) {
    limit = Math.min(limit, 100);
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};
    const [data, total] = await Promise.all([
      prisma.job.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' }, include: { client: { select: { id: true, first_name: true, last_name: true, email: true } }, worker: { select: { id: true, first_name: true, last_name: true, email: true } }, _count: { select: { applications: true } } } }),
      prisma.job.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  },
  async findById(id) {
    const job = await prisma.job.findUnique({ where: { id }, include: { client: { select: { id: true, first_name: true, last_name: true, email: true } }, worker: { select: { id: true, first_name: true, last_name: true, email: true } }, applications: { include: { user: { select: { id: true, first_name: true, last_name: true, email: true } } } } } });
    if (!job) throw new ApiError(404, 'Job not found');
    return job;
  },
  async update(id, updateData) {
    const allowed = ['title', 'description', 'category', 'payment_amount', 'rate_per_hour', 'estimated_hours', 'location_address', 'sa_province', 'deadline', 'status', 'pricing_acknowledged'];
    const filtered = {};
    for (const key of allowed) { if (updateData[key] !== undefined) filtered[key] = updateData[key]; }
    if (filtered.deadline) filtered.deadline = new Date(filtered.deadline);
    return prisma.job.update({ where: { id }, data: filtered });
  },
  async assign(id, workerId) {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) throw new ApiError(404, 'Job not found');
    if (job.status !== 'open') throw new ApiError(400, 'Job is not open for assignment');
    return prisma.job.update({ where: { id }, data: { worker_id: workerId, status: 'assigned' } });
  },
  async start(id) {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) throw new ApiError(404, 'Job not found');
    if (job.status !== 'assigned') throw new ApiError(400, 'Job must be assigned first');
    return prisma.job.update({ where: { id }, data: { status: 'in_progress', started_at: new Date() } });
  },
  async complete(id) {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) throw new ApiError(404, 'Job not found');
    if (!['assigned', 'in_progress'].includes(job.status)) throw new ApiError(400, 'Job cannot be completed in current state');
    return prisma.job.update({ where: { id }, data: { status: 'completed', completed_at: new Date() } });
  },
};

module.exports = jobsService;
