import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Truck, ShieldCheck, Heart, BadgeCheck, Flame } from 'lucide-react';

const Home = () => {
  return (
    <div className="w-full bg-white text-gray-800">

      {/* Hero Section */}
      <section className="h-screen bg-gradient-to-r from-gray-100 to-white flex flex-col md:flex-row items-center justify-between px-10">
        <motion.div 
          className="md:w-1/2 space-y-6"
          initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1 }}
        >
          <h1 className="text-5xl font-bold leading-tight">Upgrade Your Style with <span className="text-blue-600">Trendy Products</span></h1>
          <p className="text-lg text-gray-600">Discover the latest arrivals in fashion, electronics, and more – all in one place!</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition">Shop Now</button>
        </motion.div>
        <motion.img 
          src="https://images.unsplash.com/photo-1585386959984-a4155224c85b" 
          alt="hero" 
          className="md:w-1/2 w-full max-h-[500px] object-cover mt-10 md:mt-0 rounded-xl shadow-lg"
          initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1 }}
        />
      </section>

      {/* Features Section */}
      <section className="py-10 bg-white border-t">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 text-center gap-6 px-4">
          {[
            { icon: <Truck size={32} />, label: 'Fast Delivery' },
            { icon: <ShieldCheck size={32} />, label: 'Secure Payments' },
            { icon: <Heart size={32} />, label: 'Loved by Millions' },
            { icon: <BadgeCheck size={32} />, label: 'Premium Quality' },
          ].map((item, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.1 }} className="flex flex-col items-center">
              <div className="text-blue-600 mb-2">{item.icon}</div>
              <p className="font-semibold text-gray-700">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Explore Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {[
              { icon: <ShoppingBag />, label: 'Fashion', img: 'https://images.unsplash.com/photo-1556909190-ef3ae1d095b3' },
              { icon: <ShieldCheck />, label: 'Electronics', img: 'https://images.unsplash.com/photo-1549921296-3a7b45d4a82c' },
              { icon: <Truck />, label: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1586201375761-83865001e17b' },
              { icon: <Star />, label: 'Top Rated', img: 'https://images.unsplash.com/photo-1606813906762-bac0650d41a4' },
            ].map((cat, index) => (
              <motion.div 
                key={index} 
                className="p-4 bg-white shadow rounded-xl hover:shadow-xl transition flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
              >
                <img src={cat.img} alt={cat.label} className="w-full h-32 object-cover rounded-md mb-3" />
                <div className="text-blue-600 mb-2">{cat.icon}</div>
                <p className="font-medium">{cat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10 text-center">Trending Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
              <motion.div 
                key={i} 
                className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition"
                whileHover={{ scale: 1.03 }}
              >
                <img 
                  src={`https://source.unsplash.com/random/400x400?ecommerce,product&sig=${i}`} 
                  alt="product" 
                  className="w-full h-60 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">Product Name {i + 1}</h3>
                  <p className="text-blue-600 font-bold">₹{(i + 1) * 999}</p>
                  <button className="mt-2 text-sm text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Buy Now</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
