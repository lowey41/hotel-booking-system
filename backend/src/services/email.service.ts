import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const templates: Record<string, (data: Record<string, unknown>) => string> = {
  welcome: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 40px; text-align: center;">
        <h1 style="color: #f59e0b; margin: 0;">StayWise</h1>
      </div>
      <div style="padding: 40px; background: #ffffff;">
        <h2>Welcome, ${data.name}! 🎉</h2>
        <p>We're thrilled to have you join StayWise. Start exploring thousands of amazing hotels worldwide.</p>
        <a href="${process.env.FRONTEND_URL}/hotels" 
           style="display: inline-block; background: #f59e0b; color: #000; padding: 12px 28px; 
                  text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px;">
          Explore Hotels
        </a>
      </div>
      <div style="padding: 20px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 12px;">
        © 2026 StayWise. All rights reserved.
      </div>
    </div>
  `,

  'booking-confirmation': (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 40px; text-align: center;">
        <h1 style="color: #f59e0b; margin: 0;">StayWise</h1>
        <p style="color: #d1d5db; margin-top: 8px;">Booking Confirmation</p>
      </div>
      <div style="padding: 40px; background: #ffffff;">
        <h2>Your booking is confirmed! ✅</h2>
        <p>Hi ${data.name}, your reservation at <strong>${data.hotelName}</strong> is confirmed.</p>
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Hotel</td><td style="padding: 8px 0; font-weight: bold;">${data.hotelName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Room</td><td style="padding: 8px 0; font-weight: bold;">${data.roomName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Check-in</td><td style="padding: 8px 0; font-weight: bold;">${data.checkIn}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Check-out</td><td style="padding: 8px 0; font-weight: bold;">${data.checkOut}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Total</td><td style="padding: 8px 0; font-weight: bold; color: #f59e0b;">$${data.totalPrice}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Booking ID</td><td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${data.bookingId}</td></tr>
          </table>
        </div>
        ${data.qrCode ? `<div style="text-align: center; margin: 20px 0;"><p style="color: #6b7280;">Your check-in QR code:</p><img src="${data.qrCode}" style="width: 150px; height: 150px;" /></div>` : ''}
        <a href="${process.env.FRONTEND_URL}/bookings/${data.bookingId}"
           style="display: inline-block; background: #f59e0b; color: #000; padding: 12px 28px;
                  text-decoration: none; border-radius: 6px; font-weight: bold;">
          View Booking
        </a>
      </div>
    </div>
  `,

  'booking-cancellation': (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc2626; padding: 40px; text-align: center;">
        <h1 style="color: #fff; margin: 0;">StayWise</h1>
        <p style="color: #fca5a5;">Booking Cancelled</p>
      </div>
      <div style="padding: 40px; background: #ffffff;">
        <h2>Your booking has been cancelled</h2>
        <p>Hi ${data.name}, your reservation at <strong>${data.hotelName}</strong> has been cancelled.</p>
        <p>Refund amount: <strong style="color: #16a34a;">$${data.refundAmount}</strong></p>
        <p style="color: #6b7280; font-size: 14px;">Refunds may take 5-10 business days to appear on your statement.</p>
      </div>
    </div>
  `,
};

export const sendEmail = async ({ to, subject, template, data }: EmailOptions): Promise<void> => {
  try {
    const html = templates[template]?.(data) || `<p>${JSON.stringify(data)}</p>`;

    await transporter.sendMail({
      from: `"StayWise" <${process.env.FROM_EMAIL || 'noreply@staywise.com'}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email sent: ${subject} → ${to}`);
  } catch (error) {
    logger.error('Failed to send email', { error, to, subject });
    // Don't throw - email failures shouldn't break the main flow
  }
};
