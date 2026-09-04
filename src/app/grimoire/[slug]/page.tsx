import { getGrimoirePostBySlug } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import type { Metadata } from "next";

async function getAllPaths() {
  const { getAllGrimoirePosts } = await import("@/lib/mdx");
  const posts = await getAllGrimoirePosts();
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateStaticParams() {
  const paths = await getAllPaths();
  return paths;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getGrimoirePostBySlug(params.slug);
  if (!post) return { title: "Thread Not Found" };

  return {
    title: `${post.title} | Seraph, The Alchemist`,
    description: `Explore the secrets of ${post.subject} in the Seraph, The Alchemist grimoire.`,
    openGraph: {
      title: post.title,
      description: `Deep dive into ${post.subject}.`,
    }
  };
}

export default async function GrimoirePostPage({ params }: { params: { slug: string } }) {
  const post = await getGrimoirePostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 md:px-12 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col gap-8"
      >
        <header className="border-b border-seraphic-gold/30 pb-6">
          <div className="text-seraphic-gold font-arcane text-sm uppercase tracking-widest mb-2">
            {post.subject}
          </div>
          <h1 className="font-arcane text-4xl md:text-6xl text-seraphic-gold mb-4">
            {post.title}
          </h1>
          <div className="flex gap-4 text-xs text-moon-ivory/50 font-celestial uppercase">
            <span>Coordinate: {post.coordinate.x}, {post.coordinate.y}, {post.coordinate.z}</span>
          </div>
        </header>

        <article className="prose prose-invert max-w-none">
          <div className="font-celestial text-lg leading-relaxed text-moon-ivory/90">
            {post.content}
          </div>
        </article>

        <footer className="mt-12 pt-8 border-t border-seraphic-gold/20">
          <h3 className="font-arcane text-xl text-seraphic-gold mb-4">Connected Threads</h3>
          <div className="flex flex-wrap gap-3">
            {post.links.map(link => (
              <a
                key={link}
                href={`/grimoire/${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 bg-void-purple border border-seraphic-gold/30 text-moon-ivory hover:text-seraphic-gold hover:border-seraphic-gold transition-all rounded-full text-sm font-celestial"
              >
                ✦ {link}
              </a>
            ))}
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
