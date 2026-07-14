const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  googleAuth,
  appleAuth,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated database ID of the user
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           description: The user's unique email address
 *         authProvider:
 *           type: string
 *           enum: [email, google, apple]
 *           description: The auth registration method
 *         avatar:
 *           type: string
 *           description: The user's avatar image URL
 *         company:
 *           type: string
 *           description: The user's employer or construction company
 *         profession:
 *           type: string
 *           description: The user's professional role (e.g. Architect, Civil Engineer)
 *         phone:
 *           type: string
 *           description: Contact phone number
 *         city:
 *           type: string
 *           description: Home/work city
 *         country:
 *           type: string
 *           description: Country of operation
 *         subscriptionStatus:
 *           type: string
 *           enum: [free, premium]
 *           description: The billing status of the user account
 *         preferredUnits:
 *           type: string
 *           enum: [Metric, Imperial]
 *           description: The user's configuration for measurements
 *         preferredCurrency:
 *           type: string
 *           enum: [PKR, USD, AED]
 *           description: The user's configuration for money and costs
 *         projects:
 *           type: array
 *           items:
 *             type: string
 *           description: List of linked Project IDs
 *         reports:
 *           type: array
 *           items:
 *             type: string
 *           description: List of linked Report IDs
 *         calculations:
 *           type: array
 *           items:
 *             type: string
 *           description: List of linked Calculation IDs
 *       example:
 *         id: 60d21b4667d0d8992e610c85
 *         name: John Doe
 *         email: johndoe@example.com
 *         authProvider: email
 *         avatar: ""
 *         company: BuildMate Construction
 *         profession: Civil Engineer
 *         phone: "+1234567890"
 *         city: New York
 *         country: USA
 *         subscriptionStatus: free
 *         preferredUnits: Metric
 *         preferredCurrency: PKR
 *         projects: []
 *         reports: []
 *         calculations: []
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         token:
 *           type: string
 *           description: JWT token for API authorization
 *         user:
 *           $ref: '#/components/schemas/User'
 *       example:
 *         success: true
 *         token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           id: 60d21b4667d0d8992e610c85
 *           name: John Doe
 *           email: johndoe@example.com
 *           authProvider: email
 *           avatar: ""
 */

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user with Email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minimum: 6
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad Request (Invalid parameters or email already exists)
 */
router.post('/signup', signup);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in with Email & Password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Unauthorized (Invalid credentials)
 */
router.post('/login', login);

/**
 * @swagger
 * /api/v1/auth/google:
 *   post:
 *     summary: Log in or Sign up with Google OAuth ID Token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: The Google OAuth idToken. Pass 'test-google-token' in development to bypass validation.
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad Request (Missing token or validation failed)
 */
router.post('/google', googleAuth);

/**
 * @swagger
 * /api/v1/auth/apple:
 *   post:
 *     summary: Log in or Sign up with Apple Identity Token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identityToken
 *             properties:
 *               identityToken:
 *                 type: string
 *                 description: The Apple Identity Token. Pass 'test-apple-token' in development to bypass validation.
 *               name:
 *                 type: string
 *                 description: Optional user name (passed from Apple SDK on first login)
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad Request (Missing token or validation failed)
 */
router.post('/apple', appleAuth);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get currently authenticated user details
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized (Token missing or validation failed)
 */
router.get('/me', protect, getMe);

module.exports = router;
