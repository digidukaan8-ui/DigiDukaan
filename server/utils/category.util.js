const categories = [
  {
    name: "Grocery",
    subCategories: [
      { name: "Fruit", platform: 5, gst: 5 },
      { name: "Vegetables", platform: 5, gst: 5 },
      { name: "Dairy", platform: 5, gst: 5 },
      { name: "Bakery", platform: 6, gst: 5 },
      { name: "Snacks", platform: 7, gst: 12 }
    ]
  },
  {
    name: "Electronics",
    subCategories: [
      { name: "Mobiles", platform: 8, gst: 18 },
      { name: "Laptops", platform: 8, gst: 18 },
      { name: "Headphones", platform: 8, gst: 18 },
      { name: "Cameras", platform: 8, gst: 18 },
      { name: "Accessories", platform: 8, gst: 18 }
    ]
  },
  {
    name: "Clothing",
    subCategories: [
      { name: "Men", platform: 7, gst: 12 },
      { name: "Women", platform: 7, gst: 12 },
      { name: "Kids", platform: 7, gst: 12 },
      { name: "Footwear", platform: 7, gst: 18 },
      { name: "Accessories", platform: 7, gst: 18 }
    ]
  },
  {
    name: "Home & Kitchen",
    subCategories: [
      { name: "Furniture", platform: 6, gst: 12 },
      { name: "Decor", platform: 6, gst: 12 },
      { name: "Kitchenware", platform: 6, gst: 12 },
      { name: "Bedding", platform: 6, gst: 12 },
      { name: "Appliances", platform: 6, gst: 18 }
    ]
  },
  {
    name: "Beauty & Personal Care",
    subCategories: [
      { name: "Skincare", platform: 10, gst: 18 },
      { name: "Haircare", platform: 10, gst: 18 },
      { name: "Makeup", platform: 10, gst: 18 },
      { name: "Fragrances", platform: 10, gst: 18 },
      { name: "Wellness", platform: 10, gst: 18 }
    ]
  },
  {
    name: "Sports & Outdoors",
    subCategories: [
      { name: "Fitness", platform: 6, gst: 12 },
      { name: "Outdoor Gear", platform: 6, gst: 12 },
      { name: "Sportswear", platform: 6, gst: 12 },
      { name: "Cycling", platform: 6, gst: 12 },
      { name: "Camping", platform: 6, gst: 12 }
    ]
  },
  {
    name: "Books & Stationery",
    subCategories: [
      { name: "Fiction", platform: 4, gst: 5 },
      { name: "Non-Fiction", platform: 4, gst: 5 },
      { name: "Educational", platform: 4, gst: 5 },
      { name: "Comics", platform: 4, gst: 5 },
      { name: "Office Supplies", platform: 4, gst: 12 }
    ]
  },
  {
    name: "Toys & Baby Products",
    subCategories: [
      { name: "Toys", platform: 5, gst: 12 },
      { name: "Baby Care", platform: 5, gst: 12 },
      { name: "Feeding", platform: 5, gst: 12 },
      { name: "Diapers", platform: 5, gst: 12 },
      { name: "Clothing", platform: 5, gst: 12 }
    ]
  }
];

function getPlatformCharge(subCategoryName, basePrice) {
  for (const category of categories) {
    const subCat = category.subCategories.find(sc => sc.name === subCategoryName);
    if (subCat) {
      return (basePrice * subCat.platform) / 100;
    }
  }
  return 0;
}

function getTax(subCategoryName, basePrice) {
  for (const category of categories) {
    const subCat = category.subCategories.find(sc => sc.name === subCategoryName);
    if (subCat) {
      if (category.name === "Clothing" && basePrice > 1000) {
        return (basePrice * 18) / 100;
      }
      return (basePrice * subCat.gst) / 100;
    }
  }
  return 0;
}

const isValidCategory = (category) => {
  return categories.some(cat => cat.name === category);
};

const isValidSubCategory = (category, subCategory) => {
  const categoryObj = categories.find(cat => cat.name === category);
  return categoryObj && categoryObj.subCategories.some(sub => sub.name.toLowerCase() === subCategory.toLowerCase());
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

export { categories, isValidCategory, isValidSubCategory, usedProductCategories, isValidUsedProductCategory, isValidUsedProductSubCategory, getPriceForUsedProduct, getPlatformCharge, getTax };