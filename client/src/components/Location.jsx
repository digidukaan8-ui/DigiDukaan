import { useEffect, useState, useCallback, useRef } from "react";
import { fetchLocationThroughGps, fetchLocationThroughIp } from "../api/location";
import useLocationStore from "../store/location";
import { toast } from 'react-hot-toast';
import useLoaderStore from "../store/loader";
import {
    MapPin,
    Edit,
    X,
    Navigation,
    RefreshCw,
    Globe,
    Map,
    LandPlot,
    Building,
    Home,
    Search
} from 'lucide-react';

export default function Location() {
    const { location, editedLocation, setLocation, setEditedLocation } = useLocationStore();
    const [isEdited, setIsEdited] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const { startLoading, stopLoading } = useLoaderStore();
    const [suggestions, setSuggestions] = useState([]);
    const [activeField, setActiveField] = useState(null);
    const [locationMethod, setLocationMethod] = useState('');
    const formRef = useRef(null);

    const fetchLocation = useCallback(async () => {
        if (Object.keys(location).length > 0 || isFetching) return;

        setIsFetching(true);
        startLoading('fetchLoc');

        try {
            if (navigator.geolocation) {
                await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 10000,
                        maximumAge: 300000,
                        enableHighAccuracy: true
                    });
                }).then(async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const result = await fetchLocationThroughGps(latitude, longitude);
                    if (result.success) {
                        setLocation(result.data);
                        setEditedLocation(result.data);
                        setLocationMethod('gps');
                        toast.success("Location fetched successfully via GPS");
                    }
                }).catch(async () => {
                    startLoading('fetchLocIp');
                    const result = await fetchLocationThroughIp();
                    if (result.success) {
                        setLocation(result.data);
                        setEditedLocation(result.data);
                        setLocationMethod('ip');
                        toast.success("Location fetched successfully via IP");
                    }
                });
            } else {
                startLoading('fetchLocIp');
                const result = await fetchLocationThroughIp();
                if (result.success) {
                    setLocation(result.data);
                    setEditedLocation(result.data);
                    setLocationMethod('ip');
                    toast.success("Location fetched successfully via IP");
                }
            }
        } catch (error) {
            console.error("Location fetch error:", error);
            toast.error("Failed to fetch location");
        } finally {
            stopLoading();
            setIsFetching(false);
        }
    }, [location, isFetching, setLocation, setEditedLocation, startLoading, stopLoading]);

    useEffect(() => {
        fetchLocation();
    }, [fetchLocation]);

    const cancelEditing = useCallback(() => {
        setEditedLocation(location);
        setShowForm(false);
        setIsEdited(false);
        setSuggestions([]);
        setActiveField(null);
    }, [location, setEditedLocation]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (formRef.current && !formRef.current.contains(event.target)) {
                cancelEditing();
            }
        };
        if (showForm) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showForm, cancelEditing]);

    const handleChange = async (field, value) => {
        setEditedLocation({ ...editedLocation, [field]: value });
        setIsEdited(true);
        setActiveField(field);
        setLocationMethod('manual');

        if (value.length > 2) {
            try {
                const mockSuggestions = {
                    country: ["India", "United States", "United Kingdom"],
                    state: ["Maharashtra", "Karnataka", "Delhi"],
                    district: ["Mumbai Suburban", "Pune", "Thane"],
                    city: ["Mumbai", "Pune", "Nagpur"],
                    town: ["Andheri", "Bandra", "Juhu"],
                    village: ["Village A", "Village B"],
                    locality: ["Andheri East", "Bandra West", "Juhu Vile Parle"],
                    pincode: ["400053", "400058", "400047"]
                };
                setSuggestions(mockSuggestions[field] || []);
            } catch (error) {
                console.error("Autocomplete fetch error:", error);
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSelectSuggestion = (field, suggestion) => {
        setEditedLocation({ ...editedLocation, [field]: suggestion });
        setSuggestions([]);
        setActiveField(null);
    };

    const applyChanges = async () => {
        const hasChanged = JSON.stringify(location) !== JSON.stringify(editedLocation);
        if (hasChanged) {
            setLocation(editedLocation);
            setShowForm(false);
            setLocationMethod('manual');
            toast.success("Location updated successfully");
        }
        setIsEdited(false);
    };

    const handleRefresh = () => {
        setLocation({});
        setEditedLocation({});
        setIsFetching(false);
        setShowForm(false);
        setLocationMethod('');
        fetchLocation();
    };

    const toggleForm = () => {
        setShowForm(!showForm);
    };

    const renderLocationText = () => {
        const parts = [];
        if (editedLocation.country) parts.push(`${editedLocation.country}`);
        if (editedLocation.state) parts.push(`${editedLocation.state}`);
        if (editedLocation.district) parts.push(`${editedLocation.district}`);
        if (editedLocation.city) parts.push(`${editedLocation.city}`);
        if (editedLocation.town) parts.push(`${editedLocation.town}`);
        if (editedLocation.village) parts.push(`${editedLocation.village}`);
        if (editedLocation.locality) parts.push(`${editedLocation.locality}`);
        if (editedLocation.pincode) parts.push(`${editedLocation.pincode}`);

        return parts.join(", ");
    };

    const renderField = (label, field, icon) => {
        return (
            <div className="relative z-10">
                <label htmlFor={field} className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {label}
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {icon}
                    </div>
                    <input
                        id={field}
                        type="text"
                        value={editedLocation[field] || ""}
                        onChange={(e) => handleChange(field, e.target.value)}
                        onFocus={() => setActiveField(field)}
                        onBlur={() => setTimeout(() => setActiveField(null), 200)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white transition-colors duration-200"
                        placeholder={`Enter ${label}`}
                        autoComplete="off"
                    />
                </div>
                {activeField === field && suggestions.length > 0 && (
                    <ul className="absolute z-20 w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md mt-1 max-h-48 overflow-y-auto shadow-xl animate-fade-in-down">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(field, suggestion); }}
                                className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-800 dark:text-white transition-colors duration-200"
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen bg-gray-100 dark:bg-neutral-950 flex flex-col items-center pt-20">
            <div className="w-full max-w-7xl px-4 py-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white rounded-t-xl shadow-lg">
                    <div className="flex items-center">
                        <MapPin size={28} className="mr-3" />
                        <h2 className="text-xl md:text-2xl font-bold">Stores delivering to your area</h2>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-b-xl shadow-lg p-6 md:p-8">
                    {Object.keys(location).length === 0 ? (
                        <div className="text-center py-10">
                            <div className="flex justify-center mb-4">
                                <Navigation size={48} className="text-blue-500 animate-spin" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 font-medium">Fetching your location information...</p>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-6 p-4 md:p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900">
                                <h3 className="text-lg md:text-xl font-semibold text-blue-800 dark:text-blue-200 mb-2">Your Current Location</h3>
                                <p className="text-blue-700 dark:text-blue-300 text-sm md:text-base leading-relaxed mb-2">
                                    {renderLocationText()}
                                </p>
                                {locationMethod === 'ip' && (
                                    <>
                                        <p className="text-sm text-red-600 dark:text-red-400 font-semibold mt-4">
                                            The location fetched via IP address might not be accurate. For better results, please enter your correct location.
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-2">
                                            If you want to see result of store delivering in our area by sharimg your location click 'Refresh Location'.
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-2">
                                            If you didn't see the location access popup, click the lock icon in your browser's URL bar, enable location, and then click 'Refresh Location'.
                                        </p>
                                    </>
                                )}
                                {locationMethod === 'gps' && (
                                    <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mt-4">
                                        Based on your current GPS location, we are showing you stores in this area. If you want delivery to a different location, you can change your address.
                                    </p>
                                )}
                                {locationMethod === 'manual' && (
                                    <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mt-4">
                                        Based on the address you provided, we are showing you stores in this area.
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200 dark:border-neutral-700">
                                <button
                                    onClick={toggleForm}
                                    className="flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline transition-transform transform hover:scale-105"
                                >
                                    <Edit size={16} className="mr-2" /> Not my location?
                                </button>
                                <button
                                    onClick={handleRefresh}
                                    disabled={isFetching}
                                    className="flex items-center text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw size={16} className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                                    {isFetching ? "Refreshing..." : "Refresh Location"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div ref={formRef} className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-lg p-6 md:p-8 transform scale-95 md:scale-100 animate-slide-up-fade-in">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-neutral-700 pb-4">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                Edit Your Location
                            </h3>
                            <button
                                onClick={cancelEditing}
                                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
                            {renderField("Country", "country", <Globe size={20} />)}
                            {renderField("State", "state", <Map size={20} />)}
                            {renderField("District", "district", <LandPlot size={20} />)}
                            {renderField("City", "city", <Building size={20} />)}
                            {renderField("Town", "town", <Home size={20} />)}
                            {renderField("Village", "village", <Home size={20} />)}
                            {renderField("Locality", "locality", <MapPin size={20} />)}
                            {renderField("Pincode", "pincode", <Search size={20} />)}
                        </div>

                        <div className="flex justify-center mt-8 pt-4 border-t border-gray-200 dark:border-neutral-700">
                            <button
                                onClick={applyChanges}
                                disabled={!isEdited}
                                className="px-6 py-2 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}