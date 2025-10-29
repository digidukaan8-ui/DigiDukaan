import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { fetchLocationThroughGps, fetchLocationThroughIp } from "../api/location";
import useLocationStore from "../store/location";
import { toast } from 'react-hot-toast';
import useLoaderStore from "../store/loader";
import { MapPin, Edit, X, RefreshCw, Save } from 'lucide-react';
import { getProducts } from '../api/product';
import useStores from '../store/stores';
import useCategoryProductStore from "../store/categoryProducts";
import useUsedCategoryProductStore from "../store/categoryUsedProduct";
import useAuthStore from "../store/auth";

const LOCATION_OPTIONS = [
    { key: "pincode", label: "Pincode", placeholder: "Enter pincode (e.g., 400001)" },
    { key: "city", label: "City", placeholder: "Enter city name (e.g., Mumbai)" },
    { key: "town", label: "Town", placeholder: "Enter town name" },
    { key: "locality", label: "Area/Locality", placeholder: "Enter area or locality (e.g., Bandra)" },
];

export default function Location() {
    const { location, setLocation, setEditedLocation } = useLocationStore();
    const [isFetching, setIsFetching] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const { startLoading, stopLoading } = useLoaderStore();
    const formRef = useRef(null);
    const menuRef = useRef(null);
    const { user } = useAuthStore();

    const [selectedField, setSelectedField] = useState("pincode");
    const [locationValue, setLocationValue] = useState("");
    const [tempSelectedField, setTempSelectedField] = useState("pincode");
    const [tempLocationValue, setTempLocationValue] = useState("");

    const isInitialMount = useRef(true);

    const normalizeLocationData = (data) => {
        return {
            pincode: data.pincode || '',
            city: data.city || data.town || data.village || data.suburb || data.locality || data.district || '',
            town: data.town || '',
            locality: data.locality || '',
            country: data.country || ''
        };
    };

    const determineLocationField = (locData) => {
        if (locData.pincode) return { field: "pincode", value: locData.pincode };
        if (locData.locality) return { field: "locality", value: locData.locality };
        if (locData.town) return { field: "town", value: locData.town };
        if (locData.city) return { field: "city", value: locData.city };
        return { field: "pincode", value: "" };
    };

    const fetchProductsAndUpdateStores = useCallback(async (value) => {
        if (!value || !value.trim()) {
            return;
        }

        startLoading('fetching');
        try {
            const data = await getProducts(value.trim());
            if (data.success) {
                useStores.getState().clearStores();
                useStores.getState().addStores(data.stores);
                useCategoryProductStore.getState().clearCategories();
                useCategoryProductStore.getState().setAllCategories(data.productsByCategory);
                useUsedCategoryProductStore.getState().clearUsedCategories();
                useUsedCategoryProductStore.getState().setAllUsedCategories(data.usedProductsByCategory);
                toast.success(`Products fetched for: ${value.trim()}`);
            } else {
                toast.error("Failed to fetch products");
            }
        } catch (error) {
            console.error("Product fetch error:", error);
            toast.error("Failed to fetch products");
        } finally {
            stopLoading();
        }
    }, [startLoading, stopLoading]);

    const requestLocationPermission = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation not supported"));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => resolve(position),
                (error) => reject(error),
                {
                    timeout: 10000,
                    maximumAge: 300000,
                    enableHighAccuracy: true
                }
            );
        });
    }, []);

    const fetchLocation = useCallback(async () => {
        setIsFetching(true);
        startLoading('fetchLoc');

        try {
            let normalized;

            try {
                const position = await requestLocationPermission();
                const { latitude, longitude } = position.coords;

                const result = await fetchLocationThroughGps(latitude, longitude);

                if (result.success && result.data) {
                    normalized = normalizeLocationData(result.data);
                    toast.success("Location fetched successfully via GPS");
                } else {
                    const resultIp = await fetchLocationThroughIp();
                    normalized = normalizeLocationData(resultIp.data);
                    toast.success("Location fetched via IP");
                }
            } catch (gpsError) {
                const result = await fetchLocationThroughIp();
                normalized = normalizeLocationData(result.data);
                toast.success("Location fetched via IP fallback");
            }

            if (normalized) {
                const { field, value } = determineLocationField(normalized);

                setSelectedField(field);
                setLocationValue(value);
                setLocation(normalized);
                setEditedLocation(normalized);

                await fetchProductsAndUpdateStores(value);
            }
        } catch (error) {
            console.error("Location fetch error:", error);
            toast.error("Failed to fetch location");
        } finally {
            stopLoading();
            setIsFetching(false);
        }
    }, [setLocation, setEditedLocation, fetchProductsAndUpdateStores, startLoading, stopLoading, requestLocationPermission]);

    useEffect(() => {
        if (isInitialMount.current && Object.keys(useLocationStore.getState().location).length === 0) {
            fetchLocation();
        }
        isInitialMount.current = false;
    }, [fetchLocation]);

    useEffect(() => {
        if (Object.keys(location).length > 0 && !locationValue) {
            const { field, value } = determineLocationField(location);
            setSelectedField(field);
            setLocationValue(value);
        }
    }, [location, locationValue]);

    const cancelEditing = useCallback(() => {
        setTempSelectedField(selectedField);
        setTempLocationValue(locationValue);
        setShowForm(false);
    }, [selectedField, locationValue]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showForm && formRef.current && !formRef.current.contains(event.target)) {
                cancelEditing();
            }
            else if (showMenu && menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('.fixed.bottom-6.right-6 button')) {
                setShowMenu(false);
            }
        };

        if (showForm || showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showForm, showMenu, cancelEditing]);


    const applyChanges = async () => {
        if (!tempLocationValue.trim()) {
            toast.error("Please enter a location value");
            return;
        }

        setSelectedField(tempSelectedField);
        setLocationValue(tempLocationValue);

        const updatedLocation = {
            pincode: '',
            city: '',
            town: '',
            locality: '',
            country: location.country || ''
        };
        updatedLocation[tempSelectedField] = tempLocationValue;

        setLocation(updatedLocation);
        setEditedLocation(updatedLocation);
        setShowForm(false);
        setShowMenu(false);
        toast.success("Location updated successfully");

        await fetchProductsAndUpdateStores(tempLocationValue);
    };

    const handleRefresh = () => {
        setLocation({});
        setEditedLocation({});
        setSelectedField("pincode");
        setLocationValue("");
        setTempSelectedField("pincode");
        setTempLocationValue("");
        setShowForm(false);
        setShowMenu(false);
        fetchLocation();
    };

    const toggleMenu = () => {
        if (showForm) {
            setShowForm(false);
        }
        setShowMenu(prev => !prev);
    };

    const openEditForm = () => {
        setTempSelectedField(selectedField);
        setTempLocationValue(locationValue);
        setShowMenu(false);
        setShowForm(true);
    }

    const getDisplayText = () => {
        const option = LOCATION_OPTIONS.find(opt => opt.key === selectedField);
        return locationValue ? `${option?.label}: ${locationValue}` : "Detecting location...";
    };

    const currentPlaceholder = useMemo(() => {
        return LOCATION_OPTIONS.find(opt => opt.key === tempSelectedField)?.placeholder;
    }, [tempSelectedField]);

    const getAutoCompleteValue = useMemo(() => {
        switch (tempSelectedField) {
            case 'pincode': return 'postal-code';
            case 'city': return 'address-level2';
            case 'town': return 'address-level3';
            case 'locality': return 'address-level4';
            default: return 'off';
        }
    }, [tempSelectedField]);

    if (user?.role === "seller" || user?.role === "admin") {
        return null;
    }

    return (
        <>
            <div className="fixed bottom-6 right-6 z-[1000]">
                <button
                    onClick={toggleMenu}
                    className={`p-4 rounded-full transition-all duration-300 transform ${(showMenu || showForm) ? 'bg-sky-700 text-white rotate-45' : 'bg-sky-600 text-white hover:bg-sky-700'
                        } disabled:opacity-50 border border-transparent`}
                    aria-label={showMenu || showForm ? "Close location menu" : "Open location menu to view or edit"}
                    disabled={isFetching}
                >
                    {(showMenu || showForm) ? <X size={24} /> : <MapPin size={24} />}
                </button>
            </div>

            {showMenu && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                    <div
                        ref={menuRef}
                        className="bg-white dark:bg-neutral-900 rounded-xl w-full max-w-xs sm:max-w-md transform transition-all duration-300 scale-100 border border-gray-300 dark:border-neutral-700"
                    >
                        <div className="p-5 flex flex-col gap-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MapPin size={20} className="text-sky-600" /> Your Current Location
                            </h3>

                            <div className="border border-gray-200 dark:border-neutral-700 rounded-lg p-3 bg-gray-50 dark:bg-neutral-800">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selected Location:</p>
                                <span className="text-base font-semibold text-gray-900 dark:text-white truncate block">
                                    {isFetching ? "Detecting Location..." : getDisplayText()}
                                </span>
                            </div>

                            <div className="flex justify-between gap-3 pt-2">
                                <button
                                    onClick={openEditForm}
                                    className="flex items-center justify-center gap-2 text-sm flex-1 px-4 py-2 rounded-lg font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors border border-transparent"
                                    aria-label="Open Edit Form"
                                    disabled={isFetching}
                                >
                                    <Edit size={18} /> Edit
                                </button>
                                <button
                                    onClick={handleRefresh}
                                    disabled={isFetching}
                                    className="flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-lg font-medium bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-wait transition-colors border border-gray-300 dark:border-neutral-700"
                                    aria-label="Re-fetch Location"
                                >
                                    <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {showForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                    <div
                        ref={formRef}
                        className="bg-white dark:bg-neutral-900 rounded-xl w-full max-w-xs sm:max-w-md transform transition-all duration-300 scale-100 border border-gray-300 dark:border-neutral-700"
                    >
                        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-neutral-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Edit size={20} className="text-sky-600" /> Edit Location
                            </h3>
                            <button
                                onClick={cancelEditing}
                                className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                                aria-label="Close"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3" htmlFor="location-type">
                                    Change Search Type
                                </label>
                                <div id="location-type" className="flex flex-wrap gap-2">
                                    {LOCATION_OPTIONS.map(option => (
                                        <button
                                            key={option.key}
                                            onClick={() => {
                                                setTempSelectedField(option.key);
                                                setTempLocationValue('');
                                            }}
                                            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${tempSelectedField === option.key
                                                ? 'bg-sky-600 text-white border-sky-600'
                                                : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-700 hover:text-sky-600'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2" htmlFor="location-input">
                                    Enter Value for {LOCATION_OPTIONS.find(opt => opt.key === tempSelectedField)?.label}
                                </label>
                                <input
                                    id="location-input"
                                    type="text"
                                    value={tempLocationValue}
                                    onChange={(e) => setTempLocationValue(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-base"
                                    placeholder={currentPlaceholder}
                                    autoComplete={getAutoCompleteValue}
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-neutral-900 px-6 py-4 flex justify-end rounded-b-xl border-t border-gray-200 dark:border-neutral-700">
                            <button
                                onClick={applyChanges}
                                disabled={!tempLocationValue.trim()}
                                className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-lg font-bold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-transparent"
                            >
                                <Save size={20} /> Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}