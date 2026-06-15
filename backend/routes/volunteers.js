const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const { verifyToken } = require('../middleware/auth');

/**
 * @route   GET /api/volunteers/search/query
 * @desc    Search volunteers
 * @access  Private
 * IMPORTANT: Must be before /:id to avoid route shadowing
 */
router.get('/search/query', verifyToken, volunteerController.searchVolunteers);

/**
 * @route   GET /api/volunteers
 * @desc    Get all volunteers (admin only)
 * @access  Private
 */
router.get('/', verifyToken, volunteerController.getAllVolunteers);

/**
 * @route   GET /api/volunteers/:id
 * @desc    Get volunteer by ID
 * @access  Private
 */
router.get('/:id', verifyToken, volunteerController.getVolunteerById);

/**
 * @route   POST /api/volunteers
 * @desc    Register a new volunteer
 * @access  Public
 */
router.post('/', volunteerController.registerVolunteer);

/**
 * @route   PUT /api/volunteers/:id
 * @desc    Update volunteer profile
 * @access  Private
 */
router.put('/:id', verifyToken, volunteerController.updateVolunteer);

/**
 * @route   DELETE /api/volunteers/:id
 * @desc    Delete volunteer
 * @access  Private (Admin only)
 */
router.delete('/:id', verifyToken, volunteerController.deleteVolunteer);

module.exports = router;
