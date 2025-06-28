const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail', // or another email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Generate the subject and body for the subscription reminder email.
 * @param {string} user - User's name or email
 * @param {string} subscription - Subscription/service name
 * @returns {{ subject: string, body: string }}
 */
function getReminderEmailContent(user, subscription) {
  const subject = `Reminder: Your "${subscription}" Subscription is Due in 3 Days`;
  const body = `Hi ${user},\n\nThis is a friendly reminder that your subscription for "${subscription}" is due in 3 days.\n\nPlease ensure you have sufficient funds or take any necessary action to avoid interruption of service.\n\nIf you have already taken care of this, you can ignore this message.\n\nThank you for using GoldPlus!\n\nBest regards,\nThe GoldPlus Team`;
  return { subject, body };
}

/**
 * Send a subscription reminder email to the user.
 * @param {string} to - Recipient email address
 * @param {string} subscriptionName - Name of the subscription
 * @param {string} dueDate - Due date (ISO string or formatted)
 * @param {string} [userName] - User's name (optional)
 */
async function sendSubscriptionReminder(to, subscriptionName, dueDate, userName) {
  const user = userName || to;
  const { subject, body } = getReminderEmailContent(user, subscriptionName);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: body,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${to} for ${subscriptionName}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Sample usage (uncomment to test)
// sendSubscriptionReminder('user@example.com', 'Netflix', '2024-07-10', 'John Doe');

module.exports = { sendSubscriptionReminder }; 