import User from "../models/user.model.js";

const handleRegister = async (req, res, next) => {
    try {
        const { name, username, email, password, role, mobile, captchaToken } = req.body;

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

        if (!name || !username || !email || !password || !role || !mobile) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        if (
            typeof name !== 'string' ||
            typeof username !== 'string' ||
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            typeof role !== 'string' ||
            typeof mobile !== 'string'
        ) {
            return res.status(400).json({ success: false, message: 'Invalid input format.' });
        }

        const nameRegex = /^(?!.*  )(?! )[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/;

        if (!nameRegex.test(name)) {
            return res.status(400).json({
                success: false,
                message: 'Name must be letters/numbers only, and single spaces are allowed (no double or trailing spaces).',
            });
        }

        if (name.length < 3 || name.length > 15) {
            return res.status(400).json({
                success: false,
                message: 'Name must be between 3 and 15 characters long.',
            });
        }

        const usernameRegex = /^[a-zA-Z0-9_]{5,10}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                success: false,
                message: 'Username must be 5-10 characters and contain only letters, numbers, and underscore.',
            });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists.',
            });
        }

        const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format.',
            });
        }

        const mobileRegex = /^\+91\d{10}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: 'mobile number must start with +91 and contain exactly 10 digits after.',
            });
        }

        if (role.toLowerCase() === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin role is not allowed.',
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long.',
            });
        }

        return next();
    } catch (error) {
        console.error('Error in register middleware: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const handleLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid input format.' });
        }

        const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email) || password.length < 8) {
            return res.status(400).json({ success: false, message: 'Invalid credentials.' });
        }

        return next();
    } catch (error) {
        console.error('Error in login middleware: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const handleMessage = async (req, res, next) => {
    try {
        const { name, email, message, captchaToken } = req.body;

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

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid input format.' });
        }

        if (name.length < 3 || name.length > 20) {
            return res.status(400).json({ success: false, message: 'Name must be between 3 and 20 characters.' })
        }
        
        if(message.length<5||message.length>1000){
            return res.status(400).json({ success: false, message: 'Message must be between 5 and 1000 characters.' })
        }

        const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format.' });
        }

        return next();
    } catch (error) {
        console.error('Error in message middleware: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export { handleRegister, handleLogin, handleMessage };