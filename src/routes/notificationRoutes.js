const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
  markAllAsRead,
  markAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The notification database ID
 *         userId:
 *           type: string
 *           description: Owner user ID
 *         type:
 *           type: string
 *           enum: [Material Price Alerts, Project Reminder, Task Reminder, AI Suggestions, Daily Tips]
 *           description: Notification category type
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         isRead:
 *           type: boolean
 *         metadata:
 *           type: object
 *           description: Flexible JSON object payload mapping
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 60d21b4667d0d8992e610c85
 *         userId: 60d21b4667d0d8992e610c84
 *         type: Material Price Alerts
 *         title: Steel Price Dropped!
 *         message: Steel rates in Lahore just dropped by 5% to PKR 260/kg.
 *         isRead: false
 *         metadata: { "material": "steel", "rate": 260 }
 *         createdAt: 2026-07-14T11:20:00.000Z
 */

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Fetch notifications list for authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isRead
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter notifications by read status
 *     responses:
 *       200:
 *         description: Notifications list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, getNotifications);

/**
 * @swagger
 * /api/v1/notifications:
 *   post:
 *     summary: Create a mock notification for testing
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [Material Price Alerts, Project Reminder, Task Reminder, AI Suggestions, Daily Tips]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               metadata:
 *                 type: object
 *             example:
 *               type: AI Suggestions
 *               title: Concrete Pouring Tips
 *               message: For slab construction in hot weather, we recommend pouring concrete early in the morning to prevent quick drying and cracking.
 *               metadata: { "suggestionId": "ai-con-01" }
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, createNotification);

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/read-all', protect, markAllAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   put:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The notification database ID
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/read', protect, markAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Delete a single notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The notification database ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', protect, deleteNotification);

module.exports = router;
