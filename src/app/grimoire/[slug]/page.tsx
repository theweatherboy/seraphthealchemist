import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MdxComponents';
import KnowledgeGraph from '@/components/grimoire/KnowledgeGraph';

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const contentDir = path.join(process.cwd(), 'content/grimoire');

  if (!fs.existsSync(contentDir)) {
    notFound();
  }

  const files = fs.readdirSync(contentDir);
  const allArticles = files
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

  const article = allArticles.find(a => a.slug === slug);

  if (!article) {
    notFound();
  }

  const fileContent = fs.readFileSync(path.join(contentDir, `${slug}.mdx`), 'utf8');

  return (
    <div className="relative pt-32 pb-20 px-4 w-full min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm font-celestial text-muted mb-12">
          <Link href="/grimoire" className="hover:text-gold transition-colors">Grimoire</Link>
          <span>/</span>
          <span className="text-gold">{article.category}</span>
        </nav>

        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="font-arcane text-4xl md:text-6xl text-gold mb-6 tracking-wider">
            {article.title}
          </h1>
          <p className="font-celestial text-xl text-muted italic max-w-2xl mx-auto">
            {article.description}
          </p>
        </header>

        {/* Content */}
        <article className="font-celestial text-moon-ivory/90 leading-relaxed text-lg space-y-6 prose prose-invert max-w-none">
          <MDXRemote
            source={fileContent}
            components={mdxComponents}
          />
        </article>

        {/* Knowledge Graph Section */}
        <section className="mt-20 mb-12">
          <h3 className="font-arcane text-2xl text-gold mb-8 text-center tracking-widest uppercase">
            Conceptual Connections
          </h3>
          <KnowledgeGraph
            currentSlug={article.slug}
            relatedSlugs={article.related || []}
            allArticles={allArticles}
          />
        </section>

        {/* Footer / Related */}
        <footer className="mt-20 pt-12 border-t border-gold/20">
          <h3 className="font-arcane text-2xl text-gold mb-8 text-center">Explore Related Concepts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {article.related?.map((rel: string) => (
              <Link
                key={rel}
                href={`/grimoire/${rel}`}
                className="p-4 rounded-xl bg-glass border border-glass-border hover:border-gold/50 transition-all text-center font-celestial text-muted hover:text-gold"
              >
                {rel.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
