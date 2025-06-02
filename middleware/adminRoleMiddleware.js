exports.checkRoleAndVerify = async (req, res, next) => {
  const { role } = req.body;
  console.log("Role verification middleware");
  // If role is not provided or is 'tourist', skip token verification
  if (!role || role === "tourist") {
    console.log("Role: ", role);
    return next();
  }

  // For non-tourist roles, verify the token
  return verifyToken(req, res, next);
};
