function authorize(...allowedTypes) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (!allowedTypes.includes(req.user.type)) return res.status(403).json({ error: 'Insufficient permissions' });
    next();
  };
}

function ownerOrAdmin(paramName = 'id') {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const resourceId = req.params[paramName];
    if (req.user.id !== resourceId && req.user.type !== 'admin') {
      return res.status(403).json({ error: 'You can only modify your own resources' });
    }
    next();
  };
}

module.exports = { authorize, ownerOrAdmin };
