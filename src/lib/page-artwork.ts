/** Text-free folio illustrations, selected by route without loading other assets. */
export function pageArtwork(pathname: string): string | undefined {
  if (pathname === '/services' || pathname.startsWith('/services/')) return 'services';
  if (pathname === '/reviews') return 'reviews';
  if (pathname === '/birth-chart') return 'birth-chart';
  if (pathname === '/grimoire') return 'grimoire';
  if (pathname.startsWith('/grimoire/')) return 'journal';
  if (pathname === '/about') return 'about';
  if (pathname === '/contact') return 'contact';
  if (['/legal', '/privacy-policy', '/terms-of-service'].includes(pathname)) return 'policies';
}
