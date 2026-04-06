const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const usersController = require('./users.controller');

// ─── Public Routes ──────────────────────────────────────────────
router.post('/register', validate({
  email: { required: true, type: 'string', match: /^\S+@\S+\.\S+$/ },
  password: { required: true, type: 'string', minLength: 8 },
}), usersController.register);

router.post('/login', validate({
  email: { required: true, type: 'string' },
  password: { required: true, type: 'string' },
}), usersController.login);

// ─── Protected Routes ───────────────────────────────────────────
router.get('/me', authenticate, usersController.getProfile);
router.get('/', authenticate, usersController.listUsers);
router.get('/:id', authenticate, usersController.getUserById);
router.patch('/:id', authenticate, usersController.updateUser);

module.exports = router;
