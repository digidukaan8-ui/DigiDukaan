// components/forms/DeliveryForm.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const DeliveryForm = () => {
    const { register, handleSubmit, reset } = useForm();
    const [deliveryAreas, setDeliveryAreas] = useState([]);

    const options = [
        "locality",
        "pincode",
        "suburb",
        "city",
        "district",
        "state",
        "country",
    ];

    const onAdd = (data) => {
        if (data.field && data.value) {
            setDeliveryAreas([
                ...deliveryAreas,
                { type: data.field, value: data.value },
            ]);
            reset();
        }
    };

    const onConfirm = () => {
        console.log("Delivery Areas:", deliveryAreas);

    };

    const handleRemove = (index) => {
        const newList = [...deliveryAreas];
        newList.splice(index, 1);
        setDeliveryAreas(newList);
    };

    return (
        <div className="p-6 border rounded-2xl shadow-md w-full max-w-lg 
                    bg-white dark:bg-gray-800 dark:text-gray-100">
            <h2 className="text-2xl font-bold mb-4">Delivery Form</h2>

            {/* Add Form */}
            <form
                onSubmit={handleSubmit(onAdd)}
                className="flex flex-col sm:flex-row gap-3 mb-4"
            >
                <select
                    {...register("field", { required: true })}
                    className="border rounded-lg p-2 flex-1 bg-white dark:bg-gray-700 dark:border-gray-600"
                >
                    <option value="">Select Field</option>
                    {options.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    {...register("value", { required: true })}
                    placeholder="Enter value"
                    className="border rounded-lg p-2 flex-1 bg-white dark:bg-gray-700 dark:border-gray-600"
                />

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                    Add
                </button>
            </form>

            {/* Show Added List */}
            <ul className="space-y-2 mb-4">
                {deliveryAreas.map((area, index) => (
                    <li
                        key={index}
                        className="flex justify-between items-center border-b dark:border-gray-600 pb-1"
                    >
                        <span>
                            <strong className="capitalize">{area.type}:</strong> {area.value}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className="text-red-500 hover:underline"
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>

            {/* Confirm Button */}
            <button
                type="button"
                onClick={onConfirm}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full transition"
            >
                Confirm
            </button>
        </div>
    );
};

export default DeliveryForm;