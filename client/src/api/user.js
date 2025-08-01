import toast from 'react-hot-toast'

const registerUser = async (data) => {
    try {
        const response = await fetch('http://localhost:3000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!result.success) {
            toast.error(result.message || 'Registration failed');
            throw new Error(result.message || 'Failed to register user');
        }
        return result;
    } catch (error) {
        console.error("Error registering user: ", error);
        throw error;
    }
}

const loginUser = async (data) => {
    try {
        const response = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!result.success) {
            toast.error(result.message || 'Registration failed');
            throw new Error(result.message || 'Failed to register user');
        }
        console.log(result)
        return result;
    } catch (error) {
        console.error("Error login user: ", error);
        throw error;
    }
}

const logoutUser = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/users/logout', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });
        const result = response.json();
        return result;
    } catch (error) {
        console.error("Error login user: ", error);
        throw error;
    }
}

export { registerUser, loginUser, logoutUser };