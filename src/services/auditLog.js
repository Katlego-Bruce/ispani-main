const { prisma } = require('./prisma');

const auditLog = {
  async log({ userId, action, entityType, entityId, details = null, req = null }) {
    try {
      await prisma.auditLog.create({
        data: {
          user_id: userId, action, entity_type: entityType, entity_id: entityId,
          details: details || undefined,
          ip_address: req?.ip || req?.headers?.['x-forwarded-for'] || null,
          user_agent: req?.headers?.['user-agent'] || null,
        },
      });
    } catch (err) { console.error('Audit log failed:', err.message); }
  },
};

module.exports = auditLog;
