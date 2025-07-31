import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const registerUser = async (req, res) => {
    try {
        const { name, username, email, password, role, phone } = req.body;
        const userExists = User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists with this email.' });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        await User.create({ name, username, email, password: hashedPassword, role, phone });
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
        const token = jwt.sign({ id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY });
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: process.env.JWT_COOKIE_EXPIRY
        });
        return res.status(200).json({ success: true, message: 'Login successfully' });
    } catch (error) {
        console.error('Error in loginUser controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token', {
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

export { registerUser, loginUser, logoutUser };