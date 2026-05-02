import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter - configure for your email provider
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Email theme colors
const theme = {
  primary: '#4979a4',
  secondary: '#6fa3d1',
  gradient: 'linear-gradient(135deg, #4979a4, #6fa3d1)',
  dark: '#1f2937',
  gray: '#6b7280',
  light: '#f9fafb',
};

const getCurrencySymbol = (currency) => {
  const symbols = { USD: '$', GBP: '£', EUR: '€' };
  return symbols[currency] || '$';
};

const formatPrice = (amount, currency = 'USD') => {
  return `${getCurrencySymbol(currency)}${(parseFloat(amount) || 0).toLocaleString()}`;
};

// Email header with logo
const emailHeader = (settings = {}) => {
  const siteName = settings.website_name || 'The Blueground';
  const logoUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/icon.svg`;
  return `
  <div style="background: ${theme.gradient}; padding: 30px; text-align: center;">
    <img src="${logoUrl}" alt="${siteName}" style="height: 40px; margin-bottom: 10px;" />
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Find your perfect home</p>
  </div>
  `;
};

// Email footer
const emailFooter = (settings = {}, year = new Date().getFullYear()) => {
  const siteName = settings.website_name || 'The Blueground';
  return `
  <div style="background: ${theme.dark}; padding: 20px; text-align: center;">
    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
      © ${year} ${siteName}. All rights reserved.
    </p>
    <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 11px;">
      This email was sent to you because of your activity on ${siteName}
    </p>
  </div>
  `;
};

// Generate random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email (registration)
export const sendOTPEmail = async (email, otp, type = 'verification', settings = {}) => {
  const siteName = settings.website_name || 'The Blueground';
  const subject = type === 'verification' ? `Verify your email - ${siteName}` : `Password Reset OTP - ${siteName}`;
  const title = type === 'verification' ? 'Verify Your Email' : 'Reset Your Password';
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || `${siteName} <noreply@stayfinder.com>`,
    to: email,
    subject: subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          ${emailHeader(settings)}
          <div style="padding: 40px 30px;">
            <h2 style="color: ${theme.dark}; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; text-align: center;">${title}</h2>
            <p style="color: ${theme.gray}; margin: 0 0 25px 0; font-size: 15px; line-height: 1.6; text-align: center;">
              Enter the verification code below to complete your ${type === 'verification' ? 'registration' : 'password reset'}.
            </p>
            <div style="background: ${theme.light}; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: ${theme.primary};">${otp}</span>
            </div>
            <p style="color: ${theme.gray}; margin: 0; font-size: 13px; text-align: center;">
              This code will expire in <strong>10 minutes</strong>
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px; text-align: center;">
                If you didn't request this, please ignore this email or contact support if you have concerns.
              </p>
            </div>
          </div>
          ${emailFooter(settings)}
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

// Send password reset link email
export const sendResetLink = async (email, resetToken, settings = {}) => {
  const siteName = settings.website_name || 'The Blueground';
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || `${siteName} <noreply@stayfinder.com>`,
    to: email,
    subject: `Reset Your Password - ${siteName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          ${emailHeader(settings)}
          <div style="padding: 40px 30px;">
            <h2 style="color: ${theme.dark}; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; text-align: center;">Reset Your Password</h2>
            <p style="color: ${theme.gray}; margin: 0 0 25px 0; font-size: 15px; line-height: 1.6; text-align: center;">
              Click the button below to reset your password. This link will expire in <strong>1 hour</strong>.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: ${theme.gradient}; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Reset Password
              </a>
            </div>
            <p style="color: #9ca3af; margin: 0; font-size: 13px; text-align: center;">
              Or copy this link: <br>
              <span style="color: ${theme.primary}; word-break: break-all;">${resetUrl}</span>
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px; text-align: center;">
                If you didn't request this, please ignore this email.
              </p>
            </div>
          </div>
          ${emailFooter(settings)}
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reset link sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

// Send booking confirmation email
export const sendBookingConfirmation = async (email, booking, property, paymentMethods = [], settings = {}) => {
  const siteName = settings.website_name || 'The Blueground';
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || `${siteName} <noreply@stayfinder.com>`,
    to: email,
    subject: `Booking Confirmed - #${booking.id} - ${siteName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          ${emailHeader(settings)}
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 70px; height: 70px; background: ${theme.gradient}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(239,68,68,0.3);">
                <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2 style="color: ${theme.dark}; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">Booking Confirmed!</h2>
              <p style="color: ${theme.gray}; margin: 0; font-size: 15px;">Your booking has been received. Please complete your payment.</p>
            </div>
            
            <!-- Booking Details -->
            <div style="background: ${theme.light}; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: ${theme.dark}; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: ${theme.gray}; font-size: 14px;">Booking ID</td>
                  <td style="padding: 8px 0; text-align: right; color: ${theme.dark}; font-weight: 600; font-size: 14px;">#${booking.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${theme.gray}; font-size: 14px;">Property</td>
                  <td style="padding: 8px 0; text-align: right; color: ${theme.dark}; font-weight: 600; font-size: 14px;">${property?.title || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${theme.gray}; font-size: 14px;">Move In</td>
                  <td style="padding: 8px 0; text-align: right; color: ${theme.dark}; font-size: 14px;">${new Date(booking.move_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${theme.gray}; font-size: 14px;">Move Out</td>
                  <td style="padding: 8px 0; text-align: right; color: ${theme.dark}; font-size: 14px;">${new Date(booking.move_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${theme.gray}; font-size: 14px;">Duration</td>
                  <td style="padding: 8px 0; text-align: right; color: ${theme.dark}; font-size: 14px;">${booking.months} Month${booking.months > 1 ? 's' : ''}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td style="padding: 12px 0 8px 0; color: ${theme.dark}; font-size: 16px; font-weight: 600;">Total Amount</td>
                  <td style="padding: 12px 0 8px 0; text-align: right; color: ${theme.primary}; font-size: 18px; font-weight: bold;">${formatPrice(booking.total_amount, booking.currency)}</td>
                </tr>
              </table>
            </div>

            <!-- Payment Instructions -->
            ${paymentMethods.length > 0 ? `
            <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: ${theme.dark}; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Payment Instructions</h3>
              ${paymentMethods.map(m => `
                <div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 15px; border: 1px solid #e5e7eb;">
                  <h4 style="color: ${theme.primary}; margin: 0 0 8px 0; font-size: 14px;">${m.name}</h4>
                  <div style="font-size: 13px; color: #4b5563;">${m.instructions}</div>
                </div>
              `).join('')}
            </div>` : ''}

            <!-- Payment Proof Request -->
            <div style="background: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid #fcd34d; text-align: center;">
              <p style="color: #92400e; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">
                Please Reply with Payment Proof
              </p>
              <p style="color: #78350f; margin: 0; font-size: 13px; line-height: 1.5;">
                After making the payment, please reply to this email with a screenshot or image of your payment confirmation as proof.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-bookings" style="display: inline-block; background: ${theme.gradient}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
                View Booking Details
              </a>
            </div>
          </div>
          ${emailFooter(settings)}
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

// Send booking approved email
export const sendBookingApproved = async (email, userName, booking, property, settings = {}) => {
  const siteName = settings.website_name || 'The Blueground';
  const mailOptions = {
    from: process.env.EMAIL_FROM || `${siteName} <noreply@stayfinder.com>`,
    to: email,
    subject: `Booking Approved - #${booking.id} - ${siteName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          ${emailHeader(settings)}
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2 style="color: ${theme.dark}; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">Booking Approved!</h2>
              <p style="color: ${theme.gray}; margin: 0; font-size: 15px;">Your booking request has been approved.</p>
            </div>
            
            <div style="background: ${theme.light}; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: ${theme.dark}; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: ${theme.gray}; font-size: 14px;">Booking ID</td>
                  <td style="padding: 8px 0; text-align: right; color: ${theme.dark}; font-weight: 600; font-size: 14px;">#${booking.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${theme.gray}; font-size: 14px;">Property</td>
                  <td style="padding: 8px 0; text-align: right; color: ${theme.dark}; font-weight: 600; font-size: 14px;">${property?.title || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${theme.gray}; font-size: 14px;">Move In</td>
                  <td style="padding: 8px 0; text-align: right; color: ${theme.dark}; font-size: 14px;">${new Date(booking.move_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${theme.gray}; font-size: 14px;">Move Out</td>
                  <td style="padding: 8px 0; text-align: right; color: ${theme.dark}; font-size: 14px;">${new Date(booking.move_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${theme.gray}; font-size: 14px;">Duration</td>
                  <td style="padding: 8px 0; text-align: right; color: ${theme.dark}; font-size: 14px;">${booking.months} Month${booking.months > 1 ? 's' : ''}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td style="padding: 12px 0 8px 0; color: ${theme.dark}; font-size: 16px; font-weight: 600;">Total Amount</td>
                  <td style="padding: 12px 0 8px 0; text-align: right; color: ${theme.primary}; font-size: 18px; font-weight: bold;">${formatPrice(booking.total_amount, booking.currency)}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: ${theme.gray}; margin: 0; font-size: 14px; text-align: center;">
              Thank you for choosing ${siteName}! We hope you enjoy your new home.
            </p>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-bookings" style="display: inline-block; background: ${theme.gradient}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
                View Booking Details
              </a>
            </div>
          </div>
          ${emailFooter(settings)}
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking approved email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

// Send booking rejected email
export const sendBookingRejected = async (email, userName, booking, property, settings = {}) => {
  const siteName = settings.website_name || 'The Blueground';
  const mailOptions = {
    from: process.env.EMAIL_FROM || `${siteName} <noreply@stayfinder.com>`,
    to: email,
    subject: `Booking Update - #${booking.id} - ${siteName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          ${emailHeader(settings)}
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
              <h2 style="color: ${theme.dark}; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">Booking Not Approved</h2>
              <p style="color: ${theme.gray}; margin: 0; font-size: 15px;">Unfortunately, your booking request was not approved.</p>
            </div>
            
            <div style="background: ${theme.light}; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: ${theme.dark}; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: ${theme.gray}; font-size: 14px;">Booking ID</td>
                  <td style="padding: 8px 0; text-align: right; color: ${theme.dark}; font-weight: 600; font-size: 14px;">#${booking.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${theme.gray}; font-size: 14px;">Property</td>
                  <td style="padding: 8px 0; text-align: right; color: ${theme.dark}; font-weight: 600; font-size: 14px;">${property?.title || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${theme.gray}; font-size: 14px;">Location</td>
                  <td style="padding: 8px 0; text-align: right; color: ${theme.dark}; font-size: 14px;">${property?.location || 'N/A'}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: ${theme.gray}; margin: 0; font-size: 14px; text-align: center;">
              We apologize for any inconvenience. Please feel free to browse other properties or contact our support team for more information.
            </p>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/properties" style="display: inline-block; background: ${theme.gradient}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
                Browse Properties
              </a>
            </div>
          </div>
          ${emailFooter(settings)}
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking rejected email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};