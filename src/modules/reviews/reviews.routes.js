const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const c = require('./reviews.controller');
router.post('/', authenticate, validate({ job_id: { required: true, type: 'string' }, reviewee_id: { required: true, type: 'string' }, rating: { required: true, type: 'number', min: 1 } }), c.create);
router.get('/user/:userId', authenticate, c.getByUser);
module.exports = router;
