import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Store from '../models/store.model.js';
import DeliveryZone from '../models/deliveryzone.model.js';
import nodemailer from 'nodemailer';
import OTP from '../models/otp.model.js';
import Feedback from '../models/feedback.model.js';

dotenv.config();

const registerUser = async (req, res) => {
    try {
        const { name, username, email, password, role, mobile } = req.body;
        const userExists = User.findOne({ email });

        if (userExists.lenght > 0) {
            return res.status(400).json({ success: false, message: 'User already exists with this email.' });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        await User.create({ name, username, email, password: hashedPassword, role, mobile });

        return res.status(201).json({ success: true, message: 'User registered successfully.' });
    } catch (error) {
        console.error('Error in registerUser controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Invalid Credentials' });
        }

        const accessToken = jwt.sign({ _id: user._id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: Number(process.env.ACCESS_TOKEN_COOKIE_EXPIRY)
        });

        const refreshToken = jwt.sign({ _id: user._id, role: user.role },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: Number(process.env.REFRESH_TOKEN_COOKIE_EXPIRY)
        });

        await User.findByIdAndUpdate(user._id, { refreshToken: refreshToken });

        const data = {
            _id: user._id,
            name: user.name,
            username: user.username,
            role: user.role
        }

        const storeData = await Store.findOne({ userId: user._id });
        let store = null;
        let deliveryZone = null;

        if (storeData) {
            store = {
                _id: storeData._id,
                userId: storeData.userId,
                name: storeData.name,
                description: storeData.description,
                category: storeData.category,
                addresses: storeData.addresses,
                img: storeData.img || "",
            };

            const deliveryZoneData = await DeliveryZone.find({ storeId: storeData?._id });
            if (deliveryZoneData && deliveryZoneData.length > 0) {
                deliveryZone = deliveryZoneData;
            }
        }

        return res.status(200).json({ success: true, message: 'Login successfully', data, store, deliveryZone });
    } catch (error) {
        console.error('Error in loginUser controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const logoutUser = async (req, res) => {
    try {
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'strict'
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'strict'
        });

        return res.status(200).json({ success: true, message: 'Logout successfully' });
    } catch (error) {
        console.error('Error in logoutUser controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const sendOTP = async (req, res) => {
    try {
        const { email, captchaToken } = req.body;

        if (!captchaToken) {
            return res.status(400).json({ success: false, message: "Captcha token missing" });
        }

        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
        });

        const data = await response.json();

        if (!data.success) {
            return res.status(400).json({ success: false, message: "Captcha verification failed" });
        }

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const userExist = await User.findOne({ email });
        if (!userExist) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        await OTP.create({
            email,
            otp,
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.APP_EMAIL,
                pass: process.env.APP_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"Your App" <${process.env.APP_EMAIL}>`,
            to: email,
            subject: "🔐 Your OTP Code",
            html: `<!DOCTYPE html>
                    <html>
                    <head>
                    <meta charset="UTF-8" />
                    <meta name="color-scheme" content="light dark" />
                    <meta name="supported-color-schemes" content="light dark" />
                    <style>
                        body {
                        font-family: Arial, sans-serif;
                        margin:0;
                        padding:0;
                        background-color:#f9f9f9;
                        color:#333;
                        }
                        @media (prefers-color-scheme: dark) {
                        body { background-color:#121212; color:#fff; }
                        .container { background:#1e1e1e; color:#fff; }
                        .otp-box { background:#333; color:#fff; }
                        .btn { background:#0d6efd; color:#fff; }
                        }
                        .container {
                        max-width:600px;
                        margin:20px auto;
                        padding:20px;
                        border-radius:12px;
                        background:#ffffff;
                        box-shadow:0 4px 12px rgba(0,0,0,0.1);
                        text-align:center;
                        }
                        h2 { margin-bottom:20px; }
                        .otp-box {
                        font-size:24px;
                        font-weight:bold;
                        letter-spacing:4px;
                        padding:15px;
                        margin:20px 0;
                        border-radius:8px;
                        background:#f0f0f0;
                        display:inline-block;
                        }
                        .btn {
                        display:inline-block;
                        padding:12px 20px;
                        margin-top:15px;
                        font-size:16px;
                        font-weight:bold;
                        text-decoration:none;
                        background:#007bff;
                        color:#fff;
                        border-radius:6px;
                        }
                        .note {
                        margin-top:20px;
                        font-size:14px;
                        color:gray;
                        }
                    </style>
                    </head>
                    <body>
                    <div class="container">
                        <h2>OTP Verification</h2>
                        <p>Use the OTP below to complete your verification. It is valid for <b>10 minutes</b>.</p>
                        <div class="otp-box">${otp}</div>
                        <br/>
                        <a href="#" class="btn" onclick="navigator.clipboard.writeText('${otp}')">Copy OTP</a>
                        <p class="note">If you didn’t request this OTP, you can safely ignore this email.</p>
                    </div>
                    </body>
                    </html>
                    `};

        await transporter.sendMail(mailOptions);

        return res.status(201).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.error('Error in send OTP controller: ', error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        otpRecord.verified = true;
        await otpRecord.save();

        return res.status(200).json({ success: true, message: "OTP verified successfully" });
    } catch (error) {
        console.error("Error in verify OTP controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ success: false, message: "Email and new password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

        if (!otpRecord || !otpRecord.verified) {
            return res.status(400).json({ success: false, message: "OTP not verified" });
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        await OTP.deleteMany({ email });

        return res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.error("Error in resetPassword controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
};

const message = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        await Feedback.create({ name, email, message });
        return res.status(201).json({ success: true, message: 'Message sent successfullt' });
    } catch (error) {
        console.error("Error in message controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
}

const userAvatar = async (req, res) => {
    try {

    } catch (error) {
        console.error("Error in user avatar controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
}

const removeUserAvatar = async (req, res) => {
    try {

    } catch (error) {
        console.error("Error in remove user avatar controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
}

export { registerUser, loginUser, logoutUser, sendOTP, verifyOTP, resetPassword, message, userAvatar, removeUserAvatar };