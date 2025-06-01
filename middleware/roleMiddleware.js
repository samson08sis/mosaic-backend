exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(403).json({ message: "No role selected" });
    if (!allowedRoles.includes(req.user.role))
      return res.status(403).json({ message: "Access denied" });
    next();
  };
};
