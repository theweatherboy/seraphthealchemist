"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Service } from '@/data/services';

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group relative p-8 rounded-[var(--border-radius-lg)] bg-glass border border-glass-border backdrop-blur-[var(--blur-glass)] shadow-2xl flex flex-col h-full transition-all duration-500 hover:border-gold/50"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="font-arcane text-xs uppercase tracking-[0.2em] text-gold/60 mb-2 block">
            {service.categoryLabel}
          </span>
          <h3 className="font-arcane text-2xl text-gold group-hover:text-white transition-colors">
            {service.title}
          </h3>
          <p className="font-celestial text-sm text-muted italic mb-4">
            {service.subtitle}
          </p>
        </div>
        <div className="text-right">
          <span className="font-arcane text-xl text-gold">${service.price}</span>
        </div>
      </div>

      <p className="font-celestial text-moon-ivory/80 leading-relaxed mb-8 flex-grow">
        {service.description}
      </p>

      <Link
        href={`/services/${service.slug}`}
        className="inline-block text-center px-6 py-3 font-arcane text-sm uppercase tracking-widest text-gold border border-gold/30 hover:bg-gold hover:text-obsidian transition-all duration-300 rounded-full"
      >
        Discover the Path
      </Link>

      {/* Subtle glow based on realm color */}
      <div
        className="absolute -inset-1 rounded-[var(--border-radius-lg)] opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl -z-10"
        style={{ backgroundColor: service.color || 'var(--color-gold)' }}
      />
    </motion.div>
  );
}
