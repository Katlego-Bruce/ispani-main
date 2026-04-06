const { prisma } = require('../../services/prisma');
const { ApiError } = require('../../middleware/errorHandler');

const jobsService = {
  async create(data, clientId) {
    const job = await prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category || null,
        location_lat: data.location_lat || null,
        location_lng: data.location_lng || null,
        location_address: data.location_address || null,
        payment_amount: data.payment_amount,
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: 'open',
        client_id: clientId,
      },
    });
    return job;
  },

  async findAll(page = 1, limit = 20, status) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [data, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          client: {
            select: { id: true, first_name: true, last_name: true, email: true },
          },
          worker: {
            select: { id: true, first_name: true, last_name: true, email: true },
          },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  },

  async findById(id) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, first_name: true, last_name: true, email: true },
        },
        worker: {
          select: { id: true, first_name: true, last_name: true, email: true },
        },
        applications: {
          include: {
            user: {
              select: { id: true, first_name: true, last_name: true, email: true },
            },
          },
        },
      },
    });

    if (!job) {
      throw new ApiError(404, 'Job not found');
    }
    return job;
  },

  async update(id, updateData) {
    // Only allow safe fields
    const allowed = ['title', 'description', 'category', 'payment_amount', 'location_address', 'deadline', 'status'];
    const filtered = {};
    for (const key of allowed) {
      if (updateData[key] !== undefined) {
        filtered[key] = updateData[key];
      }
    }

    if (filtered.deadline) {
      filtered.deadline = new Date(filtered.deadline);
    }

    const job = await prisma.job.update({
      where: { id },
      data: filtered,
    });
    return job;
  },

  async assign(id, workerId) {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) throw new ApiError(404, 'Job not found');
    if (job.status !== 'open') {
      throw new ApiError(400, 'Job is not open for assignment');
    }

    return prisma.job.update({
      where: { id },
      data: { worker_id: workerId, status: 'assigned' },
    });
  },

  async complete(id) {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) throw new ApiError(404, 'Job not found');
    if (!['assigned', 'in_progress'].includes(job.status)) {
      throw new ApiError(400, 'Job cannot be completed in current state');
    }

    return prisma.job.update({
      where: { id },
      data: { status: 'completed' },
    });
  },
};

module.exports = jobsService;
