import { logoutUser } from '../api/user'

const logoutHelper = (message) => {
    if (message === 'Invalid or expired token' || message === 'Invalid refresh token' || message === 'Refresh token missing') {
        logoutUser();
    }
}

export default logoutHelper;