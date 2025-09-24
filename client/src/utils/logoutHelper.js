const logoutHelper = (message) => {
    if (message === 'Invalid or expired token' || message === 'Invalid refresh token' || message === 'Refresh token missing') {
        window.location.replace(`${window.location.origin}/logout`);
    }
}

export default logoutHelper;