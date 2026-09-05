"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const ArcaneHeading = ({ children, level }: { children: React.ReactNode; level: number }) => {
  const sizes = {
    1: 'text-4xl md:text-6xl',
    2: 'text-3xl md:text-5xl',
    3: 'text-2xl md:text-4xl',
    4: 'text-xl md:text-3xl',
  };

  const Tag = `h${level}` as any;

  return (
    <Tag className={`${sizes[level as keyof typeof sizes]} font-arcane text-gold mb-6 tracking-wider drop-shadow-sm`}>
      {children}
    </Tag>
  );
};

export const CelestialParagraph = ({ children }: { children: React.ReactNode }) => (
  <p className="font-celestial text-moon-ivory/80 leading-relaxed mb-6 text-lg">
    {children}
  </p>
);

export const SacredQuote = ({ children }: { children: React.ReactNode }) => (
  <motion.blockquote
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    className="border-l-4 border-gold pl-6 py-2 my-8 italic font-celestial text-xl text-gold/90 bg-gold/5 rounded-r-xl"
  >
    {children}
  </motion.blockquote>
);

export const AlchemicalList = ({ children }: { children: React.ReactNode }) => (
  <ul className="space-y-3 mb-8 list-none">
    {React.Children.map(children, child => (
      <li className="flex items-start gap-3 font-celestial text-moon-ivory/80">
        <span className="text-gold">✧</span>
        {child}
      </li>
    ))}
  </ul>
);

export const ArcaneCallout = ({ children }: { children: React.ReactNode }) => (
  <div className="my-12 p-8 rounded-[var(--border-radius-lg)] bg-glass border border-gold/30 backdrop-blur-md shadow-inner">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
      <span className="font-arcane text-xs uppercase tracking-widest text-gold">Divine Insight</span>
    </div>
    <div className="font-celestial text-moon-ivory/90 leading-relaxed">
      {children}
    </div>
  </div>
);

export const mdxComponents = {
  h1: (props: any) => <ArcaneHeading level={1} {...props} />,
  h2: (props: any) => <ArcaneHeading level={2} {...props} />,
  h3: (props: any) => <ArcaneHeading level={3} {...props} />,
  h4: (props: any) => <ArcaneHeading level={4} {...props} />,
  p: (props: any) => <CelestialParagraph {...props} />,
  blockquote: (props: any) => <SacredQuote {...props} />,
  ul: (props: any) => <AlchemicalList {...props} />,
};
