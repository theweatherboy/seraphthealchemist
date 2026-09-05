"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Node {
  id: string;
  label: string;
  color: string;
}

interface Edge {
  source: string;
  target: string;
}

interface KnowledgeGraphProps {
  currentSlug: string;
  relatedSlugs: string[];
  allArticles: any[]; // Simplified for prototype
}

export default function KnowledgeGraph({ currentSlug, relatedSlugs, allArticles }: KnowledgeGraphProps) {
  // Construct a small graph of the current concept and its immediate neighbors
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeMap: Record<string, number> = {};

    // Add central node
    nodes.push({
      id: currentSlug,
      label: currentSlug.replace(/-/g, ' '),
      color: 'var(--color-gold)'
    });
    nodeMap[currentSlug] = 0;

    // Add related nodes
    relatedSlugs.forEach((slug, i) => {
      const article = allArticles.find(a => a.slug === slug);
      const color = article?.chakra ? `var(--color-${article.chakra})` : 'var(--color-glass-border)';

      nodes.push({
        id: slug,
        label: slug.replace(/-/g, ' '),
        color: color
      });
      nodeMap[slug] = nodes.length - 1;
      edges.push({ source: currentSlug, target: slug });
    });

    // Add second-degree connections for a "web" feel
    relatedSlugs.forEach(slug => {
      const article = allArticles.find(a => a.slug === slug);
      if (article?.related) {
        article.related.forEach((relSlug: string) => {
          if (relSlug !== currentSlug && !nodeMap[relSlug]) {
            nodes.push({
              id: relSlug,
              label: relSlug.replace(/-/g, ' '),
              color: 'var(--color-muted)'
            });
            nodeMap[relSlug] = nodes.length - 1;
            edges.push({ source: slug, target: relSlug });
          }
        });
      }
    });

    return { nodes, edges };
  }, [currentSlug, relatedSlugs, allArticles]);

  // Simple circular layout for the graph
  const getPosition = (index: number, total: number) => {
    const angle = (index / total) * Math.PI * 2;
    const radius = index === 0 ? 0 : 150;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <div className="relative w-full h-[400px] bg-obsidian/40 rounded-[var(--border-radius-lg)] border border-glass-border overflow-hidden flex items-center justify-center p-8">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'translate(50%, 50%)' }}>
        <defs>
          <filter id="graphGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <g filter="url(#graphGlow)">
          {edges.map((edge, i) => {
            const start = getPosition(nodes.findIndex(n => n.id === edge.source), nodes.length);
            const end = getPosition(nodes.findIndex(n => n.id === edge.target), nodes.length);
            return (
              <motion.line
                key={i}
                x1={start.x} y1={start.y}
                x2={end.x} y2={end.y}
                stroke="var(--color-gold)"
                strokeWidth="1"
                opacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: i * 0.1 }}
              />
            );
          })}
        </g>
      </svg>

      <div className="relative w-full h-full">
        {nodes.map((node, i) => {
          const pos = getPosition(i, nodes.length);
          return (
            <motion.div
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="absolute cursor-pointer group"
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(50% + ${pos.y}px)`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Link href={`/grimoire/${node.id}`}>
                <div
                  className="w-4 h-4 rounded-full border border-white/20 transition-all duration-300 group-hover:scale-150 group-hover:border-white shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                  style={{ backgroundColor: node.color }}
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-celestial text-muted opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                  {node.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
