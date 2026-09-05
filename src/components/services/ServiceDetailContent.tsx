"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Service } from '@/data/services';

export default function ServiceDetailContent({ service }: { service: Service }) {
  return (
    <div className="relative pt-32 pb-20 px-4 w-full min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-8 md:p-12 rounded-[var(--border-radius-lg)] bg-glass border border-glass-border backdrop-blur-[var(--blur-glass)] shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <span className="font-arcane text-xs uppercase tracking-[0.3em] text-gold/60 mb-4 block">
              {service.categoryLabel}
            </span>
            <h1 className="font-arcane text-4xl md:text-6xl text-gold mb-4 tracking-wider">
              {service.title}
            </h1>
            <p className="font-celestial text-xl text-muted italic">
              {service.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Left Column: Core Details */}
            <div className="md:col-span-2 space-y-12">
              <section>
                <h2 className="font-arcane text-2xl text-gold mb-4 border-b border-gold/20 pb-2">The Offering</h2>
                <p className="font-celestial text-lg text-moon-ivory/80 leading-relaxed">
                  {service.description}
                </p>
              </section>

              <section>
                <h2 className="font-arcane text-2xl text-gold mb-4 border-b border-gold/20 pb-2">The Approach</h2>
                <p className="font-celestial text-lg text-moon-ivory/80 leading-relaxed">
                  {service.approach}
                </p>
              </section>

              <section>
                <h2 className="font-arcane text-2xl text-gold mb-4 border-b border-gold/20 pb-2">What to Expect</h2>
                <p className="font-celestial text-lg text-moon-ivory/80 leading-relaxed">
                  {service.whatToExpect}
                </p>
              </section>
            </div>

            {/* Right Column: Logistics */}
            <div className="space-y-8">
              <div className="p-6 rounded-xl bg-obsidian/40 border border-gold/10">
                <h3 className="font-arcane text-sm uppercase tracking-widest text-gold mb-4">Details</h3>
                <div className="space-y-4 font-celestial text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Investment:</span>
                    <span className="text-gold">${service.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Duration:</span>
                    <span className="text-gold">{service.duration}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-obsidian/40 border border-gold/10">
                <h3 className="font-arcane text-sm uppercase tracking-widest text-gold mb-4">For Whom</h3>
                <p className="font-celestial text-sm text-muted italic">
                  {service.whoItIsFor}
                </p>
              </div>

              <div className="p-6 rounded-xl bg-obsidian/40 border border-gold/10">
                <h3 className="font-arcane text-sm uppercase tracking-widest text-gold mb-4">Preparation</h3>
                <p className="font-celestial text-sm text-muted">
                  {service.preparation}
                </p>
              </div>

              <div className="p-6 rounded-xl bg-obsidian/40 border border-gold/10">
                <h3 className="font-arcane text-sm uppercase tracking-widest text-gold mb-4">Deliverables</h3>
                <ul className="font-celestial text-sm text-muted space-y-2">
                  {service.deliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gold">✧</span> {d}
                    </li>
                  ))}
                </ul>
              </div>

              <button className="w-full py-4 font-arcane text-lg text-gold border border-gold/50 hover:bg-gold hover:text-obsidian transition-all duration-300 rounded-full uppercase tracking-widest">
                Request Session
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
