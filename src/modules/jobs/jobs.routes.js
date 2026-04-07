const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { authorize } = require('../../middleware/authorize');
const c = require('./jobs.controller');

router.post('/', authenticate, authorize('client', 'admin'), validate({ title: { required: true, type: 'string', minLength: 3 }, description: { required: true, type: 'string', minLength: 10 }, payment_amount: { required: true, type: 'number', min: 1 } }), c.create);
router.post('/:id/publish', authenticate, c.publish);
router.post('/:id/start', authenticate, c.startJob);
router.post('/:id/assign', authenticate, c.assignWorker);
router.post('/:id/complete', authenticate, c.completeJob);
router.get('/', authenticate, c.listJobs);
router.get('/:id', authenticate, c.getJobById);
router.patch('/:id', authenticate, c.updateJob);

module.exports = router;
