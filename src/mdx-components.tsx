import type { ComponentType, ComponentProps } from 'react';

type MDXComponents = {
  [K in keyof any]: ComponentType<ComponentProps<any>>;
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }: { children: React.ReactNode }) => <h1 className="font-arcane text-4xl text-seraphic-gold mb-4">{children}</h1>,
    h2: ({ children }: { children: React.ReactNode }) => <h2 className="font-arcane text-2xl text-seraphic-gold mb-3">{children}</h2>,
    h3: ({ children }: { children: React.ReactNode }) => <h3 className="font-arcane text-xl text-seraphic-gold mb-2">{children}</h3>,
    p: ({ children }: { children: React.ReactNode }) => <p className="font-celestial text-moon-ivory mb-4 leading-relaxed">{children}</p>,
    ul: ({ children }: { children: React.ReactNode }) => <ul className="list-disc list-inside font-celestial text-moon-ivory mb-4 space-y-2">{children}</ul>,
    ol: ({ children }: { children: React.ReactNode }) => <ol className="list-decimal list-inside font-celestial text-moon-ivory mb-4 space-y-2">{children}</ol>,
    li: ({ children }: { children: React.ReactNode }) => <li className="font-celestial text-moon-ivory">{children}</li>,
    a: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => <a className="text-seraphic-gold hover:text-ether-teal underline transition-colors" {...props}>{children}</a>,
    ...components,
  }
}
