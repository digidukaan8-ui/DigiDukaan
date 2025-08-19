import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../api/user.js';
import toast from 'react-hot-toast';
import useLoaderStore from '../../store/loader';

export default function Logout() {
    const { startLoading, stopLoading } = useLoaderStore();
    const navigate = useNavigate();

    useEffect(() => {
        const doLogout = async () => {
            startLoading('logout');
            try {
                const result = await logoutUser();
                if (result.success) {
                    setTimeout(() => {
                        navigate('/')
                        toast.success('Logout successfully!');
                    }, 500);
                } else {
                    toast.error(result?.message || "Failed to logout");
                }
            } catch (err) {
                toast.error("Something went wrong");
            } finally {
                stopLoading();
            }
        };
        doLogout();
    }, []);

    return;
}
