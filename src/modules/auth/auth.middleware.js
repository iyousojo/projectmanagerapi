const jwt = require("jsonwebtoken");
const AuthRepository = require("./auth.repository");

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ status: "error", message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AuthRepository.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ status: "error", message: "User not found" });
    }

    req.user = user;
    next(); 
  } catch (err) {
    return res.status(401).json({ status: "error", message: "Invalid or expired token" });
  }
};

const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ status: "error", message: "Access denied" });
    }
    next();
  };
};

module.exports = { protect, roleMiddleware };