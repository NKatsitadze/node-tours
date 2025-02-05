const express = require('express')
const { getTopCheapTours, getAllTours, createTour, getTour, updateTour, deleteTour, getTourStats, getMonthlyPlan } = require('../controllers/tourController')
const { protect, restrictTo } = require('../controllers/authController')

const router = express.Router()

router.route('/top-5-cheap').get(protect, getTopCheapTours, getAllTours)
router.route('/tour-stats').get(protect, getTourStats)
router.route('/monthly-plan/:year').get(protect, getMonthlyPlan)

router.route('/').get(protect, getAllTours).post(createTour) // This / is after /api/v1/tours, because we binded this router to it,
router.route('/:id').get(protect, getTour).patch(updateTour).delete(protect, restrictTo(), deleteTour) // same for this path too, also ":" makes id dynamic

module.exports = router
