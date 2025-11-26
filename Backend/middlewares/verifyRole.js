// verifyRole.js (backend - Node.js)
export const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role_name;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};
