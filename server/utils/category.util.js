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

export {categories,isValidCategory,isValidSubCategory};