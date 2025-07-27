const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Configure Nodemailer for sending emails
const transporter = nodemailer.createTransporter({
  service: "gmail", // You can use any SMTP provider
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com", // Replace with your email
    pass: process.env.EMAIL_PASSWORD || "your-app-password",   // Use an app password, not your Gmail password
  },
});

// Function to generate random temporary password
function generateTempPassword(length = 12) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function migrateGoogleUsers() {
  let nextPageToken;
  const emailLog = [];
  let totalUsers = 0;
  let migratedUsers = 0;

  console.log("🚀 Starting Google user migration...");
  console.log("📧 Email configuration:", {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    service: "gmail"
  });

  do {
    const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
    totalUsers += listUsersResult.users.length;
    
    console.log(`📋 Processing ${listUsersResult.users.length} users...`);
    
    for (const user of listUsersResult.users) {
      const isGoogleUser = user.providerData.some(
        (p) => p.providerId === "google.com"
      );

      if (isGoogleUser && user.email) {
        console.log(`🔄 Migrating Google user: ${user.email}`);
        
        try {
          const tempPassword = generateTempPassword();
          
          // Update user with temporary password
          await admin.auth().updateUser(user.uid, { 
            password: tempPassword,
            emailVerified: true // Ensure email is verified since it's from Google
          });

          // Send email with temporary password
          const mailOptions = {
            from: process.env.EMAIL_USER || "your-email@gmail.com",
            to: user.email,
            subject: "GoldPlus - Your New Login Password",
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
          console.log(`✅ Password sent to: ${user.email}`);
          emailLog.push({ 
            email: user.email, 
            uid: user.uid,
            password: tempPassword,
            displayName: user.displayName || 'N/A',
            timestamp: new Date().toISOString()
          });
          migratedUsers++;
          
        } catch (err) {
          console.error(`❌ Failed to migrate user ${user.email}:`, err.message);
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

  // Save log of migration results
  const logData = {
    summary: {
      totalUsers,
      migratedUsers,
      timestamp: new Date().toISOString()
    },
    users: emailLog
  };
  
  fs.writeFileSync("migrated_users.json", JSON.stringify(logData, null, 2));
  
  console.log("\n🎉 Migration complete!");
  console.log(`📊 Summary:`);
  console.log(`   Total users processed: ${totalUsers}`);
  console.log(`   Successfully migrated: ${migratedUsers}`);
  console.log(`   Failed migrations: ${emailLog.filter(u => u.error).length}`);
  console.log(`📄 Check migrated_users.json for detailed results.`);
}

// Handle errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

migrateGoogleUsers().catch(console.error); 