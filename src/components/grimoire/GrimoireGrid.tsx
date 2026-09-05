"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GrimoireArticle } from '@/data/grimoire';

export default function GrimoireGrid({ articles }: { articles: GrimoireArticle[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article, idx) => (
        <motion.div
          key={article.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="group relative p-8 rounded-[var(--border-radius-lg)] bg-glass border border-glass-border backdrop-blur-[var(--blur-glass)] hover:border-gold/50 transition-all duration-500"
        >
          <span className="font-arcane text-xs uppercase tracking-widest text-gold/60 mb-3 block">
            {article.category}
          </span>
          <h3 className="font-arcane text-2xl text-gold mb-4 group-hover:text-white transition-colors">
            {article.title}
          </h3>
          <p className="font-celestial text-moon-ivory/70 mb-6 line-clamp-3">
            {article.description}
          </p>
          <Link
            href={`/grimoire/${article.slug}`}
            className="inline-block text-sm font-arcane uppercase tracking-widest text-gold hover:underline"
          >
            Read Article →
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
