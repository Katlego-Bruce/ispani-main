const axios = require('axios');
const logger = require('./logger');

const payment = {
  async initializePayfastPayment(jobId, amount, email, name) {
    try {
      const merchant_id = process.env.PAYFAST_MERCHANT_ID;
      const merchant_key = process.env.PAYFAST_MERCHANT_KEY;
      const return_url = `${process.env.APP_URL}/api/v1/payments/payfast/return`;
      const notify_url = `${process.env.APP_URL}/api/v1/payments/payfast/notify`;

      const data = {
        merchant_id, merchant_key, return_url, notify_url,
        name_first: name.split(' ')[0],
        name_last: name.split(' ')[1] || 'User',
        email_address: email,
        m_payment_id: jobId,
        amount: (amount).toFixed(2),
        item_name: `Ispani Job Payment - ${jobId}`,
        item_description: 'Payment for completed job on Ispani',
        custom_str1: jobId,
      };

      logger.info(`PayFast payment initialized for job ${jobId}`);
      return {
        success: true,
        redirectUrl: `https://www.payfast.co.za/eng/process?${new URLSearchParams(data)}`,
      };
    } catch (err) {
      logger.error('PayFast initialization error:', err.message);
      return { success: false, error: err.message };
    }
  },

  async holdFunds(paymentId, amount) {
    try {
      logger.info(`Holding funds for payment ${paymentId}: R${amount}`);
      return { success: true, escrowId: paymentId };
    } catch (err) {
      logger.error('Escrow hold error:', err.message);
      return { success: false, error: err.message };
    }
  },

  async releaseFunds(paymentId, recipientId, amount) {
    try {
      logger.info(`Releasing funds from payment ${paymentId} to ${recipientId}: R${amount}`);
      return { success: true };
    } catch (err) {
      logger.error('Fund release error:', err.message);
      return { success: false, error: err.message };
    }
  },

  async refundPayment(paymentId, amount, reason) {
    try {
      logger.info(`Refunding payment ${paymentId}: R${amount}. Reason: ${reason}`);
      return { success: true };
    } catch (err) {
      logger.error('Refund error:', err.message);
      return { success: false, error: err.message };
    }
  },

  calculateFairPrice(jobCategory, estimatedHours, skillLevel = 'intermediate') {
    const hourlyRates = {
      plumbing: { beginner: 150, intermediate: 350, expert: 500 },
      electrical: { beginner: 200, intermediate: 400, expert: 600 },
      gardening: { beginner: 100, intermediate: 250, expert: 400 },
      cleaning: { beginner: 80, intermediate: 150, expert: 250 },
      painting: { beginner: 120, intermediate: 300, expert: 450 },
      carpentry: { beginner: 150, intermediate: 400, expert: 600 },
    };
    const rate = hourlyRates[jobCategory]?.[skillLevel] || 250;
    const minimumWage = 27.58;
    if (rate < minimumWage) {
      logger.warn(`Rate for ${jobCategory} is below minimum wage`);
      return minimumWage * estimatedHours;
    }
    return rate * estimatedHours;
  },
};

module.exports = payment;
