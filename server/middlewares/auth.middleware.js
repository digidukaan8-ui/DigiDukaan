import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const verifyRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({ success: false, message: "Unauthorized: No token" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (allowedRoles.includes(decoded.role)) {
                req.user = decoded;
                return next();
            }

            return res.status(403).json({ success: false, message: "Forbidden: You are not allowed to access this resource" });
        } catch (error) {
            console.error('Authorization error:', error);
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }
    };
};

export default verifyRole;