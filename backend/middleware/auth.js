import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'society-management-secret-key-2025';

export function generateToken(user) {
  return jwt.sign({ id: user.id, userId: user.userId, name: user.name, role: user.role, societyId: user.societyId }, JWT_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next(); // Allow unauthenticated for some routes
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (e) { /* token invalid, continue without user */ }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Admin access required' });
  next();
}
