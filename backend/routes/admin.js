const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, checkAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard data
 * @access  Private (Admin only)
 */
router.get('/dashboard', verifyToken, checkAdmin, adminController.getDashboardStats);

/**
 * @route   GET /api/admin/volunteers
 * @desc    Get all volunteers with admin details
 * @access  Private (Admin only)
 */
router.get('/volunteers', verifyToken, checkAdmin, adminController.getAllVolunteers);

/**
 * @route   POST /api/admin/volunteers/:id/approve
 * @desc    Approve volunteer registration
 * @access  Private (Admin only)
 */
router.post('/volunteers/:id/approve', verifyToken, checkAdmin, adminController.approveVolunteer);

/**
 * @route   POST /api/admin/volunteers/:id/reject
 * @desc    Reject volunteer registration
 * @access  Private (Admin only)
 */
router.post('/volunteers/:id/reject', verifyToken, checkAdmin, adminController.rejectVolunteer);

/**
 * @route   PUT /api/admin/volunteers/:id
 * @desc    Update volunteer details (admin)
 * @access  Private (Admin only)
 */
router.put('/volunteers/:id', verifyToken, checkAdmin, adminController.updateVolunteer);

/**
 * @route   DELETE /api/admin/volunteers/:id
 * @desc    Delete volunteer account (admin)
 * @access  Private (Admin only)
 */
router.delete('/volunteers/:id', verifyToken, checkAdmin, adminController.deleteVolunteer);

/**
 * @route   POST /api/admin/assign-project
 * @desc    Assign volunteer to project
 * @access  Private (Admin only)
 */
router.post('/assign-project', verifyToken, checkAdmin, adminController.assignProject);

module.exports = router;
