const express = require('express');

const router = express.Router();
const {
  getOverview,
  getTour,
  getLoginForm,
} = require('../controllers/viewsController');
const { protect, ISLoggedIn } = require('../controllers/authController');

// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Power House',
//     user: 'Caleb',
//   });
// });
router.use(ISLoggedIn);

router.get('/', getOverview);
router.get('/tours', getOverview);
router.get('/tours/:slug', getTour);
router.get('/login', getLoginForm);

module.exports = router;
