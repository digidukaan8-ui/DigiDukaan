import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const authMiddleware = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      let decoded;
      const accessToken = req.cookies?.accessToken;

      if (accessToken) {
        decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      } else {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
          return res
            .status(401)
            .json({ success: false, message: "Refresh token missing" });
        }

        const refreshDecoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        console.log(refreshDecoded)
        const user = await User.findById(refreshDecoded._id);

        if (!user || user.refreshToken !== refreshToken) {
          return res
            .status(403)
            .json({ success: false, message: "Invalid refresh token" });
        }

        const newAccessToken = jwt.sign(
          { _id: user._id, role: user.role },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: parseInt(process.env.ACCESS_TOKEN_COOKIE_EXPIRY),
        });

        decoded = jwt.verify(newAccessToken, process.env.ACCESS_TOKEN_SECRET);
      }

      req.user = decoded;

      if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(decoded.role)
      ) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not allowed to access this resource",
        });
      }

      return next();
    } catch (error) {
      console.error("Auth error:", error);
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }
  };
};

export { authMiddleware };