# Illustrated parchment pages

## September 24 sanctuary continuation

The current interior treatment follows the homepage's marble, ivy, forest green, and candlelit gold. `pageArtworkSource` in `src/lib/page-artwork.ts` is the shared source of image URLs for AppShell and EnvironmentBackground. Services and Grimoire use the marble artwork directly under `/images/` (not `/images/pages/`). About and account use the homepage statue scene; contact, testimonies, support, and administration use the sunset sanctuary scene. Journal, birth chart, and offerings reuse the marble library illustration. Policies retain their scales illustration, and chakras retain their individual artwork and colors.

`src/components/layout/sanctuary-interiors.css` supplies scoped reading surfaces, scenic openings, account/support backgrounds, and the custom 404. Admin styling in `src/app/admin/admin.css` carries the same materials into its sidebar, page headers, cards, forms, calendar, and status labels. No authorization or data mutations were changed. The historical asset descriptions below document the earlier parchment set, which remains available.

Validation: TypeScript and targeted ESLint passed. Public routes were checked at 1440px and 390px with no horizontal overflow or runtime exceptions. Admin's presentation was checked with a browser-only sample-content fixture at 1440px, 390px, and 320px; authenticated admin workflows still require a signed-in admin session.

Eight original text-free images were generated with the built-in imagegen tool using the supplied `backgrounds_for_diff_pages.png` collage as the visual reference. Each is stored under `public/images/pages/{name}-v1.webp`, 1536 by 1024 pixels, WebP quality 88. Only the current route's image is requested. The generated PNG masters remain in the Codex generated-images directory.

| Image | Page |
| --- | --- |
| services | Services and service detail backdrop: olive tree, steps, temples |
| reviews | Testimonies: ivy-covered marble bust and butterflies |
| birth-chart | Birth chart and assistant: engraved sun wheel and armillary sphere |
| grimoire | Grimoire index: books, botanical manuscript, candles |
| journal | Grimoire articles: open journal, quill, Greek valley |
| about | About: olive tree, stone lion, river and columns |
| contact | Contact: sunset archway, letter, wax seal |
| policies | Privacy and terms: balance scales, moonlit temple |

`src/lib/page-artwork.ts` selects the asset. AppShell sets the CSS image variable, and EnvironmentBackground supplies matching edge artwork. The opening illustration fades into a parchment reading surface; `.folio-opening` reserves the scenic part of the image below each live heading. Mobile layouts use a centered crop. Legal printing hides the decorative image. All copy, forms, links, and chart calculations remain live HTML; the celestial wheel in the background is decorative, not a calculated chart.

The reference's Blog panel is used for existing Grimoire articles; this change does not create a separate blog.

Prompt direction: reproduce each corresponding reference panel as a single landscape background, using antique illustrated parchment, dark green ivy, weathered Greek architecture, old gold, and engraved painterly detail. Keep the top center light for HTML headings; concentrate the subject and scenic detail toward the lower half and sides. No headings, body text, interface controls, or collage dividers in the generated artwork.
