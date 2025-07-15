import React from 'react';

export default function Footer() {
  return (
    <footer className="py-10 bg-white border-t border-gray-200 text-center text-gray-500 text-sm">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          &copy; {new Date().getFullYear()} Sure Filter®. All rights reserved.
        </div>
        <div className="flex gap-4">
          <a href="#contact" className="hover:text-sure-orange-500 transition">Contact</a>
          <a href="#warranty" className="hover:text-sure-orange-500 transition">Warranty</a>
          <a href="#products" className="hover:text-sure-orange-500 transition">Products</a>
        </div>
      </div>
    </footer>
  );
} 