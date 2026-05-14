const path = require('path');
const User = require('../models/User');

// @PUT /api/user/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// @PUT /api/user/avatar
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// @PUT /api/user/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user.password) return res.status(400).json({ message: 'Use Google login to change password' });
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

// @GET /api/user/activity
const getLoginActivity = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('loginActivity');
    res.json({ activity: user.loginActivity.reverse() });
  } catch (err) {
    next(err);
  }
};

module.exports = { updateProfile, uploadAvatar, changePassword, getLoginActivity };
