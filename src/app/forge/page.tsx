"use client";

import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ui/ProductCard';

const PRODUCTS = [
  {
    title: 'Shadow Sanctuary',
    category: 'Digital Journal',
    description: 'A comprehensive digital shadow-work companion designed to guide you through the darkness of Nigredo.',
    price: '$111',
  },
  {
    title: 'The Alchemist\'s Library',
    category: 'Resource Bundle',
    description: 'A curated collection of educational resources, guides, and references on spiritual alchemy.',
    price: '$44',
  },
  {
    title: 'Celestial Meditations',
    category: 'Audio Series',
    description: 'Guided meditative journeys to align your consciousness with higher dimensional frequencies.',
    price: '$66',
  },
  {
    title: 'Practitioner\'s Guide to Sigils',
    category: 'E-Book',
    description: 'A deep dive into the art of sigil magic and the manifestation of spiritual intent.',
    price: '$22',
  },
];

export default function ForgePage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-6 md:px-12 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="font-arcane text-5xl md:text-7xl text-seraphic-gold mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">
          The Forge
        </h1>
        <p className="font-celestial text-xl text-moon-ivory/60 max-w-2xl mx-auto">
          Digital tools, guided journeys, and alchemical resources to aid in your transformation.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PRODUCTS.map((product, index) => (
          <motion.div
            key={product.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard {...product} />
          </motion.div>
        ))}
      </div>

      <div className="mt-20 p-8 rounded-3xl bg-void-purple/20 border border-seraphic-gold/20 text-center max-w-3xl mx-auto">
        <h2 className="font-arcane text-3xl text-seraphic-gold mb-4">Future Creations</h2>
        <p className="font-celestial text-moon-ivory/60">
          The Forge is always burning. New courses on Energy Protection, Practical Magic, and Angelic Practices are currently being distilled.
        </p>
      </div>
    </div>
  );
}
