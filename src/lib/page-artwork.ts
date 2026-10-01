/** Text-free folio illustrations, selected by route without loading other assets. */
export function pageArtwork(pathname: string): string | undefined {
  if (pathname === '/services' || pathname.startsWith('/services/')) return 'services';
  if (pathname === '/reviews') return 'reviews';
  if (pathname === '/birth-chart') return 'birth-chart';
  if (pathname === '/grimoire') return 'grimoire';
  if (pathname.startsWith('/grimoire/')) return 'journal';
  if (pathname === '/about') return 'about';
  if (pathname === '/contact') return 'contact';
  if (pathname === '/login' || pathname === '/account') return 'account';
  if (pathname === '/support') return 'support';
  if (pathname === '/forge') return 'forge';
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return 'admin';
  if (['/legal', '/privacy-policy', '/terms-of-service'].includes(pathname)) return 'policies';
}

/** Shared by the page opening and environment so artwork paths cannot drift. */
export function pageArtworkSource(artwork: string | undefined): string {
  switch (artwork) {
    case 'services': return '/images/page-services-marble-v1.webp';
    case 'grimoire':
    case 'journal':
    case 'birth-chart':
    case 'forge': return '/images/page-grimoire-marble-v1.webp';
    case 'about':
    case 'account': return '/images/sanctuary-hero-v3.webp';
    case 'contact':
    case 'reviews':
    case 'support':
    case 'admin': return '/images/sanctuary-vision-v3.webp';
    case 'policies': return '/images/pages/policies-v1.webp';
    default: return '/images/sanctuary-vision-v3.webp';
  }
}
