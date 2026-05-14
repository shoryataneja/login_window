const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { updateProfile, uploadAvatar, changePassword, getLoginActivity } = require('../controllers/userController');

const router = express.Router();

router.use(protect);
router.put('/profile', updateProfile);
router.put('/avatar', upload.single('avatar'), uploadAvatar);
router.put('/change-password', changePassword);
router.get('/activity', getLoginActivity);

module.exports = router;
