"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { services } from '@/data/services';
import ServiceCard from '@/components/services/ServiceCard';

export default function ServicesPage() {
  const categories = [
    { id: 'seer', label: 'THE SEER', desc: 'Tarot / Oracle / Intuitive Reading' },
    { id: 'healer', label: 'THE HEALER', desc: 'Reiki / Seraphic Healing / Energy Work' },
    { id: 'alchemist', label: 'THE ALCHEMIST', desc: 'Transformation / Shadow Work' },
    { id: 'oracle', label: 'THE ORACLE', desc: 'Spiritual Guidance / Divination' },
    { id: 'journey', label: 'THE JOURNEY', desc: 'Long-term spiritual guidance' },
  ];

  return (
    <div className="relative pt-32 pb-20 px-4 w-full min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-arcane text-5xl md:text-7xl text-gold mb-6 tracking-widest"
          >
            OFFERINGS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-celestial text-xl text-muted max-w-2xl mx-auto"
          >
            Choose the path that resonates with your current state of becoming.
          </motion.p>
        </div>

        <div className="space-y-32">
          {categories.map((cat) => {
            const categoryServices = services.filter(s => s.category === cat.id);
            if (categoryServices.length === 0) return null;

            return (
              <div key={cat.id} className="relative">
                <div className="text-center mb-12">
                  <h2 className="font-arcane text-3xl md:text-5xl text-gold mb-2 tracking-wider">
                    {cat.label}
                  </h2>
                  <p className="font-celestial text-muted italic">
                    {cat.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryServices.map((service) => (
                    <ServiceCard key={service.slug} service={service} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
