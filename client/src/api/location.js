import toast from 'react-hot-toast';
import logoutHelper from '../utils/logoutHelper';

const fetchLocationThroughGps = async (lat, lon) => {
    try {
        const response = await fetch(`http://localhost:3000/api/users/reverse-geocode/${lat}/${lon}`, {
            method: "GET",
            credentials: "include"
        });
        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get location");
            throw new Error(result.message || "Failed to get location");
        }

        return result;
    } catch (error) {
        console.error("Error in Fetching Location:", error);
        throw error;
    }
};

const fetchLocationThroughIp = async () =>{
    try {
        const response = await fetch('http://ip-api.com/json');
        const data = await response.json();

        const result = {
            country: data.country_name || '',
            state: data.region || '',
            district: '',
            city: data.city || '',
            town: data.city || '',
            village: '',
            locality: data.org || '',
            pincode: data.postal || ''
        };

        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching location from IP:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export { fetchLocationThroughGps, fetchLocationThroughIp };