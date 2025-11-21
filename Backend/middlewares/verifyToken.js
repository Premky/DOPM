import jwt from "jsonwebtoken";

/**
 * Middleware to verify JWT token from either HttpOnly cookie or Authorization header.
 * If valid → attaches user to req.user and refreshes token.
 * If invalid/expired → responds with appropriate status.
 */

const verifyToken = (req, res, next) => {
  try {
    // Get token from cookie or "Authorization: Bearer ..." header
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers["authorization"];
    const headerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    const token = cookieToken || headerToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token expired" });
        }
        console.error("Token verification error:", err.message);
        return res.status(403).json({ message: "Forbidden: Invalid token" });
      }

      // Attach decoded payload (user info) to req.user
      const { exp, iat, ...userData } = decoded;
      req.user = userData;

      // 🔄 Refresh token on every request (optional but helps sliding session)
      const refreshedToken = jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.cookie("token", refreshedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // only HTTPS in prod
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return next();
    });
  } catch (error) {
    console.error("verifyToken middleware error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default verifyToken;
