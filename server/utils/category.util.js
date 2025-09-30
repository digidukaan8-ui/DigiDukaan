const categories = [
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

const isValidCategory = (category) => {
  return categories.some(cat => cat.name === category);
};

const isValidSubCategory = (category, subCategory) => {
  const categoryObj = categories.find(cat => cat.name === category);
  return categoryObj && categoryObj.subCategories.includes(subCategory);
};

const usedProductCategories = [
  {
    name: "Mobiles",
    subCategories: [
      { name: "Smartphones", price: 50 },
      { name: "Feature Phones", price: 30 },
      { name: "Accessories", price: 20 }
    ]
  },
  {
    name: "Electronics",
    subCategories: [
      { name: "Laptops", price: 100 },
      { name: "Cameras", price: 80 },
      { name: "Headphones", price: 30 },
      { name: "TV & Audio", price: 120 },
      { name: "Other Electronics", price: 50 }
    ]
  },
  {
    name: "Cars",
    subCategories: [
      { name: "Sedan", price: 500 },
      { name: "SUV", price: 700 },
      { name: "Hatchback", price: 400 },
      { name: "Luxury", price: 1000 },
      { name: "Other Vehicles", price: 300 }
    ]
  },
  {
    name: "Motorcycles",
    subCategories: [
      { name: "Bike", price: 150 },
      { name: "Scooter", price: 100 },
      { name: "Bicycle", price: 50 },
      { name: "Accessories", price: 20 }
    ]
  },
  {
    name: "Furniture",
    subCategories: [
      { name: "Sofas", price: 200 },
      { name: "Beds", price: 250 },
      { name: "Tables & Chairs", price: 150 },
      { name: "Cabinets", price: 100 },
      { name: "Other Furniture", price: 80 }
    ]
  },
  {
    name: "Home Appliances",
    subCategories: [
      { name: "Refrigerator", price: 300 },
      { name: "Washing Machine", price: 250 },
      { name: "Microwave", price: 100 },
      { name: "Air Conditioner", price: 350 },
      { name: "Other Appliances", price: 80 }
    ]
  },
  {
    name: "Fashion",
    subCategories: [
      { name: "Men's Clothing", price: 30 },
      { name: "Women's Clothing", price: 30 },
      { name: "Footwear", price: 20 },
      { name: "Watches & Accessories", price: 50 }
    ]
  },
  {
    name: "Books",
    subCategories: [
      { name: "Educational", price: 10 },
      { name: "Fiction", price: 15 },
      { name: "Non-Fiction", price: 15 },
      { name: "Comics", price: 10 }
    ]
  },
  {
    name: "Sports & Fitness",
    subCategories: [
      { name: "Gym Equipment", price: 100 },
      { name: "Bicycles", price: 80 },
      { name: "Sports Gear", price: 40 },
      { name: "Outdoor Games", price: 30 }
    ]
  },
  {
    name: "Toys & Baby Products",
    subCategories: [
      { name: "Toys", price: 20 },
      { name: "Baby Care", price: 25 },
      { name: "Feeding", price: 15 },
      { name: "Diapers", price: 10 },
      { name: "Clothing", price: 20 }
    ]
  }
];

const getPriceForUsedProduct = (categoryName, subCategoryName) => {
  const categoryObj = usedProductCategories.find(
    cat => cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  if (!categoryObj) return null;

  const subCategoryObj = categoryObj.subCategories.find(
    sub => sub.name.toLowerCase() === subCategoryName.toLowerCase()
  );
  return subCategoryObj ? subCategoryObj.price : null;
};

const isValidUsedProductCategory = (category) => {
  return usedProductCategories.some(cat => cat.name.toLowerCase() === category.toLowerCase());
};

const isValidUsedProductSubCategory = (category, subCategory) => {
  const categoryObj = usedProductCategories.find(cat => cat.name.toLowerCase() === category.toLowerCase());
  return categoryObj && categoryObj.subCategories.some(sub => sub.name.toLowerCase() === subCategory.toLowerCase());
};

export { categories, isValidCategory, isValidSubCategory, usedProductCategories, isValidUsedProductCategory, isValidUsedProductSubCategory, getPriceForUsedProduct };