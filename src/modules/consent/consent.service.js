const { prisma } = require('../../services/prisma');
const { ApiError } = require('../../middleware/errorHandler');

const consentService = {
  async giveConsent(userId, { consent_type, consent_version, purpose, method }) {
    return prisma.consent.create({ data: { user_id: userId, consent_type, consent_version, purpose, method: method || 'clickwrap', given_at: new Date() } });
  },
  async withdrawConsent(consentId, userId) {
    const c = await prisma.consent.findUnique({ where: { id: consentId } });
    if (!c) throw new ApiError(404, 'Consent not found');
    if (c.user_id !== userId) throw new ApiError(403, 'Not your consent record');
    if (c.withdrawn_at) throw new ApiError(400, 'Already withdrawn');
    return prisma.consent.update({ where: { id: consentId }, data: { withdrawn_at: new Date() } });
  },
  async findByUser(userId) { return prisma.consent.findMany({ where: { user_id: userId }, orderBy: { given_at: 'desc' } }); },
};
module.exports = consentService;
