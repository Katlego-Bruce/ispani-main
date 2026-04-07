const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

const email = {
  async sendJobPostedNotification(workerEmail, jobTitle, jobId) {
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || 'noreply@ispani.co.za',
        to: workerEmail,
        subject: `New Job Opportunity: ${jobTitle}`,
        html: `<h2>New Job Match!</h2><p>A new job matching your skills has been posted:</p><h3>${jobTitle}</h3><p><a href="${process.env.APP_URL}/jobs/${jobId}">View Job</a></p>`,
      });
      logger.info(`Job notification sent to ${workerEmail}`);
      return { success: true };
    } catch (err) {
      logger.error('Email send error:', err.message);
      return { success: false, error: err.message };
    }
  },

  async sendPaymentConfirmation(recipientEmail, jobTitle, amount) {
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || 'noreply@ispani.co.za',
        to: recipientEmail,
        subject: 'Payment Confirmation',
        html: `<h2>Payment Received</h2><p>You have received payment for: <strong>${jobTitle}</strong></p><p>Amount: <strong>R${amount}</strong></p>`,
      });
      logger.info(`Payment confirmation sent to ${recipientEmail}`);
      return { success: true };
    } catch (err) {
      logger.error('Email send error:', err.message);
      return { success: false, error: err.message };
    }
  },

  async sendDisputeNotification(recipientEmail, jobTitle, disputeReason) {
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || 'noreply@ispani.co.za',
        to: recipientEmail,
        subject: 'Dispute Reported',
        html: `<h2>Dispute Notice</h2><p>A dispute has been reported for job: <strong>${jobTitle}</strong></p><p>Reason: ${disputeReason}</p><p>Our team will review this and contact you within 48 hours.</p>`,
      });
      logger.info(`Dispute notification sent to ${recipientEmail}`);
      return { success: true };
    } catch (err) {
      logger.error('Email send error:', err.message);
      return { success: false, error: err.message };
    }
  },
};

module.exports = email;
