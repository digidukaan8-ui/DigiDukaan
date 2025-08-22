import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../api/user.js';
import toast from 'react-hot-toast';
import useLoaderStore from '../../store/loader';
import useStore from '../../store/store.js';

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
                    useStore.getState().removeDetails();
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

    return (
        <div className='h-screen bg-gray-100 dark:bg-neutral-950'></div>
    );
}
