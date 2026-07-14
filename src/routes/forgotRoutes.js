const express = require('express');
const router = express.Router();
const {
  requestLink,
  serveResetPage,
  requestOTP,
  verifyOTP,
  requestPush,
  confirmPush,
  checkPushStatus,
  resetPassword,
} = require('../controllers/forgotController');

/**
 * @swagger
 * /api/v1/auth/forgot/link:
 *   post:
 *     summary: Flow 1 - Request password reset via Email Link
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       400:
 *         description: Bad request (Invalid parameters)
 *       404:
 *         description: Not found (User doesn't exist)
 */
router.post('/link', requestLink);

/**
 * @swagger
 * /api/v1/auth/forgot/reset-page:
 *   get:
 *     summary: Flow 1 - Serve the HTML Page to change password
 *     tags: [Password Reset]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The reset password token received in the email
 *     responses:
 *       200:
 *         description: Returns HTML document containing password change form
 */
router.get('/reset-page', serveResetPage);

/**
 * @swagger
 * /api/v1/auth/forgot/otp:
 *   post:
 *     summary: Flow 2 - Request a 6-digit OTP verification code via Email
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP code sent to email
 */
router.post('/otp', requestOTP);

/**
 * @swagger
 * /api/v1/auth/forgot/verify-otp:
 *   post:
 *     summary: Flow 2 - Verify OTP code and retrieve short-lived Reset Token
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 description: 6-digit code sent to email
 *     responses:
 *       200:
 *         description: OTP verified. Returns resetToken to execute final password change.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 resetToken:
 *                   type: string
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-otp', verifyOTP);

/**
 * @swagger
 * /api/v1/auth/forgot/push:
 *   post:
 *     summary: Flow 3 - Initiate password reset request via Push Notification
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Push session created. Check server console for verification instructions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 pushSessionToken:
 *                   type: string
 */
router.post('/push', requestPush);

/**
 * @swagger
 * /api/v1/auth/forgot/push-confirm:
 *   post:
 *     summary: Flow 3 - Simulated Push confirmation tapped on phone ("Yes, it's me")
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pushSessionToken
 *             properties:
 *               pushSessionToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request approved successfully.
 */
router.post('/push-confirm', confirmPush);

/**
 * @swagger
 * /api/v1/auth/forgot/push-status:
 *   post:
 *     summary: Flow 3 - Check push session status. Retrieve Reset Token once approved.
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pushSessionToken
 *             properties:
 *               pushSessionToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns approval status. If approved, returns the resetToken.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                   enum: [pending, approved]
 *                 resetToken:
 *                   type: string
 */
router.post('/push-status', checkPushStatus);

/**
 * @swagger
 * /api/v1/auth/forgot/reset-password:
 *   post:
 *     summary: Unified password change execution using verified tokens (Flow 1, 2, & 3)
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: The resetToken received from verifying the URL, OTP, or Push status.
 *               newPassword:
 *                 type: string
 *                 minimum: 6
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', resetPassword);

module.exports = router;
