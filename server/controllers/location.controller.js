import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const openStreetMap = async (req, res) => {
    try {
        const { lat, lon } = req.params;

        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;

        const response = await fetch(url, {
            headers: { 'User-Agent': `CollegeProject/1.0 ${process.env.APP_EMAIL}` }
        });

        if (!response.ok) {
            return res.status(500).json({ success: false, message: 'Failed to fetch from OSM' });
        }

        const data = await response.json();

        const address = data.address || {};

        const result = {
            state: address.state || '',
            city: address.city || '',
            pincode: address.postcode || ''
        };

        return res.json({ success: true, data: result });

    } catch (error) {
        console.error('Error fetching location from OSM:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export default openStreetMap;