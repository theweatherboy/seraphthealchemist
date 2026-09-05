import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default async function GrimoirePage() {
  const contentDir = path.join(process.cwd(), 'content/grimoire');
  const files = fs.readdirSync(contentDir);

  const articles = files
    .filter(file => file.endsWith('.mdx'))
    .map(file => {
      const filePath = path.join(contentDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContent);
      return {
        slug: file.replace('.mdx', ''),
        ...data,
      };
    });

  const categories = Array.from(new Set(articles.map(a => a.category)));

  return (
    <div className="relative pt-32 pb-20 px-4 w-full min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="font-arcane text-5xl md:text-7xl text-gold mb-6 tracking-widest">
            THE GRIMOIRE
          </h1>
          <p className="font-celestial text-xl text-muted max-w-2xl mx-auto">
            A repository of mystical knowledge, spiritual alchemy, and cosmic laws.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <button className="px-6 py-2 rounded-full bg-gold text-obsidian font-arcane text-sm uppercase tracking-widest">
            All
          </button>
          {categories.map(cat => (
            <button key={cat} className="px-6 py-2 rounded-full bg-glass border border-glass-border text-gold font-arcane text-sm uppercase tracking-widest hover:bg-gold hover:text-obsidian transition-all">
              {cat}
            </button>
          ))}
        </div>

        {/* Knowledge Grid */}
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
      </div>
    </div>
  );
}
