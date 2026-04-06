const { prisma } = require('../../services/prisma');
const { ApiError } = require('../../middleware/errorHandler');

const applicationsService = {
  /**
   * Worker applies to a job
   */
  async apply(userId, { job_id, message }) {
    // Check job exists and is open
    const job = await prisma.job.findUnique({ where: { id: job_id } });
    if (!job) throw new ApiError(404, 'Job not found');
    if (job.status !== 'open') throw new ApiError(400, 'Job is not open for applications');
    if (job.client_id === userId) throw new ApiError(400, 'You cannot apply to your own job');

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: { job_id_user_id: { job_id, user_id: userId } },
    });
    if (existing) throw new ApiError(409, 'You have already applied to this job');

    return prisma.application.create({
      data: {
        job_id,
        user_id: userId,
        message: message || null,
        status: 'pending',
      },
      include: {
        job: { select: { id: true, title: true, status: true } },
      },
    });
  },

  /**
   * Get applications for the logged-in worker
   */
  async findByUser(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.application.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          job: {
            select: { id: true, title: true, status: true, payment_amount: true, location_address: true },
          },
        },
      }),
      prisma.application.count({ where: { user_id: userId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  },

  /**
   * Get applications for a specific job (only the job owner can view)
   */
  async findByJob(jobId, requesterId, page = 1, limit = 20) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new ApiError(404, 'Job not found');
    if (job.client_id !== requesterId) throw new ApiError(403, 'Only the job owner can view applications');

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.application.findMany({
        where: { job_id: jobId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: { id: true, first_name: true, last_name: true, email: true, trust_score: true, skills: true },
          },
        },
      }),
      prisma.application.count({ where: { job_id: jobId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  },

  /**
   * Client accepts an application (auto-assigns the worker to the job)
   */
  async accept(applicationId, requesterId) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application) throw new ApiError(404, 'Application not found');
    if (application.job.client_id !== requesterId) throw new ApiError(403, 'Only the job owner can accept applications');
    if (application.status !== 'pending') throw new ApiError(400, 'Application is no longer pending');

    // Accept this application and assign worker to job
    const [updatedApp] = await prisma.$transaction([
      prisma.application.update({
        where: { id: applicationId },
        data: { status: 'accepted' },
      }),
      // Assign the worker to the job
      prisma.job.update({
        where: { id: application.job_id },
        data: { worker_id: application.user_id, status: 'assigned' },
      }),
      // Reject all other pending applications for this job
      prisma.application.updateMany({
        where: {
          job_id: application.job_id,
          id: { not: applicationId },
          status: 'pending',
        },
        data: { status: 'rejected' },
      }),
    ]);

    return updatedApp;
  },

  /**
   * Client rejects an application
   */
  async reject(applicationId, requesterId) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application) throw new ApiError(404, 'Application not found');
    if (application.job.client_id !== requesterId) throw new ApiError(403, 'Only the job owner can reject applications');
    if (application.status !== 'pending') throw new ApiError(400, 'Application is no longer pending');

    return prisma.application.update({
      where: { id: applicationId },
      data: { status: 'rejected' },
    });
  },

  /**
   * Worker withdraws their application
   */
  async withdraw(applicationId, userId) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new ApiError(404, 'Application not found');
    if (application.user_id !== userId) throw new ApiError(403, 'You can only withdraw your own applications');
    if (application.status !== 'pending') throw new ApiError(400, 'Can only withdraw pending applications');

    return prisma.application.update({
      where: { id: applicationId },
      data: { status: 'withdrawn' },
    });
  },
};

module.exports = applicationsService;
