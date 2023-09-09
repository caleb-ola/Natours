const express = require('express');

const router = express.Router();
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
} = require('../controllers/viewsController');
const { protect, ISLoggedIn } = require('../controllers/authController');

// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Power House',
//     user: 'Caleb',
//   });
// });

router.get('/', ISLoggedIn, getOverview);
router.get('/tours', ISLoggedIn, getOverview);
router.get('/tours/:slug', ISLoggedIn, getTour);
router.get('/login', ISLoggedIn, getLoginForm);
router.get('/me', protect, getAccount);

router.post('/submit-user-data', protect, updateUserData);

module.exports = router;
