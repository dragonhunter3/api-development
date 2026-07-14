const Notification = require('../models/Notification');

// @desc    Get all notifications for logged-in user
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };

    // Support optional filtering by read status (?isRead=true/false)
    if (req.query.isRead !== undefined) {
      filter.isRead = req.query.isRead === 'true';
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    // Verify ownership
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this notification' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    // Verify ownership
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this notification' });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a mock notification (Development Testing Helper)
// @route   POST /api/v1/notifications
// @access  Private
exports.createNotification = async (req, res, next) => {
  try {
    const { type, title, message, metadata } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ success: false, error: 'Please provide type, title, and message' });
    }

    const notification = await Notification.create({
      userId: req.user._id,
      type,
      title,
      message,
      metadata: metadata || {},
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification,
    });
  } catch (error) {
    next(error);
  }
};
