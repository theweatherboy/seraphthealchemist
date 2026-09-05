import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { GrimoireArticle } from '@/data/grimoire';
import GrimoireGrid from '@/components/grimoire/GrimoireGrid';

export default async function GrimoirePage() {
  const contentDir = path.join(process.cwd(), 'content/grimoire');
  const files = fs.readdirSync(contentDir);

  const articles: GrimoireArticle[] = files
    .filter(file => file.endsWith('.mdx'))
    .map(file => {
      const filePath = path.join(contentDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContent);
      return {
        slug: file.replace('.mdx', ''),
        ...data,
      } as GrimoireArticle;
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

        {/* Knowledge Grid - Moved to Client Component to avoid Server/Client conflict with Framer Motion */}
        <GrimoireGrid articles={articles} />
      </div>
    </div>
  );
}
