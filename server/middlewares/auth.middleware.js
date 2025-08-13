import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import User from "../models/user.model";

dotenv.config();

const verifyToken = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken;
        if (!accessToken) {
            return res.status(401).json({ success: false, message: 'Access token missing' });
        }

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        req.user = decoded;
        return next();
    } catch (error) {
        if (error.name !== "TokenExpiredError") {
            return res.status(401).json({ success: false, message: 'Invalid or missing token' });
        }

        try {
            const refreshToken = req.cookies?.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({ success: false, message: 'Refresh token missing' });
            }

            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user = await User.findById(decoded._id);

            if (!user || user.refreshToken !== refreshToken) {
                return res.status(403).json({ success: false, message: 'Invalid refresh token' });
            }

            const newAccessToken = jwt.sign(
                { _id: user._id, role: user.role },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
            );

            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: parseInt(process.env.ACCESS_TOKEN_COOKIE_EXPIRY),
            });

            const newDecoded = jwt.verify(newAccessToken, process.env.ACCESS_TOKEN_SECRET);
            req.user = newDecoded;
            return next();
        } catch (refreshErr) {
            return res.status(401).json({ success: false, message: 'Refresh token expired or invalid' });
        }
    }
}

const verifyRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies?.accessToken;
            if (!token) {
                return res.status(401).json({ success: false, message: "Unauthorized: No token" });
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

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

export { verifyToken, verifyRole };