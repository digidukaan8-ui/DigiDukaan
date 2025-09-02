export const categories = [
  {
    name: "Grocery",
    subCategories: ["Fruit", "Vegetables", "Dairy", "Bakery", "Snacks"]
  },
  {
    name: "Electronics",
    subCategories: ["Mobiles", "Laptops", "Headphones", "Cameras", "Accessories"]
  },
  {
    name: "Clothing",
    subCategories: ["Men", "Women", "Kids", "Footwear", "Accessories"]
  },
  {
    name: "Home & Kitchen",
    subCategories: ["Furniture", "Decor", "Kitchenware", "Bedding", "Appliances"]
  },
  {
    name: "Beauty & Personal Care",
    subCategories: ["Skincare", "Haircare", "Makeup", "Fragrances", "Wellness"]
  },
  {
    name: "Sports & Outdoors",
    subCategories: ["Fitness", "Outdoor Gear", "Sportswear", "Cycling", "Camping"]
  },
  {
    name: "Books & Stationery",
    subCategories: ["Fiction", "Non-Fiction", "Educational", "Comics", "Office Supplies"]
  },
  {
    name: "Toys & Baby Products",
    subCategories: ["Toys", "Baby Care", "Feeding", "Diapers", "Clothing"]
  }
];

export const getSubCategories = (categoryName) => {
  const category = categories.find((cat) => cat.name === categoryName);
  return category ? category.subCategories : [];
};

export const usedProductCategories = [
  {
    name: "Mobiles",
    subCategories: ["Smartphones", "Feature Phones", "Accessories"]
  },
  {
    name: "Electronics",
    subCategories: ["Laptops", "Cameras", "Headphones", "TV & Audio", "Other Electronics"]
  },
  {
    name: "Cars",
    subCategories: ["Sedan", "SUV", "Hatchback", "Luxury", "Other Vehicles"]
  },
  {
    name: "Motorcycles",
    subCategories: ["Bike", "Scooter", "Bicycle", "Accessories"]
  },
  {
    name: "Furniture",
    subCategories: ["Sofas", "Beds", "Tables & Chairs", "Cabinets", "Other Furniture"]
  },
  {
    name: "Home Appliances",
    subCategories: ["Refrigerator", "Washing Machine", "Microwave", "Air Conditioner", "Other Appliances"]
  },
  {
    name: "Fashion",
    subCategories: ["Men's Clothing", "Women's Clothing", "Footwear", "Watches & Accessories"]
  },
  {
    name: "Books",
    subCategories: ["Educational", "Fiction", "Non-Fiction", "Comics"]
  },
  {
    name: "Sports & Fitness",
    subCategories: ["Gym Equipment", "Bicycles", "Sports Gear", "Outdoor Games"]
  },
  {
    name: "Toys & Baby Products",
    subCategories: ["Toys", "Baby Care", "Feeding", "Diapers", "Clothing"]
  }
];

export const getUsedProductSubCategories = (categoryName) => {
  const category = usedProductCategories.find(cat => cat.name === categoryName);
  return category ? category.subCategories : [];
};
