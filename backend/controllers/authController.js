const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, setTokenCookie } = require('../utils/token');
const { sendEmail, verificationEmailHTML, resetEmailHTML } = require('../utils/email');

// @POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    await sendEmail({ to: email, subject: 'Verify your email', html: verificationEmailHTML(name, verifyUrl) });

    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.status(201).json({ user, message: 'Account created. Please verify your email.' });
  } catch (err) {
    next(err);
  }
};

// @POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    user.loginActivity.push({ ip: req.ip, userAgent: req.headers['user-agent'] });
    if (user.loginActivity.length > 10) user.loginActivity.shift();
    await user.save();

    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// @POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out successfully' });
};

// @GET /api/auth/me
const getMe = (req, res) => res.json({ user: req.user });

// @GET /api/auth/google/callback (handled by passport, then this)
const googleCallback = (req, res) => {
  const token = generateToken(req.user._id);
  setTokenCookie(res, token);
  res.redirect(`${process.env.CLIENT_URL}/dashboard`);
};

// @GET /api/auth/verify-email/:token
const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpiry: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification link' });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

// @POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'No account with that email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({ to: user.email, subject: 'Reset your password', html: resetEmailHTML(user.name, resetUrl) });
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
};

// @POST /api/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, logout, getMe, googleCallback, verifyEmail, forgotPassword, resetPassword };
