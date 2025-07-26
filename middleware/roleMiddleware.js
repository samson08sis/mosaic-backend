const User = require("../models/User");

exports.authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.userId)
      return res.status(403).json({ message: "No role selected" });
    try {
      const role = await User.findById(req.userId).select("role");
      if (!allowedRoles.includes(role))
        return res.status(403).json({ message: "Access denied" });
      next();
    } catch (err) {
      console.log(err.message);
    }
  };
};
