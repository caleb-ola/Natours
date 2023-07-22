const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');
const {
  deleteTour,
  getAllTours,
  getTour,
  addTour,
  updateTour,
  getTopCheap,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');

const router = express.Router();

// router.param('id', checkId);
router.use('/:tourID/review', reviewRouter);
router.route('/top-5-cheap').get(getTopCheap, getAllTours);
router.route('/tour-stats').get(getTourStats);
router
  .route(`/monthly-plan/:year`)
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), addTour);
router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
