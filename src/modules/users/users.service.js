const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../services/prisma');
const config = require('../../config');
const { ApiError } = require('../../middleware/errorHandler');

const SALT_ROUNDS = 12;

/**
 * Generate a JWT token for a user
 */
function generateToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, type: user.type },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

/**
 * Remove sensitive fields from user object
 */
function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

const usersService = {
  async register({ email, password, first_name, last_name, phone, type }) {
    // Check for existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError(409, 'Email already registered');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        first_name: first_name || null,
        last_name: last_name || null,
        phone: phone || null,
        type: type || 'worker',
      },
    });

    const token = generateToken(user);

    return {
      user: { id: user.id, email: user.email, type: user.type },
      access_token: token,
    };
  },

  async login({ email, password }) {
    // Find user (including password_hash)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const token = generateToken(user);

    return {
      user: { id: user.id, email: user.email, type: user.type },
      access_token: token,
    };
  },

  async findById(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return sanitizeUser(user);
  },

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true, type: true, email: true, phone: true,
          first_name: true, last_name: true, kyc_status: true,
          trust_score: true, created_at: true,
        },
      }),
      prisma.user.count(),
    ]);

    return {
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  },

  async update(id, updateData) {
    // Only allow safe fields
    const allowed = ['first_name', 'last_name', 'phone', 'skills', 'location_lat', 'location_lng'];
    const filtered = {};
    for (const key of allowed) {
      if (updateData[key] !== undefined) {
        filtered[key] = updateData[key];
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: filtered,
    });

    return sanitizeUser(user);
  },
};

module.exports = usersService;
