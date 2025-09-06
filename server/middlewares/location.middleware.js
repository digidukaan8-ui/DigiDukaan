import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const checkRole = (token, secret) => {
    try {
        const decode = jwt.verify(token, secret);
        return decode.role;
    } catch {
        return null;
    }
}

const handleLocationAccess = (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        const roles = ['seller', 'admin'];
        if (accessToken && roles.includes(checkRole(accessToken, process.env.ACCESS_TOKEN_SECRET))) {
            return res.status(403).json({success:false, message:'Create a buyer account'});
        }

        if (refreshToken && roles.includes(checkRole(refreshToken, process.env.REFRESH_TOKEN_SECRET))) {
            return res.status(403).json({success:false, message:'Create a buyer account'});
        }

        next();
    } catch (error) {
        console.error("Error in Location access middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export default handleLocationAccess;