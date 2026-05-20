import nodemailer from 'nodemailer';

/**
 * Send email using Nodemailer
 */
export const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define email options
  const mailOptions = {
    from: `Ahmad Costimetics <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

/**
 * Send Verification Code Email
 */
export const sendVerificationEmail = async (email, code, firstName) => {
  const subject = 'Verify your email - Ahmad Costimetics';
  const message = `Hello ${firstName},\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #000;">Ahmad Costimetics</h1>
      </div>
      <h2 style="color: #333;">Verify your email</h2>
      <p>Hello ${firstName || 'User'},</p>
      <p>Thank you for joining Ahmad Costimetics! To complete your registration, please use the following verification code:</p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
        ${code}
      </div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">
        &copy; ${new Date().getFullYear()} Ahmad Costimetics. All rights reserved.
      </p>
    </div>
  `;

  await sendEmail({
    email,
    subject,
    message,
    html,
  });
};
