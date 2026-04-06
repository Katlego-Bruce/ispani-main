const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const jobsController = require('./jobs.controller');

// ─── All routes require authentication ─────────────────────────
router.use(authenticate);

router.post('/', validate({
  title: { required: true, type: 'string' },
  description: { required: true, type: 'string' },
  payment_amount: { required: true, type: 'number', min: 50 },
}), jobsController.create);

router.get('/', jobsController.listJobs);
router.get('/:id', jobsController.getJobById);
router.patch('/:id', jobsController.updateJob);
router.patch('/:id/assign', jobsController.assignWorker);
router.patch('/:id/complete', jobsController.completeJob);

module.exports = router;
