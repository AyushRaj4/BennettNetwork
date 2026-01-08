const getVerificationEmailTemplate = (name, verificationUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #0066cc 0%, #004d99 100%);
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .content h2 {
          color: #0066cc;
          margin-top: 0;
          font-size: 24px;
        }
        .content p {
          margin: 15px 0;
          font-size: 16px;
          color: #555;
        }
        .button-container {
          text-align: center;
          margin: 35px 0;
        }
        .verify-button {
          display: inline-block;
          padding: 15px 40px;
          background: linear-gradient(135deg, #0066cc 0%, #004d99 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
          transition: transform 0.2s;
        }
        .verify-button:hover {
          transform: translateY(-2px);
        }
        .alternative-link {
          margin-top: 25px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 5px;
          font-size: 14px;
          word-break: break-all;
        }
        .alternative-link p {
          margin: 5px 0;
          color: #666;
        }
        .alternative-link a {
          color: #0066cc;
          word-break: break-all;
        }
        .footer {
          background: #f8f9fa;
          padding: 25px;
          text-align: center;
          color: #777;
          font-size: 14px;
        }
        .footer p {
          margin: 5px 0;
        }
        .note {
          margin-top: 25px;
          padding: 15px;
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          border-radius: 4px;
          font-size: 14px;
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Bennett University Network</h1>
          <p>Welcome to the Community!</p>
        </div>
        
        <div class="content">
          <h2>Hello ${name || "there"}! 👋</h2>
          
          <p>Thank you for registering with Bennett University Network! We're excited to have you join our community of students, professors, and alumni.</p>
          
          <p>To complete your registration and start connecting with the Bennett community, please verify your email address by clicking the button below:</p>
          
          <div class="button-container">
            <a href="${verificationUrl}" class="verify-button">Verify My Email</a>
          </div>
          
          <div class="note">
            <strong>⏰ Important:</strong> This verification link will expire in 24 hours for security purposes.
          </div>
          
          <div class="alternative-link">
            <p><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          </div>
          
          <p>Once verified, you'll be able to:</p>
          <ul>
            <li>✅ Connect with students, professors, and alumni</li>
            <li>✅ Share your achievements and posts</li>
            <li>✅ Explore job opportunities</li>
            <li>✅ Engage with the Bennett community</li>
          </ul>
        </div>
        
        <div class="footer">
          <p><strong>Bennett University Network</strong></p>
          <p>If you didn't create an account, please ignore this email.</p>
          <p style="margin-top: 15px; font-size: 12px; color: #999;">
            This is an automated email, please do not reply.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getWelcomeEmailTemplate = (name, role) => {
  const roleEmojis = {
    student: "🎓",
    professor: "👨‍🏫",
    alumni: "🎯",
  };

  const roleMessages = {
    student:
      "As a student, you can connect with peers, professors, and alumni to enhance your learning experience.",
    professor:
      "As a professor, you can mentor students, share knowledge, and collaborate with fellow educators.",
    alumni:
      "As an alumni, you can give back to the community, mentor students, and stay connected with Bennett.",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Bennett Network</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #0066cc 0%, #004d99 100%);
          color: #ffffff;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
        }
        .emoji {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .content {
          padding: 40px 30px;
        }
        .content h2 {
          color: #0066cc;
          margin-top: 0;
          font-size: 24px;
        }
        .content p {
          margin: 15px 0;
          font-size: 16px;
          color: #555;
        }
        .feature-box {
          background: #f8f9fa;
          border-left: 4px solid #0066cc;
          padding: 20px;
          margin: 25px 0;
          border-radius: 5px;
        }
        .feature-box h3 {
          margin-top: 0;
          color: #0066cc;
          font-size: 18px;
        }
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 15px 0;
        }
        .feature-list li {
          padding: 10px 0;
          border-bottom: 1px solid #e9ecef;
          font-size: 15px;
        }
        .feature-list li:last-child {
          border-bottom: none;
        }
        .cta-button {
          display: inline-block;
          padding: 15px 40px;
          background: linear-gradient(135deg, #0066cc 0%, #004d99 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 25px;
          text-align: center;
          color: #777;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">${roleEmojis[role] || "🎓"}</div>
          <h1>Welcome to Bennett Network!</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${name}! 🎉</h2>
          
          <p><strong>Congratulations!</strong> Your email has been verified successfully. You're now part of the Bennett University Network!</p>
          
          <p>${roleMessages[role] || roleMessages.student}</p>
          
          <div class="feature-box">
            <h3>What You Can Do Now:</h3>
            <ul class="feature-list">
              <li>📝 Complete your profile with your details and achievements</li>
              <li>🤝 Connect with students, professors, and alumni</li>
              <li>📰 Share posts, articles, and achievements</li>
              <li>💼 Explore job and internship opportunities</li>
              <li>💬 Engage with the community through comments and likes</li>
              <li>🔔 Stay updated with notifications</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:5173"
            }" class="cta-button">Go to Dashboard</a>
          </div>
          
          <p style="margin-top: 30px;">If you have any questions or need assistance, feel free to reach out to our support team.</p>
        </div>
        
        <div class="footer">
          <p><strong>Bennett University Network</strong></p>
          <p>Building a stronger Bennett community, together.</p>
          <p style="margin-top: 15px; font-size: 12px; color: #999;">
            © 2025 Bennett University. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getLoginNotificationTemplate = (
  name,
  loginTime,
  ipAddress,
  userAgent
) => {
  // Extract device info from user agent
  let device = "Unknown Device";
  let browser = "Unknown Browser";

  if (userAgent) {
    if (userAgent.includes("Windows")) device = "Windows PC";
    else if (userAgent.includes("Mac")) device = "Mac";
    else if (userAgent.includes("Linux")) device = "Linux PC";
    else if (userAgent.includes("iPhone")) device = "iPhone";
    else if (userAgent.includes("iPad")) device = "iPad";
    else if (userAgent.includes("Android")) device = "Android Device";

    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
      browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Login Alert</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #0066cc 0%, #004d99 100%);
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .alert-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .content {
          padding: 40px 30px;
        }
        .content h2 {
          color: #0066cc;
          margin-top: 0;
          font-size: 24px;
        }
        .content p {
          margin: 15px 0;
          font-size: 16px;
          color: #555;
        }
        .info-box {
          background: #f8f9fa;
          border-left: 4px solid #0066cc;
          padding: 20px;
          margin: 25px 0;
          border-radius: 5px;
        }
        .info-box h3 {
          margin-top: 0;
          color: #0066cc;
          font-size: 18px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: bold;
          color: #666;
        }
        .info-value {
          color: #333;
        }
        .security-note {
          margin-top: 25px;
          padding: 15px;
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          border-radius: 4px;
          font-size: 14px;
          color: #856404;
        }
        .footer {
          background: #f8f9fa;
          padding: 25px;
          text-align: center;
          color: #777;
          font-size: 14px;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="alert-icon">🔐</div>
          <h1>New Login Detected</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${name}! 👋</h2>
          
          <p>We detected a new login to your Bennett University Network account. If this was you, you can safely ignore this email.</p>
          
          <div class="info-box">
            <h3>Login Details:</h3>
            <div class="info-row">
              <span class="info-label">Time:</span>
              <span class="info-value">${loginTime}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Device:</span>
              <span class="info-value">${device}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Browser:</span>
              <span class="info-value">${browser}</span>
            </div>
            <div class="info-row">
              <span class="info-label">IP Address:</span>
              <span class="info-value">${ipAddress || "Not available"}</span>
            </div>
          </div>
          
          <div class="security-note">
            <strong>⚠️ Security Alert:</strong> If you did not perform this login, please secure your account immediately by:
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Changing your password</li>
              <li>Reviewing recent account activity</li>
              <li>Contacting our support team</li>
            </ul>
          </div>
          
          <p style="margin-top: 25px;">For your security, we recommend:</p>
          <ul>
            <li>✅ Use a strong, unique password</li>
            <li>✅ Don't share your login credentials</li>
            <li>✅ Log out from shared devices</li>
            <li>✅ Keep your account information up to date</li>
          </ul>
        </div>
        
        <div class="footer">
          <p><strong>Bennett University Network</strong></p>
          <p>This is a security notification email.</p>
          <p style="margin-top: 15px; font-size: 12px; color: #999;">
            If you have any concerns, please contact our support team immediately.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getVerificationEmailTemplate,
  getWelcomeEmailTemplate,
  getLoginNotificationTemplate,
};
