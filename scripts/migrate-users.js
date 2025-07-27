const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load env vars
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Init Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// Email config
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
});

function generateTempPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function migrateGoogleUsers() {
  let nextPageToken;
  const emailLog = [];
  let totalUsers = 0;
  let migratedUsers = 0;

  console.log('🚀 Starting Google user migration...');
  console.log('📧 Email config:', {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    service: 'gmail'
  });

  do {
    const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
    totalUsers += listUsersResult.users.length;
    
    console.log(`📋 Processing ${listUsersResult.users.length} users...`);
    
    for (const user of listUsersResult.users) {
      const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');

      if (isGoogleUser && user.email) {
        console.log(`🔄 Migrating: ${user.email}`);
        
        try {
          const tempPassword = generateTempPassword();
          
          await admin.auth().updateUser(user.uid, { 
            password: tempPassword,
            emailVerified: true
          });

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'GoldPlus - Your New Login Password',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">GoldPlus Account Update</h2>
                <p>Hello,</p>
                <p>We are transitioning from Google login to email/password login for better security and user experience.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Your Temporary Login Credentials:</h3>
                  <p><strong>Email:</strong> ${user.email}</p>
                  <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
                </div>
                
                <p><strong>Important:</strong> Please log in with these credentials and change your password immediately for security.</p>
                
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #92400e;"><strong>⚠️ Security Notice:</strong> This temporary password will expire soon. Please change it immediately after logging in.</p>
                </div>
                
                <p>Thank you for using GoldPlus!</p>
                <p>Best regards,<br>The GoldPlus Team</p>
              </div>
            `,
            text: `Hello,\n\nWe are transitioning from Google login to email/password login.\n\nYour temporary password is: ${tempPassword}\n\nPlease log in and reset your password as soon as possible.\n\nThank you!\nThe GoldPlus Team`
          };

          await transporter.sendMail(mailOptions);
          console.log(`✅ Sent to: ${user.email}`);
          emailLog.push({ 
            email: user.email, 
            uid: user.uid, 
            password: tempPassword,
            displayName: user.displayName || 'N/A',
            timestamp: new Date().toISOString()
          });
          migratedUsers++;
          
        } catch (err) {
          console.error(`❌ Failed: ${user.email}`, err.message);
          emailLog.push({ 
            email: user.email, 
            uid: user.uid, 
            error: err.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);

  const logData = {
    summary: {
      totalUsers,
      migratedUsers,
      timestamp: new Date().toISOString()
    },
    users: emailLog
  };
  
  fs.writeFileSync('migrated_users.json', JSON.stringify(logData, null, 2));
  
  console.log('\n🎉 Migration complete!');
  console.log(`📊 Summary:`);
  console.log(`   Total users processed: ${totalUsers}`);
  console.log(`   Successfully migrated: ${migratedUsers}`);
  console.log(`   Failed migrations: ${emailLog.filter(u => u.error).length}`);
  console.log(`📄 Check migrated_users.json for detailed results.`);
}

migrateGoogleUsers().catch(console.error);
