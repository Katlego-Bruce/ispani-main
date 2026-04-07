const twilio = require('twilio');
const logger = require('./logger');

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sms = {
  async sendOTP(phoneNumber, otp) {
    try {
      const message = await twilioClient.messages.create({
        body: `Your Ispani verification code is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
      logger.info(`OTP sent to ${phoneNumber}. SID: ${message.sid}`);
      return { success: true, sid: message.sid };
    } catch (err) {
      logger.error(`Failed to send OTP to ${phoneNumber}:`, err.message);
      return { success: false, error: err.message };
    }
  },

  async sendNotification(phoneNumber, message) {
    try {
      const response = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
      logger.info(`Notification sent to ${phoneNumber}`);
      return { success: true, sid: response.sid };
    } catch (err) {
      logger.error(`Failed to send notification to ${phoneNumber}:`, err.message);
      return { success: false, error: err.message };
    }
  },
};

module.exports = sms;
