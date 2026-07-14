const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  deleteAccount,
  uploadAvatar,
} = require('../controllers/profileController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     summary: Fetch authenticated user's profile details
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 profile:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized (Token missing or validation failed)
 */
router.get('/', protect, getProfile);

/**
 * @swagger
 * /api/v1/profile:
 *   put:
 *     summary: Update authenticated user's profile parameters
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *               company:
 *                 type: string
 *               profession:
 *                 type: string
 *               phone:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               subscriptionStatus:
 *                 type: string
 *                 enum: [free, premium]
 *               preferredUnits:
 *                 type: string
 *                 enum: [Metric, Imperial]
 *               preferredCurrency:
 *                 type: string
 *                 enum: [PKR, USD, AED]
 *             example:
 *               name: John Builders
 *               company: BuildMate Construction
 *               profession: Civil Engineer
 *               phone: "+1234567890"
 *               city: New York
 *               country: USA
 *               subscriptionStatus: premium
 *               preferredUnits: Metric
 *               preferredCurrency: PKR
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 profile:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.put('/', protect, updateProfile);

/**
 * @swagger
 * /api/v1/profile:
 *   delete:
 *     summary: Irreversibly delete authenticated user account
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account successfully deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/', protect, deleteAccount);

/**
 * @swagger
 * /api/v1/profile/avatar:
 *   put:
 *     summary: Upload and update user profile avatar picture
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (JPEG, PNG, GIF, etc. max 5MB)
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                 profile:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad Request (No file uploaded or invalid file format)
 *       401:
 *         description: Unauthorized
 */
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
