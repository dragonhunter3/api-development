const express = require('express');
const router = express.Router();
const { getDashboard, updateMaterialPrice } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/v1/dashboard:
 *   get:
 *     summary: Get complete unified dashboard payload for BuildMate Pro
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: city
 *         required: false
 *         schema:
 *           type: string
 *         description: Name of the city for weather updates (default is Lahore, Pakistan)
 *       - in: query
 *         name: timezoneOffset
 *         required: false
 *         schema:
 *           type: string
 *         description: Local timezone offset in minutes (e.g., -300 for GMT+5) to calculate local greeting
 *     responses:
 *       200:
 *         description: Dashboard payload compiled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     greeting:
 *                       type: string
 *                       description: Time-aware personalized greeting
 *                     avatar:
 *                       type: string
 *                       description: User profile picture URL
 *                     unreadNotificationsCount:
 *                       type: integer
 *                     weather:
 *                       type: object
 *                       properties:
 *                         temp:
 *                           type: integer
 *                         condition:
 *                           type: string
 *                         icon:
 *                           type: string
 *                         location:
 *                           type: string
 *                         humidity:
 *                           type: string
 *                         windSpeed:
 *                           type: string
 *                     materialPrices:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           material:
 *                             type: string
 *                           price:
 *                             type: number
 *                           unit:
 *                             type: string
 *                           change:
 *                             type: string
 *                           trend:
 *                             type: string
 *                           displayPrice:
 *                             type: string
 *                     quickTools:
 *                       type: array
 *                       items:
 *                         type: string
 *                     recentProjects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           progress:
 *                             type: integer
 *                           status:
 *                             type: string
 *                     recentActivity:
 *                       type: object
 *                       properties:
 *                         recentCalculations:
 *                           type: array
 *                           items:
 *                             type: object
 *                         recentReports:
 *                           type: array
 *                           items:
 *                             type: object
 *                     aiSuggestion:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                         message:
 *                           type: string
 *                         recommendation:
 *                           type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, getDashboard);

/**
 * @swagger
 * /api/v1/dashboard/materials:
 *   put:
 *     summary: Manually update/override a local material price rate for the active user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - material
 *               - price
 *               - currency
 *             properties:
 *               material:
 *                 type: string
 *                 enum: [Cement, Steel, Sand, Bricks]
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *                 enum: [PKR, USD, AED]
 *             example:
 *               material: Cement
 *               price: 1480
 *               currency: PKR
 *     responses:
 *       200:
 *         description: Price updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 rate:
 *                   type: object
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.put('/materials', protect, updateMaterialPrice);

module.exports = router;
