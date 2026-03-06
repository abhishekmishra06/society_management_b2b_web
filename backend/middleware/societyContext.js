export function societyContext(req, res, next) {
  req.societyId = req.headers['x-society-id'] || req.query.societyId || req.user?.societyId || null;
  next();
}

export function requireSociety(req, res, next) {
  if (!req.societyId) return res.status(400).json({ error: 'Society ID required. Pass x-society-id header.' });
  next();
}
