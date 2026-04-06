const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const applicationsController = require('./applications.controller');

// ─── All routes require authentication ─────────────────────────
router.use(authenticate);

// Apply to a job
router.post('/', applicationsController.apply);

// List my applications (as a worker)
router.get('/mine', applicationsController.myApplications);

// List applications for a job (as a client)
router.get('/job/:jobId', applicationsController.jobApplications);

// Accept an application (as a client)
router.patch('/:id/accept', applicationsController.accept);

// Reject an application (as a client)
router.patch('/:id/reject', applicationsController.reject);

// Withdraw an application (as a worker)
router.patch('/:id/withdraw', applicationsController.withdraw);

module.exports = router;
