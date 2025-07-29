const handleRegister = (req, res, next) => {
    try {
        const { name, email, password, role, phone } = req.body;

        if (!name || !email || !password || !role || !phone) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        if (
            typeof name !== 'string' ||
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            typeof role !== 'string' ||
            typeof phone !== 'string'
        ) {
            return res.status(400).json({ success: false, message: 'Invalid input format.' });
        }

        const usernameRegex = /^[A-Za-z0-9]{3,}$/;
        if (!usernameRegex.test(name)) {
            return res.status(400).json({
                success: false,
                message: 'Username must be at least 3 characters and contain only letters and numbers.',
            });
        }

        const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format.',
            });
        }

        const phoneRegex = /^\+91\d{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must start with +91 and contain exactly 10 digits after.',
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

        next();
    } catch (error) {
        console.error('Error in register middleware: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const hadleLogin = async (req, res, next) => {
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

        next();
    } catch (error) {
        console.error('Error in login middleware: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export { handleRegister, hadleLogin };