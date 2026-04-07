const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const c = require('./notifications.controller');
router.get('/', authenticate, c.list);
router.post('/:id/read', authenticate, c.markRead);
module.exports = router;
