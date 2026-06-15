const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, checkAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/reports/volunteers
 * @desc    Generate volunteer report
 * @access  Private (Admin only)
 */
router.get('/volunteers', verifyToken, checkAdmin, reportController.getVolunteerReport);

/**
 * @route   GET /api/reports/activities
 * @desc    Generate activity report
 * @access  Private (Admin only)
 */
router.get('/activities', verifyToken, checkAdmin, reportController.getActivityReport);

/**
 * @route   GET /api/reports/statistics
 * @desc    Get system statistics
 * @access  Private (Admin only)
 */
router.get('/statistics', verifyToken, checkAdmin, reportController.getStatistics);

/**
 * @route   GET /api/reports/export-csv
 * @desc    Export volunteer data as CSV
 * @access  Private (Admin only)
 */
router.get('/export-csv', verifyToken, checkAdmin, reportController.exportCSV);

/**
 * @route   GET /api/reports/export-pdf
 * @desc    Export report as PDF
 * @access  Private (Admin only)
 */
router.get('/export-pdf', verifyToken, checkAdmin, reportController.exportPDF);

module.exports = router;
