import { useEffect, useState, useCallback, useRef } from "react";
import { fetchLocationThroughGps, fetchLocationThroughIp } from "../api/location";
import useLocationStore from "../store/location";
import { toast } from 'react-hot-toast';
import useLoaderStore from "../store/loader";
import { MapPin, Edit, X, RefreshCw, Globe, Map, LandPlot, Building, Home, Search, CircleHelp, Plus, Minus } from 'lucide-react';
import { getProducts } from '../api/product';
import useStores from '../store/stores';
import useCategoryProductStore from "../store/categoryProducts";
import useUsedCategoryProductStore from "../store/categoryUsedProduct";

const ALL_LOCATION_FIELDS = [
    { key: "state", label: "State", icon: <Map size={20} /> },
    { key: "district", label: "District", icon: <LandPlot size={20} /> },
    { key: "city", label: "City", icon: <Building size={20} /> },
    { key: "town", label: "Town", icon: <Home size={20} /> },
    { key: "village", label: "Village", icon: <Home size={20} /> },
    { key: "suburb", label: "Suburb", icon: <Building size={20} /> },
    { key: "area", label: "Area", icon: <LandPlot size={20} /> },
    { key: "taluka", label: "Taluka", icon: <Map size={20} /> },
    { key: "tehsil", label: "Tehsil", icon: <Map size={20} /> },
    { key: "locality", label: "Locality", icon: <MapPin size={20} /> },
    { key: "street", label: "Street", icon: <MapPin size={20} /> },
    { key: "landmark", label: "Landmark", icon: <MapPin size={20} /> },
    { key: "pincode", label: "Pincode", icon: <Search size={20} /> },
];

const INITIAL_EDITABLE_FIELDS = ["state", "city", "pincode"];

export default function Location() {
    const { location, editedLocation, setLocation, setEditedLocation } = useLocationStore();
    const [isEdited, setIsEdited] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const { startLoading, stopLoading } = useLoaderStore();
    const [showTooltip, setShowTooltip] = useState(false);
    const [hoverTooltip, setHoverTooltip] = useState(false);
    const formRef = useRef(null);

    const [selectedFields, setSelectedFields] = useState(INITIAL_EDITABLE_FIELDS);

    const locationToArray = (loc) => {
        const keys = ["city", "state", "pincode", "district", "locality", "country"];
        return keys.map(k => loc[k]).filter(Boolean);
    };

    const normalizeLocationData = (data) => {
        return {
            city: data.city || data.town || data.village || data.locality || data.district || '',
            state: data.state || '',
            pincode: data.pincode || '',
            country: data.country || '',
            district: data.district || '',
            locality: data.locality || ''
        };
    };

    const fetchLocation = useCallback(async () => {
        if (Object.keys(location).length > 0 || isFetching) return;

        setIsFetching(true);
        startLoading('fetchLoc');

        try {
            const fetchProductsAndUpdateStores = async (locData) => {
                const normalizedData = normalizeLocationData(locData);

                startLoading('fetching');
                try {
                    const data = await getProducts(locationToArray(normalizedData));
                    if (data.success) {
                        toast.success("Products fetched successfully");
                        useStores.getState().clearStores();
                        useStores.getState().addStores(data.stores);
                        useCategoryProductStore.getState().clearCategories();
                        useCategoryProductStore.getState().setAllCategories(data.productsByCategory);
                        useUsedCategoryProductStore.getState().clearUsedCategories();
                        useUsedCategoryProductStore.getState().setAllUsedCategories(data.usedProductsByCategory);
                    }
                } finally {
                    stopLoading();
                }
                return normalizedData;
            };

            if (navigator.geolocation) {
                const geoPromise = new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 10000,
                        maximumAge: 300000,
                        enableHighAccuracy: true
                    });
                });

                await geoPromise.then(async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const result = await fetchLocationThroughGps(latitude, longitude);
                    if (result.success) {
                        const normalized = await fetchProductsAndUpdateStores(result.data);
                        setLocation(normalized);
                        setEditedLocation(normalized);
                        toast.success("Location fetched successfully via GPS");
                    }
                }).catch(async () => {
                    const result = await fetchLocationThroughIp();
                    if (result.success) {
                        const normalized = await fetchProductsAndUpdateStores(result.data);
                        setLocation(normalized);
                        setEditedLocation(normalized);
                        toast.success("Location fetched successfully via IP");
                    }
                });
            } else {
                const result = await fetchLocationThroughIp();
                if (result.success) {
                    const normalized = await fetchProductsAndUpdateStores(result.data);
                    setLocation(normalized);
                    setEditedLocation(normalized);
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
        setSelectedFields(INITIAL_EDITABLE_FIELDS);
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

    const handleChange = (field, value) => {
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
                    toast.success("Products fetched successfully");
                    useStores.getState().clearStores();
                    useStores.getState().addStores(data.stores);
                    useCategoryProductStore.getState().clearCategories();
                    useCategoryProductStore.getState().setAllCategories(data.productsByCategory);
                    useUsedCategoryProductStore.getState().clearUsedCategories();
                    useUsedCategoryProductStore.getState().setAllUsedCategories(data.usedProductsByCategory);
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
        setShowForm(prev => {
            if (prev) {
                cancelEditing();
            }
            return !prev;
        });
    };

    const renderLocationText = () => {
        const parts = [];
        if (editedLocation.state) parts.push(editedLocation.state);
        if (editedLocation.city) parts.push(editedLocation.city);
        if (editedLocation.pincode) parts.push(editedLocation.pincode);

        const fallbackKeys = ["country", "district", "town", "village", "locality"];
        for (const key of fallbackKeys) {
            if (editedLocation[key] && !parts.includes(editedLocation[key])) {
                parts.push(editedLocation[key]);
            }
        }

        return parts.slice(0, 3).join(", ");
    };

    const handleClickOutsideTooltip = useCallback(() => setShowTooltip(false), []);
    useEffect(() => {
        document.addEventListener("click", handleClickOutsideTooltip);
        return () => document.removeEventListener("click", handleClickOutsideTooltip);
    }, [handleClickOutsideTooltip]);

    const handleFieldSelection = (key) => {
        setSelectedFields(prev => {
            if (prev.includes(key)) {
                if (prev.length === 1) return prev;
                return prev.filter(f => f !== key);
            } else {
                if (prev.length >= 3) {
                    toast.error("You can select a maximum of 3 fields.");
                    return prev;
                }
                return [...prev, key];
            }
        });
    };

    const renderField = (fieldKey) => {
        const fieldInfo = ALL_LOCATION_FIELDS.find(f => f.key === fieldKey);
        if (!fieldInfo) return null;

        return (
            <div key={fieldKey} className="relative z-10">
                <label htmlFor={fieldKey} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {fieldInfo.label}
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {fieldInfo.icon}
                    </div>
                    <input
                        id={fieldKey}
                        type="text"
                        value={editedLocation[fieldKey] || ""}
                        onChange={(e) => handleChange(fieldKey, e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-black dark:border-white rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 transition-colors duration-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        placeholder={`e.g., ${fieldInfo.label}`}
                        autoComplete="off"
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="w-full bg-gray-100 dark:bg-neutral-950 flex flex-col items-center pt-20">
            <div className="w-full max-w-7xl mx-auto px-4 py-3">
                {Object.keys(location).length > 0 ? (
                    <div className="w-full max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-xl px-4 py-3 shadow-lg gap-4 relative">

                        <div className="flex items-center justify-start gap-2 relative min-w-0 flex-1">
                            <MapPin size={24} className="text-blue-600 dark:text-blue-400 shrink-0" />
                            <span className="text-base font-semibold text-gray-900 dark:text-white truncate max-w-[calc(100%-60px)]">
                                {renderLocationText() || "Location not fully specified"}
                            </span>
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <CircleHelp
                                    size={16}
                                    className="text-gray-500 cursor-pointer hover:text-sky-500 transition-colors"
                                    onClick={() => setShowTooltip(true)}
                                    onMouseEnter={() => setHoverTooltip(true)}
                                    onMouseLeave={() => setHoverTooltip(false)}
                                />
                                {(showTooltip || hoverTooltip) && (
                                    <div
                                        className="w-60 absolute top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-3 py-2 shadow-lg z-20 text-center whitespace-normal break-words max-w-[90vw] sm:max-w-xs"
                                        style={{ top: '30px', left: '50%', transform: 'translateX(-50%)' }}
                                    >
                                        This is your detected location. Products are filtered based on stores delivering here.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
                            <button
                                onClick={toggleForm}
                                className="flex items-center cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 font-medium"
                            >
                                <Edit size={16} className="mr-1r" /> Edit Location
                            </button>
                            <button
                                onClick={handleRefresh}
                                disabled={isFetching}
                                className="flex items-center justify-center cursor-pointer text-sm px-3 py-1.5 rounded-lg border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-wait w-fit font-medium"
                            >
                                <RefreshCw size={16} className={`mr-1 ${isFetching ? "animate-spin" : ""}`} />
                                {isFetching ? "Refreshing..." : "Recalculate"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-20 flex items-center justify-center text-gray-500 dark:text-gray-400 font-medium">
                        Fetching location data...
                    </div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[100] overflow-y-auto hide-scrollbar">
                    <div className="min-h-screen flex justify-center py-20 px-4">
                        <div
                            ref={formRef}
                            className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-lg p-6 md:p-8 border border-black dark:border-white"
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-neutral-700 pb-4">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Customize Filter Area
                                </h3>
                                <button
                                    onClick={cancelEditing}
                                    className="p-2 cursor-pointer text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6 pr-3 w-full">

                                <div className="p-4 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700">
                                    <h4 className="text-md font-semibold text-sky-800 dark:text-sky-300 mb-3 flex items-center">
                                        <MapPin size={18} className="mr-2" />
                                        Choose up to 3 Location Fields
                                    </h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                        Select the 1 to 3 fields you want to use to narrow down product listings (e.g., City and Pincode).
                                    </p>

                                    <div className="flex flex-wrap gap-3">
                                        {ALL_LOCATION_FIELDS.map(field => {
                                            const isSelected = selectedFields.includes(field.key);
                                            return (
                                                <button
                                                    key={field.key}
                                                    onClick={() => handleFieldSelection(field.key)}
                                                    disabled={!isSelected && selectedFields.length >= 3}
                                                    className={`flex items-center text-xs px-3 py-1.5 rounded-full font-medium border transition-all duration-200
                                                    ${isSelected
                                                            ? 'bg-sky-600 text-white border border-black dark:border-white shadow-md'
                                                            : 'bg-white dark:bg-neutral-950 text-black dark:text-white border border-black dark:border-white hover:bg-blue-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                                        }`}
                                                >
                                                    {field.icon && <span className="mr-1">{field.icon}</span>}
                                                    {field.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    {selectedFields.map(key => renderField(key))}
                                </div>

                                <div className="p-3 bg-gray-100 dark:bg-neutral-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                                    <p>
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">Current Filter:</span> Products are filtered using: {locationToArray(editedLocation).join(", ") || "No input yet."}
                                    </p>
                                </div>

                            </div>

                            <div className="flex justify-center mt-8 pt-4 border-t border-gray-200 dark:border-neutral-700">
                                <button
                                    onClick={applyChanges}
                                    disabled={!isEdited || locationToArray(editedLocation).length === 0}
                                    className="px-8 py-3 bg-green-600 text-white rounded-lg border border-black dark:border-white font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg"
                                >
                                    Apply Filter & Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}