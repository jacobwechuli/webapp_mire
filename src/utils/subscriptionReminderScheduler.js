const { sendSubscriptionReminder } = require('./nodemailerSender');
const dayjs = require('dayjs');

// Mock data: Replace with DB query in production
const subscriptions = [
  {
    userEmail: 'user1@example.com',
    subscriptionName: 'Netflix',
    dueDate: '2024-07-10',
  },
  {
    userEmail: 'user2@example.com',
    subscriptionName: 'Spotify',
    dueDate: '2024-07-13',
  },
];

async function checkAndSendReminders() {
  const today = dayjs();
  for (const sub of subscriptions) {
    const due = dayjs(sub.dueDate);
    if (due.diff(today, 'day') === 3) {
      await sendSubscriptionReminder(sub.userEmail, sub.subscriptionName, sub.dueDate);
    }
  }
}

// Run the scheduler (could be set up with cron in production)
checkAndSendReminders(); 