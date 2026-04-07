const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const c = require('./consent.controller');
router.post('/', authenticate, c.give);
router.get('/', authenticate, c.list);
router.post('/:id/withdraw', authenticate, c.withdraw);
module.exports = router;
