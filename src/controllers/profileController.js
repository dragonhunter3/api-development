const User = require('../models/User');

// @desc    Get currently authenticated user's profile
// @route   GET /api/v1/profile
// @access  Private (Requires JWT)
exports.getProfile = async (req, res, next) => {
  try {
    // req.user is loaded in authMiddleware
    res.status(200).json({
      success: true,
      profile: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile data
// @route   PUT /api/v1/profile
// @access  Private (Requires JWT)
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = [
      'name',
      'avatar',
      'company',
      'profession',
      'phone',
      'city',
      'country',
      'subscriptionStatus',
      'preferredUnits',
      'preferredCurrency',
    ];

    const updates = {};
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/v1/profile
// @access  Private (Requires JWT)
exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully. All user records have been removed.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture (avatar)
// @route   PUT /api/v1/profile/avatar
// @access  Private (Requires JWT)
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    // Construct public avatar URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Update database
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatar: fileUrl } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      avatar: user.avatar,
      profile: user,
    });
  } catch (error) {
    next(error);
  }
};
