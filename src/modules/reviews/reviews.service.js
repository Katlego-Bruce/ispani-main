const { prisma } = require('../../services/prisma');
const { ApiError } = require('../../middleware/errorHandler');

const reviewsService = {
  async create(reviewerId, { job_id, reviewee_id, rating, comment }) {
    const job = await prisma.job.findUnique({ where: { id: job_id } });
    if (!job) throw new ApiError(404, 'Job not found');
    if (job.status !== 'completed') throw new ApiError(400, 'Can only review completed jobs');
    if (![job.client_id, job.worker_id].includes(reviewerId)) throw new ApiError(403, 'Only job participants can leave reviews');
    const existing = await prisma.review.findUnique({ where: { job_id_reviewer_id: { job_id, reviewer_id: reviewerId } } });
    if (existing) throw new ApiError(409, 'You already reviewed this job');
    const review = await prisma.review.create({ data: { job_id, reviewer_id: reviewerId, reviewee_id, rating, comment: comment || null } });
    const stats = await prisma.review.aggregate({ where: { reviewee_id, is_visible: true }, _avg: { rating: true }, _count: { rating: true } });
    await prisma.user.update({ where: { id: reviewee_id }, data: { avg_rating: stats._avg.rating || 0, total_reviews: stats._count.rating || 0, trust_score: Math.min(100, 30 + (stats._avg.rating || 0) * 14) } });
    return review;
  },
  async findByUser(userId, page = 1, limit = 20) {
    limit = Math.min(limit, 100); const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.review.findMany({ where: { reviewee_id: userId, is_visible: true }, skip, take: limit, orderBy: { created_at: 'desc' }, include: { reviewer: { select: { id: true, first_name: true, last_name: true } } } }),
      prisma.review.count({ where: { reviewee_id: userId, is_visible: true } }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  },
};
module.exports = reviewsService;
