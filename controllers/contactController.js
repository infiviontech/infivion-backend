/**
 * Contact Controller
 * Handles OTP generation, verification, and form submission
 */

const bcrypt = require('bcryptjs');
const { Resend } = require('resend');
const validator = require('validator');
const Otp = require('../models/Otp');
const Contact = require('../models/Contact');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate Message ID
 * Format: infivion-YYYY-MMDD-HHMMSS
 */
function generateMessageId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `infivion-${year}-${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Send OTP Email to User (Resend - no SMTP, works on Render)
 */
async function sendOtpEmail(email, otp, name) {
    const { data, error } = await resend.emails.send({
        from: 'Infivion Technologies <onboarding@resend.dev>',
        to: [email],
        subject: 'Your OTP for Infivion Technologies Contact Form',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #1e3a5f; margin: 0;">Infivion Technologies</h1>
                    <p style="color: #666; margin: 5px 0;">Email Verification</p>
                </div>
                
                <p style="color: #333; font-size: 16px;">Hello ${name || 'there'},</p>
                
                <p style="color: #333; font-size: 16px;">Your OTP for email verification is:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; background-color: #1e3a5f; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px;">
                        ${otp}
                    </div>
                </div>
                
                <p style="color: #666; font-size: 14px;">This OTP is valid for <strong>5 minutes</strong>.</p>
                
                <p style="color: #666; font-size: 14px;">If you didn't request this OTP, please ignore this email.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    &copy; ${new Date().getFullYear()} Infivion Technologies. All rights reserved.
                </p>
            </div>
        `
    });

    if (error) throw new Error(error.message);
    return data;
}

/**
 * Send Contact Form Email to Company (Resend)
 */
async function sendContactEmail(contactData) {
    const userTypeLabel = contactData.userType === 'student' ? 'Student' : 'Company / Organization';
    const affiliationLabel = contactData.userType === 'student' ? 'Institution' : 'Organization';
    const affiliationValue = contactData.userType === 'student' ? contactData.institution : contactData.organization;
    
    const { data, error } = await resend.emails.send({
        from: 'Infivion Contact Form <onboarding@resend.dev>',
        to: ['infiviontech@gmail.com'],
        subject: `[${contactData.messageId}] New Contact from ${contactData.fullName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #1e3a5f; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-size: 20px;">New Contact Form Submission</h1>
                    <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">Message ID: ${contactData.messageId}</p>
                </div>
                
                <div style="border: 1px solid #eee; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; width: 140px;">Full Name</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333; font-weight: 500;">${contactData.fullName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Email</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;"><a href="mailto:${contactData.email}" style="color: #1e3a5f;">${contactData.email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Phone</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${contactData.phone}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Category</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">
                                <span style="background-color: ${contactData.userType === 'student' ? '#e3f2fd' : '#e8f5e9'}; color: ${contactData.userType === 'student' ? '#1565c0' : '#2e7d32'}; padding: 4px 12px; border-radius: 20px; font-size: 13px;">
                                    ${userTypeLabel}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">${affiliationLabel}</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${affiliationValue || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Submitted At</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                        </tr>
                    </table>
                    
                    <div style="margin-top: 20px;">
                        <h3 style="color: #1e3a5f; margin: 0 0 10px; font-size: 16px;">Message</h3>
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; color: #333; line-height: 1.6;">
                            ${contactData.message.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                        <a href="mailto:${contactData.email}?subject=Re: Your inquiry to Infivion Technologies [${contactData.messageId}]" 
                           style="display: inline-block; background-color: #1e3a5f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 14px;">
                            Reply to ${contactData.fullName}
                        </a>
                    </div>
                </div>
                
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
                    This email was sent from the Infivion Technologies website contact form.
                </p>
            </div>
        `
    });

    if (error) throw new Error(error.message);
    return data;
}

/**
 * CONTROLLER: Send OTP
 * POST /api/contact/otp/send
 */
exports.sendOtp = async (req, res) => {
    try {
        const { email, name } = req.body;
        
        // Validate email
        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ error: 'Valid email is required' });
        }
        
        // Delete any existing OTP for this email
        await Otp.deleteMany({ email: email.toLowerCase() });
        
        // Generate new OTP
        const otp = generateOTP();
        
        // Hash OTP before storing
        const salt = await bcrypt.genSalt(10);
        const otpHash = await bcrypt.hash(otp, salt);
        
        // Save hashed OTP to database
        await Otp.create({
            email: email.toLowerCase(),
            otpHash: otpHash
        });
        
        // Send OTP email
        await sendOtpEmail(email, otp, name);
        
        console.log(`✉️ OTP sent to ${email}`);
        
        res.json({
            success: true,
            message: 'OTP sent successfully',
            email: email
        });
        
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }
};

/**
 * CONTROLLER: Verify OTP
 * POST /api/contact/otp/verify
 */
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        // Validate inputs
        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }
        
        // Find OTP record
        const otpRecord = await Otp.findOne({ email: email.toLowerCase() });
        
        if (!otpRecord) {
            return res.status(400).json({ error: 'OTP expired or not found. Please request a new OTP.' });
        }
        
        // Check max attempts
        if (otpRecord.attempts >= 3) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ error: 'Maximum attempts exceeded. Please request a new OTP.' });
        }
        
        // Verify OTP
        const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
        
        if (!isValid) {
            // Increment attempts
            otpRecord.attempts += 1;
            await otpRecord.save();
            
            return res.status(400).json({ 
                error: 'Invalid OTP',
                attemptsLeft: 3 - otpRecord.attempts
            });
        }
        
        // Mark as verified
        otpRecord.verified = true;
        await otpRecord.save();
        
        console.log(`✅ OTP verified for ${email}`);
        
        res.json({
            success: true,
            message: 'OTP verified successfully'
        });
        
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ error: 'Failed to verify OTP. Please try again.' });
    }
};

/**
 * CONTROLLER: Submit Contact Form
 * POST /api/contact/submit
 */
exports.submitContact = async (req, res) => {
    try {
        const { 
            email, 
            fullName, 
            phone, 
            userType, 
            institution, 
            organization, 
            message 
        } = req.body;
        
        // Validate required fields
        if (!email || !fullName || !phone || !userType || !message) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }
        
        // Validate email
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }
        
        // Check OTP verification
        const otpRecord = await Otp.findOne({ 
            email: email.toLowerCase(), 
            verified: true 
        });
        
        if (!otpRecord) {
            return res.status(400).json({ error: 'Email not verified. Please verify OTP first.' });
        }
        
        // Validate conditional fields
        if (userType === 'student' && !institution) {
            return res.status(400).json({ error: 'Institution name is required for students' });
        }
        
        if (userType === 'company' && !organization) {
            return res.status(400).json({ error: 'Organization name is required for companies' });
        }
        
        // Generate message ID
        const messageId = generateMessageId();
        
        // Create contact record
        const contactData = {
            messageId,
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            userType,
            institution: userType === 'student' ? institution?.trim() : null,
            organization: userType === 'company' ? organization?.trim() : null,
            message: message.trim()
        };
        
        // Save to database
        await Contact.create(contactData);
        
        // Send email to company
        await sendContactEmail(contactData);
        
        // Delete used OTP
        await Otp.deleteOne({ _id: otpRecord._id });
        
        console.log(`📨 Contact submitted: ${messageId} from ${email}`);
        
        res.json({
            success: true,
            message: 'Contact form submitted successfully',
            messageId: messageId
        });
        
    } catch (error) {
        console.error('Submit Contact Error:', error);
        res.status(500).json({ error: 'Failed to submit contact form. Please try again.' });
    }
};
