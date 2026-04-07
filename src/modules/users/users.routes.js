const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { authorize, ownerOrAdmin } = require('../../middleware/authorize');
const usersController = require('./users.controller');

router.post('/register', validate({ email: { required: true, type: 'string', match: /^\\S+@\\S+\\.\\S+$/ }, password: { required: true, type: 'string', minLength: 8 } }), usersController.register);
router.post('/login', validate({ email: { required: true, type: 'string' }, password: { required: true, type: 'string' } }), usersController.login);
router.get('/me', authenticate, usersController.getProfile);
router.get('/', authenticate, authorize('admin'), usersController.listUsers);
router.get('/:id', authenticate, usersController.getUserById);
router.patch('/:id', authenticate, ownerOrAdmin('id'), usersController.updateUser);

module.exports = router;
