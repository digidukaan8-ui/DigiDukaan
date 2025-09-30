import { useEffect, useState, useCallback, useRef } from "react";
import { fetchLocationThroughGps, fetchLocationThroughIp } from "../api/location";
import useLocationStore from "../store/location";
import { toast } from 'react-hot-toast';
import useLoaderStore from "../store/loader";
import { MapPin, Edit, X, RefreshCw, Map, LandPlot, Building, Home, Search, CircleHelp } from 'lucide-react';
import { getProducts } from '../api/product';
import useStores from '../store/stores';
import useCategoryProductStore from "../store/categoryProducts";
import useUsedCategoryProductStore from "../store/categoryUsedProduct";

const ALL_LOCATION_FIELDS = [
    { key: "state", label: "State", icon: <Map size={18} /> },
    { key: "district", label: "District", icon: <LandPlot size={18} /> },
    { key: "city", label: "City", icon: <Building size={18} /> },
    { key: "town", label: "Town", icon: <Home size={18} /> },
    { key: "village", label: "Village", icon: <Home size={18} /> },
    { key: "suburb", label: "Suburb", icon: <Building size={18} /> },
    { key: "area", label: "Area", icon: <LandPlot size={18} /> },
    { key: "taluka", label: "Taluka", icon: <Map size={18} /> },
    { key: "tehsil", label: "Tehsil", icon: <Map size={18} /> },
    { key: "locality", label: "Locality", icon: <MapPin size={18} /> },
    { key: "street", label: "Street", icon: <MapPin size={18} /> },
    { key: "landmark", label: "Landmark", icon: <MapPin size={18} /> },
    { key: "pincode", label: "Pincode", icon: <Search size={18} /> },
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
            <div key={fieldKey}>
                <label htmlFor={fieldKey} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {fieldInfo.label}
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                        {fieldInfo.icon}
                    </div>
                    <input
                        id={fieldKey}
                        type="text"
                        value={editedLocation[fieldKey] || ""}
                        onChange={(e) => handleChange(fieldKey, e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        placeholder={`Enter ${fieldInfo.label.toLowerCase()}`}
                        autoComplete="off"
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="w-full bg-gray-100 dark:bg-neutral-950 flex flex-col items-center pt-20">
            <div className="w-full max-w-7xl mx-auto px-4 py-4">
                {Object.keys(location).length > 0 ? (
                    <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl px-5 py-3.5 shadow-md gap-4">

                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                                <MapPin size={20} className="text-sky-600 dark:text-sky-400" />
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                    {renderLocationText() || "Location not specified"}
                                </span>
                                <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <CircleHelp
                                        size={16}
                                        className="text-gray-400 cursor-pointer hover:text-sky-500 transition-colors"
                                        onClick={() => setShowTooltip(true)}
                                        onMouseEnter={() => setHoverTooltip(true)}
                                        onMouseLeave={() => setHoverTooltip(false)}
                                    />
                                    {(showTooltip || hoverTooltip) && (
                                        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-64 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl z-20">
                                            Products are filtered based on stores delivering to your location
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleForm}
                                className="flex items-center gap-1.5 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors bg-sky-50 dark:bg-sky-900/20 px-3 py-2 rounded-lg font-medium"
                            >
                                <Edit size={16} /> Edit
                            </button>
                            <button
                                onClick={handleRefresh}
                                disabled={isFetching}
                                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-wait font-medium transition-colors"
                            >
                                <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
                                Refresh
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-16 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        Fetching location...
                    </div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div
                        ref={formRef}
                        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-neutral-800 hide-scrollbar"
                    >
                        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 px-6 py-4 flex justify-between items-center z-20">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Customize Location Filter
                            </h3>
                            <button
                                onClick={cancelEditing}
                                className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/50">
                                <h4 className="text-sm font-bold text-sky-900 dark:text-sky-300 mb-3 flex items-center gap-2">
                                    <MapPin size={16} />
                                    Select Location Fields (1-3)
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                                    Choose the fields to filter products by delivery location
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {ALL_LOCATION_FIELDS.map(field => {
                                        const isSelected = selectedFields.includes(field.key);
                                        return (
                                            <button
                                                key={field.key}
                                                onClick={() => handleFieldSelection(field.key)}
                                                disabled={!isSelected && selectedFields.length >= 3}
                                                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border transition-all duration-200
                                                ${isSelected
                                                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                                                        : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-neutral-700 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 disabled:opacity-40 disabled:cursor-not-allowed'
                                                    }`}
                                            >
                                                {field.icon}
                                                {field.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedFields.map(key => renderField(key))}
                            </div>

                            <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                                <span className="font-semibold text-gray-900 dark:text-gray-100">Active Filter: </span>
                                {locationToArray(editedLocation).join(", ") || "No values entered yet"}
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 px-6 py-4 flex justify-center">
                            <button
                                onClick={applyChanges}
                                disabled={!isEdited || locationToArray(editedLocation).length === 0}
                                className="w-fit px-6 py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
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