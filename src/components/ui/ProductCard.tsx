"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  title: string;
  category: string;
  description: string;
  price: string;
  image?: string;
}

export default function ProductCard({ title, category, description, price, image }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group relative p-6 bg-void-purple/30 border border-seraphic-gold/20 rounded-2xl hover:border-seraphic-gold transition-all overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-seraphic-gold/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-seraphic-gold/10 transition-all" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] font-celestial text-seraphic-gold uppercase tracking-widest px-2 py-1 bg-seraphic-gold/10 rounded-full border border-seraphic-gold/20">
            {category}
          </span>
          <span className="font-arcane text-lg text-moon-ivory">{price}</span>
        </div>

        <h3 className="font-arcane text-2xl text-moon-ivory mb-3 group-hover:text-seraphic-gold transition-colors">
          {title}
        </h3>
        <p className="font-celestial text-moon-ivory/60 mb-6 leading-relaxed">
          {description}
        </p>

        <button className="w-full py-3 px-4 bg-obsidian border border-seraphic-gold/40 text-seraphic-gold font-arcane rounded-xl hover:bg-seraphic-gold hover:text-obsidian transition-all flex items-center justify-center gap-2 group">
          <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
          <span>ACQUIRE</span>
        </button>
      </div>
    </motion.div>
  );
}
