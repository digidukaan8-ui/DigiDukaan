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

const LOCATION_GRANULARITY_ORDER = [
    "locality", "street", "landmark", "area", "suburb", "town", "village", "city", "district", "taluka", "tehsil", "pincode", "state", "country"
];

const DEFAULT_FALLBACK_FIELDS = ["state", "city", "pincode"];

const getInitialSelectedFields = (locationData) => {
    let initialFields = [];

    for (const key of LOCATION_GRANULARITY_ORDER) {
        if (locationData[key] && !initialFields.includes(key)) {
            initialFields.push(key);
            if (initialFields.length >= 3) break;
        }
    }

    if (initialFields.length === 0) {
        return DEFAULT_FALLBACK_FIELDS;
    }

    return initialFields.slice(0, 3);
};

export default function Location() {
    const { location, editedLocation, setLocation, setEditedLocation } = useLocationStore();
    const [isEdited, setIsEdited] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const { startLoading, stopLoading } = useLoaderStore();
    const [showTooltip, setShowTooltip] = useState(false);
    const [hoverTooltip, setHoverTooltip] = useState(false);
    const formRef = useRef(null);

    const [selectedFields, setSelectedFields] = useState([]);

    const initialLocationRef = useRef({});
    const initialSelectedFieldsRef = useRef([]);

    const locationToArray = (loc, fields = selectedFields) => {
        return fields.map(k => loc[k]).filter(Boolean);
    };

    const normalizeLocationData = (data) => {
        const normalized = {};
        ALL_LOCATION_FIELDS.forEach(({ key }) => {
            normalized[key] = data[key] || '';
        });
        normalized.country = data.country || '';

        normalized.city = data.city || data.town || data.village || data.suburb || data.locality || data.district || '';

        return normalized;
    };

    const fetchLocation = useCallback(async () => {
        if (Object.keys(location).length > 0 || isFetching) return;

        setIsFetching(true);

        const fetchProductsAndUpdateStores = async (locData) => {
            const normalizedData = normalizeLocationData(locData);

            const newSelectedFields = getInitialSelectedFields(normalizedData);
            setSelectedFields(newSelectedFields);
            initialSelectedFieldsRef.current = newSelectedFields;

            startLoading('fetching');
            try {
                const data = await getProducts(locationToArray(normalizedData, newSelectedFields));
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

        try {
            if (navigator.geolocation) {
                const geoPromise = new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 10000,
                        maximumAge: 300000,
                        enableHighAccuracy: true
                    });
                });

                await geoPromise.then(async (pos) => {
                    startLoading('fetchLoc');
                    const { latitude, longitude } = pos.coords;
                    const result = await fetchLocationThroughGps(latitude, longitude);
                    if (result.success) {
                        const normalized = await fetchProductsAndUpdateStores(result.data);
                        setLocation(normalized);
                        setEditedLocation(normalized);
                        initialLocationRef.current = normalized;
                        toast.success("Location fetched successfully via GPS");
                    } else {
                        const resultIp = await fetchLocationThroughIp();
                        const normalized = await fetchProductsAndUpdateStores(resultIp.data);
                        setLocation(normalized);
                        setEditedLocation(normalized);
                        initialLocationRef.current = normalized;
                    }
                }).catch(async (error) => {
                    startLoading('fetchLocIp');
                    const result = await fetchLocationThroughIp();
                    const normalized = await fetchProductsAndUpdateStores(result.data);
                    setLocation(normalized);
                    setEditedLocation(normalized);
                    initialLocationRef.current = normalized;
                });
            } else {
                startLoading('fetchLocIp');
                const result = await fetchLocationThroughIp();
                const normalized = await fetchProductsAndUpdateStores(result.data);
                setLocation(normalized);
                setEditedLocation(normalized);
                initialLocationRef.current = normalized;
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

    useEffect(() => {
        if (Object.keys(location).length > 0 && selectedFields.length === 0) {
            const initialFields = getInitialSelectedFields(location);
            setSelectedFields(initialFields);
            initialSelectedFieldsRef.current = initialFields;
            initialLocationRef.current = location;
        }
    }, [location, selectedFields.length]);


    const checkChanges = useCallback((currentEditedLocation, currentSelectedFields) => {
        const currentLocValues = locationToArray(initialLocationRef.current, initialSelectedFieldsRef.current).join('|');
        const editedLocValues = locationToArray(currentEditedLocation, currentSelectedFields).join('|');

        const locationValuesChanged = currentLocValues !== editedLocValues;
        const fieldsChanged = JSON.stringify(initialSelectedFieldsRef.current.slice().sort()) !== JSON.stringify(currentSelectedFields.slice().sort());
        return locationValuesChanged || fieldsChanged;
    }, [locationToArray]);

    const cancelEditing = useCallback(() => {
        setEditedLocation(initialLocationRef.current);
        setShowForm(false);
        setIsEdited(false);
        setSelectedFields(initialSelectedFieldsRef.current);
    }, [setEditedLocation]);

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
        const newEditedLocation = { ...editedLocation, [field]: value };
        setEditedLocation(newEditedLocation);
        setIsEdited(checkChanges(newEditedLocation, selectedFields));
    };

    const applyChanges = async () => {
        if (!checkChanges(editedLocation, selectedFields)) {
            setIsEdited(false);
            setShowForm(false);
            return;
        }

        initialLocationRef.current = editedLocation;
        initialSelectedFieldsRef.current = selectedFields;

        setLocation(editedLocation);
        setShowForm(false);
        toast.success("Location updated successfully");
        setIsEdited(false);

        startLoading('fetching');
        try {
            const data = await getProducts(locationToArray(editedLocation, selectedFields));
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
    };

    const handleRefresh = () => {
        setLocation({});
        setEditedLocation({});
        initialLocationRef.current = {};
        initialSelectedFieldsRef.current = [];
        setSelectedFields([]);
        setIsFetching(false);
        setShowForm(false);
        fetchLocation();
    };

    const toggleForm = () => {
        setShowForm(prev => {
            if (prev) {
                cancelEditing();
            } else {
                setEditedLocation(location);
                initialLocationRef.current = location;
                initialSelectedFieldsRef.current = selectedFields;
                setIsEdited(false);
            }
            return !prev;
        });
    };

    const renderLocationText = () => {
        const parts = locationToArray(location, selectedFields);
        return parts.join(", ");
    };

    const renderLocationTextInForm = () => {
        const parts = locationToArray(editedLocation, selectedFields);
        return parts.join(", ");
    };

    const handleClickOutsideTooltip = useCallback(() => setShowTooltip(false), []);
    useEffect(() => {
        document.addEventListener("click", handleClickOutsideTooltip);
        return () => document.removeEventListener("click", handleClickOutsideTooltip);
    }, [handleClickOutsideTooltip]);

    const handleFieldSelection = (key) => {
        setSelectedFields(prev => {
            let newFields;
            if (prev.includes(key)) {
                if (prev.length === 1) {
                    toast.error("You must select at least 1 field.");
                    return prev;
                }
                newFields = prev.filter(f => f !== key);
            } else {
                if (prev.length >= 3) {
                    toast.error("You can select a maximum of 3 fields.");
                    return prev;
                }
                newFields = [...prev, key];
            }

            setIsEdited(checkChanges(editedLocation, newFields));

            return newFields;
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
                        className="w-full pl-10 pr-4 py-2.5 border border-black dark:border-white rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                    <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-xl px-5 py-3.5 shadow-md gap-4">

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
                                className="flex items-center cursor-pointer gap-1.5 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors bg-sky-50 dark:bg-sky-900/20 px-3 py-2 rounded-lg font-medium border border-black dark:border-white"
                            >
                                <Edit size={16} /> Edit
                            </button>
                            <button
                                onClick={handleRefresh}
                                disabled={isFetching}
                                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-neutral-950 hover:bg-white dark:hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-wait font-medium transition-colors border border-black dark:border-white cursor-pointer"
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
                        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-black dark:border-white hide-scrollbar"
                    >
                        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-black dark:border-white px-6 py-4 flex justify-between items-center z-20">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Customize Location Filter
                            </h3>
                            <button
                                onClick={cancelEditing}
                                className="p-2 text-gray-500 cursor-pointer hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-black dark:border-white">
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
                                                        : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border-black dark:border-white hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 disabled:opacity-40 disabled:cursor-not-allowed'
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

                            <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg text-xs text-gray-600 dark:text-gray-400 border border-black dark:border-white">
                                <span className="font-semibold text-gray-900 dark:text-gray-100">Active Filter: </span>
                                {renderLocationTextInForm() || "No values entered yet"}
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 px-6 py-4 flex justify-center">
                            <button
                                onClick={applyChanges}
                                disabled={!isEdited || locationToArray(editedLocation, selectedFields).filter(Boolean).length === 0}
                                className="w-fit px-6 py-3 bg-sky-600 text-white rounded-lg cursor-pointer font-semibold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm border border-black dark:border-white"
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