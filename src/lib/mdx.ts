import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_PATH = path.join(process.cwd(), 'src/content/grimoire');

export interface GrimoirePost {
  slug: string;
  title: string;
  subject: string;
  coordinate: { x: number; y: number; z: number };
  links: string[];
  content: string;
}

export async function getAllGrimoirePosts(): Promise<GrimoirePost[]> {
  const files = fs.readdirSync(CONTENT_PATH);

  return files
    .filter(file => file.endsWith('.mdx'))
    .map(file => {
      const filePath = path.join(CONTENT_PATH, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);

      return {
        slug: file.replace('.mdx', ''),
        title: data.title || 'Untitled',
        subject: data.subject || 'General',
        coordinate: data.coordinate || { x: 0, y: 0, z: 0 },
        links: data.links || [],
        content,
      } as GrimoirePost;
    });
}

export async function getGrimoirePostBySlug(slug: string): Promise<GrimoirePost | null> {
  try {
    const filePath = path.join(CONTENT_PATH, `${slug}.mdx`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title || 'Untitled',
      subject: data.subject || 'General',
      coordinate: data.coordinate || { x: 0, y: 0, z: 0 },
      links: data.links || [],
      content,
    } as GrimoirePost;
  } catch (e) {
    return null;
  }
}
