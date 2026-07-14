const User = require('../models/User');
const sendEmail = require('../config/email');
const crypto = require('crypto');
const path = require('path');

// Helper to hash plain tokens for database storage
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// @desc    1. Request password reset via Email Link
// @route   POST /api/v1/auth/forgot/link
// @access  Public
exports.requestLink = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide an email address' });
    }

    const user = await User.findOne({ email, authProvider: 'email' });
    if (!user) {
      return res.status(404).json({ success: false, error: 'No email-registered account found with this email' });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set expires parameters (10 mins)
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Create reset URL targeting web page
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/forgot/reset-page?token=${resetToken}`;

    const message = `You are receiving this email because you requested a password reset. Please click on the link below to change your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #ff416c;">Password Reset Request</h2>
        <p>You requested a password reset. Please click the button below to update your password:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%); color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #9ca3af; font-size: 0.85rem;">This link is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request (Link)',
        message,
        html,
      });

      res.status(200).json({ success: true, message: 'Password reset link sent to email' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ success: false, error: 'Email could not be sent', details: err.message });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Serve Password Reset Web Page Form
// @route   GET /api/v1/auth/forgot/reset-page
// @access  Public
exports.serveResetPage = async (req, res, next) => {
  try {
    const filePath = path.join(__dirname, '../views/resetPassword.html');
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

// @desc    2. Request password reset via Email OTP
// @route   POST /api/v1/auth/forgot/otp
// @access  Public
exports.requestOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide an email address' });
    }

    const user = await User.findOne({ email, authProvider: 'email' });
    if (!user) {
      return res.status(404).json({ success: false, error: 'No email-registered account found with this email' });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash and store OTP (10 mins)
    user.resetPasswordOTP = hashToken(otp);
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const message = `Your password reset verification code is:\n\n${otp}\n\nThis code will expire in 10 minutes. If you did not request this, please ignore this email.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #ff416c;">Password Reset OTP</h2>
        <p>Use the following 6-digit verification code to reset your password:</p>
        <div style="margin: 30px 0; text-align: center; background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 2rem; font-weight: bold; letter-spacing: 5px; color: #111827;">
          ${otp}
        </div>
        <p style="color: #9ca3af; font-size: 0.85rem;">This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset OTP Code',
        message,
        html,
      });

      res.status(200).json({ success: true, message: 'Password reset OTP sent to email' });
    } catch (err) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpires = undefined;
      await user.save();
      return res.status(500).json({ success: false, error: 'OTP email could not be sent', details: err.message });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP code and return short-lived Reset Token
// @route   POST /api/v1/auth/forgot/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Please provide email and OTP' });
    }

    const user = await User.findOne({ 
      email, 
      authProvider: 'email',
      resetPasswordOTP: hashToken(otp),
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP code' });
    }

    // OTP verified: clear fields and generate short-lived URL-grade Reset Token
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    3. Request password reset via Push Notification session
// @route   POST /api/v1/auth/forgot/push
// @access  Public
exports.requestPush = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide an email address' });
    }

    const user = await User.findOne({ email, authProvider: 'email' });
    if (!user) {
      return res.status(404).json({ success: false, error: 'No email-registered account found with this email' });
    }

    // Generate push session token
    const pushSessionToken = crypto.randomBytes(24).toString('hex');

    // Create session in user model
    user.pushResetSession = {
      token: hashToken(pushSessionToken),
      status: 'pending',
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    await user.save();

    // Log the simulation details for terminal testing
    console.log('\n==================================================');
    console.log('🔔 [SIMULATED PUSH NOTIFICATION SENT]');
    console.log(`To Device Registered For: ${user.email}`);
    console.log('Message: "Is it you trying to reset your password?"');
    console.log(`To Confirm, POST to /push-confirm with token: ${pushSessionToken}`);
    console.log('==================================================\n');

    res.status(200).json({
      success: true,
      message: 'Simulated push notification dispatched to registered devices.',
      pushSessionToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate push client confirm button click ("Yes, it's me")
// @route   POST /api/v1/auth/forgot/push-confirm
// @access  Public
exports.confirmPush = async (req, res, next) => {
  try {
    const { pushSessionToken } = req.body;

    if (!pushSessionToken) {
      return res.status(400).json({ success: false, error: 'Session token is required' });
    }

    const user = await User.findOne({
      'pushResetSession.token': hashToken(pushSessionToken),
      'pushResetSession.expiresAt': { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired push reset session' });
    }

    // Set state status to approved
    user.pushResetSession.status = 'approved';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Push reset session approved successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Poll/Check push status. If approved, return short-lived Reset Token
// @route   POST /api/v1/auth/forgot/push-status
// @access  Public
exports.checkPushStatus = async (req, res, next) => {
  try {
    const { pushSessionToken } = req.body;

    if (!pushSessionToken) {
      return res.status(400).json({ success: false, error: 'Session token is required' });
    }

    const user = await User.findOne({
      'pushResetSession.token': hashToken(pushSessionToken),
      'pushResetSession.expiresAt': { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired push reset session' });
    }

    if (user.pushResetSession.status !== 'approved') {
      return res.status(200).json({
        success: true,
        status: 'pending',
        message: 'Awaiting confirmation on device.',
      });
    }

    // Approved: clear session parameters and return a temporary reset token
    user.pushResetSession = {
      token: null,
      status: 'pending',
      expiresAt: null,
    };

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    res.status(200).json({
      success: true,
      status: 'approved',
      message: 'Push request approved.',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unified endpoint to reset password using token (Flow 1, 2, and 3)
// @route   POST /api/v1/auth/forgot/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Please provide token and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({
      resetPasswordToken: hashToken(token),
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired password reset token' });
    }

    // Hash password and clean temporary db reset fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new credentials.',
    });
  } catch (error) {
    next(error);
  }
};
