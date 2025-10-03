import fetch from "node-fetch";

const reverseGeocode = async (req, res) => {
    try {
        const { lat, lon } = req.params;

        if (!lat || !lon) {
            return res
                .status(400)
                .json({ success: false, message: "Latitude and longitude required" });
        }

        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;

        const response = await fetch(url, {
            headers: {
                "User-Agent": `CollegeProject/1.0 (${process.env.APP_EMAIL || "test@example.com"})`,
            },
        });

        if (!response.ok) {
            return res
                .status(500)
                .json({ success: false, message: "Failed to fetch from OSM" });
        }

        const data = await response.json();
        const address = data.address || {};

        const result = {
            state: address.state || "",
            city:
                address.city ||
                address.town ||
                address.village ||
                address.locality ||
                address.municipality ||
                "",
            pincode: address.postcode || "",
            country: address.country || "",
            district: address.county || address.district || "",
        };

        return res.json({ success: true, data: result });
    } catch (error) {
        console.error("Error fetching location from OSM:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};

export default reverseGeocode;