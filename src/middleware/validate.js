/**
 * Request Validation Middleware
 * Validates request body fields and returns errors if invalid.
 *
 * Usage:
 *   validate({
 *     email: { required: true, type: 'string', match: /^\S+@\S+\.\S+$/ },
 *     password: { required: true, type: 'string', minLength: 8 },
 *   })
 */
function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value === undefined || value === null) continue;

      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be a ${rules.type}`);
      }

      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }

      if (rules.match && !rules.match.test(value)) {
        errors.push(`${field} format is invalid`);
      }

      if (rules.oneOf && !rules.oneOf.includes(value)) {
        errors.push(`${field} must be one of: ${rules.oneOf.join(', ')}`);
      }

      if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    next();
  };
}

module.exports = { validate };
