import { useEffect, useState, useCallback, useRef } from "react";
import { fetchLocationThroughGps, fetchLocationThroughIp } from "../api/location";
import useLocationStore from "../store/location";
import { toast } from 'react-hot-toast';
import useLoaderStore from "../store/loader";
import { MapPin, Edit, X, RefreshCw, Globe, Map, LandPlot, Building, Home, Search, CircleHelp } from 'lucide-react';
import { getProducts } from '../api/product';
import useStores from '../store/stores';
import useCategoryProductStore from "../store/categoryProducts";

export default function Location() {
    const { location, editedLocation, setLocation, setEditedLocation } = useLocationStore();
    const [isEdited, setIsEdited] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const { startLoading, stopLoading } = useLoaderStore();
    const [showTooltip, setShowTooltip] = useState('');
    const [hoverTooltip, setHoverTooltip] = useState('');
    const formRef = useRef(null);

    const locationToArray = (loc) => {
        const keys = ["country", "state", "district", "city", "town", "village", "locality", "pincode"];
        return keys.map(k => loc[k]).filter(Boolean);
    };

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
                        toast.success("Location fetched successfully via GPS");
                        startLoading('fetching');
                        try {
                            const data = await getProducts(locationToArray(result.data));
                            if (data.success) {
                                toast.success("Product fetched successfully");
                                useStores.getState().clearStores();
                                useStores.getState().addStores(data.stores);
                                useCategoryProductStore.getState().clearCategories();
                                useCategoryProductStore.getState().setAllCategories(data.productsByCategory);
                            }
                        } finally {
                            stopLoading();
                        }
                    }
                }).catch(async () => {
                    startLoading('fetchLocIp');
                    const result = await fetchLocationThroughIp();
                    if (result.success) {
                        setLocation(result.data);
                        setEditedLocation(result.data);
                        toast.success("Location fetched successfully via IP");
                        startLoading('fetching');
                        try {
                            const data = await getProducts(locationToArray(result.data));
                            if (data.success) {
                                toast.success("Product fetched successfully");
                                useStores.getState().clearStores();
                                useStores.getState().addStores(data.stores);
                                useCategoryProductStore.getState().clearCategories();
                                useCategoryProductStore.getState().setAllCategories(data.productsByCategory);
                            }
                        } finally {
                            stopLoading();
                        }
                    }
                });
            } else {
                startLoading('fetchLocIp');
                const result = await fetchLocationThroughIp();
                if (result.success) {
                    setLocation(result.data);
                    setEditedLocation(result.data);
                    toast.success("Location fetched successfully via IP");
                    startLoading('fetching');
                    try {
                        const data = await getProducts(locationToArray(result.data));
                        if (data.success) {
                            toast.success("Product fetched successfully");
                            useStores.getState().clearStores();
                            useStores.getState().addStores(data.stores);
                            useCategoryProductStore.getState().clearCategories();
                            useCategoryProductStore.getState().setAllCategories(data.productsByCategory);
                        }
                    } finally {
                        stopLoading();
                    }
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
    };

    const applyChanges = async () => {
        const hasChanged = JSON.stringify(location) !== JSON.stringify(editedLocation);
        if (hasChanged) {
            setLocation(editedLocation);
            setShowForm(false);
            toast.success("Location updated successfully");
            startLoading('fetching');
            try {
                const data = await getProducts(locationToArray(editedLocation));
                if (data.success) {
                    toast.success("Product fetched successfully");
                    useStores.getState().clearStores();
                    useStores.getState().addStores(data.stores);
                    useCategoryProductStore.getState().clearCategories();
                    useCategoryProductStore.getState().setAllCategories(data.productsByCategory);
                }
            } finally {
                stopLoading();
            }
        }
        setIsEdited(false);
    };

    const handleRefresh = () => {
        setLocation({});
        setEditedLocation({});
        setIsFetching(false);
        setShowForm(false);
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

    useEffect(() => {
        const handleClickOutside = () => setShowTooltip(false);

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

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
                        className="w-full pl-10 pr-4 py-2.5 border border-black dark:border-white rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white transition-colors duration-200"
                        placeholder={`Enter ${label}`}
                        autoComplete="off"
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="w-full bg-gray-100 dark:bg-neutral-950 flex flex-col items-center pt-20">
            <div className="w-full max-w-2xl mx-auto px-3 py-8">
                {Object.keys(location).length > 0 ? (
                    <div className="w-fit flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-lg px-4 py-3 shadow-sm gap-4 relative">

                        <div className="flex items-center gap-2 relative">
                            <MapPin size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                {renderLocationText()}
                            </span>
                            <div className="relative">
                                <CircleHelp
                                    size={16}
                                    className="text-gray-500 cursor-pointer"
                                    onClick={() => setShowTooltip(true)}
                                    onMouseEnter={() => setHoverTooltip(true)}
                                    onMouseLeave={() => setHoverTooltip(false)}
                                />
                                {(showTooltip || hoverTooltip) && (
                                    <div
                                        className="w-60 absolute top-4 left-[-105px] -translate-x-1/2 sm:left-0 sm:translate-x-0 bg-black text-white text-xs rounded px-3 py-2 shadow-lg z-20 text-center whitespace-normal break-words max-w-[90vw] sm:max-w-xs"
                                    >
                                        This is your detected location. We are showing you products from stores delivering in this area.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <button
                                onClick={toggleForm}
                                className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                <Edit size={14} className="mr-1" /> Change
                            </button>
                            <button
                                onClick={handleRefresh}
                                disabled={isFetching}
                                className="flex items-center justify-center text-xs px-3 py-1 rounded-full border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 w-full sm:w-auto"
                            >
                                <RefreshCw size={14} className={`mr-1 ${isFetching ? "animate-spin" : ""}`} />
                                {isFetching ? "Refreshing..." : "Refresh"}
                            </button>
                        </div>
                    </div>
                ):(
                    <div className="h-screen"></div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div ref={formRef} className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-lg p-6 md:p-8 transform scale-95 md:scale-100 border border-black dark:border-white animate-slide-up-fade-in">
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

                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar w-full">
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
                                className="px-6 py-2 bg-green-500 text-white rounded-lg border border-black dark:border-white font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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