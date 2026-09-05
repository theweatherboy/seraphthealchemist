export interface GrimoireArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  related?: string[];
  chakra?: string;
}
