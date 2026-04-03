import nodemailer from 'nodemailer';
import { SCHOOL_CONFIG } from '@/lib/schoolConfig';

export const sendReceiptEmail = async ({
    to,
    studentName,
    receiptNumber,
    amount,
    date,
    pdfBuffer,
}: {
    to: string;
    studentName: string;
    receiptNumber: string;
    amount: number;
    date: string;
    pdfBuffer: Buffer;
}) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"${SCHOOL_CONFIG.name}" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Payment Receipt Confirmed – ${receiptNumber} | ${SCHOOL_CONFIG.name}`,
        text: `Hi ${studentName},\n\nWe have received your payment of ₹${amount.toLocaleString()}. Your receipt #${receiptNumber} is attached to this email.\n\nDate: ${date}\n\nThank you for your payment.\n\nBest regards,\n${SCHOOL_CONFIG.name}\n${SCHOOL_CONFIG.address}\n${SCHOOL_CONFIG.phone}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <div style="background: #000; padding: 24px 32px; border-bottom: 3px solid #fbbf24;">
                    <h2 style="color: #fff; margin: 0; font-size: 20px;">${SCHOOL_CONFIG.name}</h2>
                    <p style="color: #fbbf24; margin: 4px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Official Payment Receipt</p>
                </div>
                <div style="padding: 32px;">
                    <p>Hi <strong>${studentName}</strong>,</p>
                    <p>Your payment has been successfully processed. Here are the details:</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f9f9f9; border-radius: 8px; overflow: hidden;">
                        <tr>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">Receipt Number</td>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #eee;">${receiptNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #eee; font-weight: bold;">Amount Paid</td>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #eee; color: #16a34a; font-weight: bold;">₹${amount.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 16px; font-weight: bold;">Date</td>
                            <td style="padding: 12px 16px;">${date}</td>
                        </tr>
                    </table>
                    <p>Your official receipt is attached as a PDF to this email. Please keep it for your records.</p>
                    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                        <strong>${SCHOOL_CONFIG.name}</strong><br/>
                        ${SCHOOL_CONFIG.address}<br/>
                        ${SCHOOL_CONFIG.phone} &bull; ${SCHOOL_CONFIG.email}
                    </div>
                </div>
            </div>
        `,
        attachments: [
            {
                filename: `Receipt-${receiptNumber}.pdf`,
                content: pdfBuffer,
            },
        ],
    };

    try {
        console.log(`Attempting to send receipt email to ${to}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending receipt email:', error);
        throw error;
    }
};
