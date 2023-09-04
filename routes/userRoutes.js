const express = require('express');
const router = express.Router();

const {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
  currentUser,
  deleteCurrentUser,
  updateCurrentUser,
} = require('../controllers/userController');

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
  logout,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.use(protect);
router.patch('/update-password', protect, updatePassword);
router.delete('/delete-current-user', protect, deleteCurrentUser);

router.get('/current-user', protect, currentUser);
router.patch('/update-user', protect, updateCurrentUser);

router.use(restrictTo('admin'));
router.route('/').get(getAllUsers).post(createUser);
router
  .route('/:id')
  .get(getUser)
  .delete(protect, restrictTo('admin'), deleteUser)
  .patch(protect, updateUser);

module.exports = router;
