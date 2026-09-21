# Earthly Greek sanctuary artwork

Generated using the built-in imagegen tool from the user's Greek homepage and chakra journal references. Text, links, icons, cards, and guidance remain HTML/SVG. Eleven original text-free artworks are stored locally as WebP at quality 88; no external image service is needed at runtime.

## Homepage assets and prompts

`public/images/earthly-sanctuary-v1.webp`

Create a production website BACKGROUND ART asset inspired closely by the supplied Greek sanctuary website reference. NOT a website mockup: absolutely no words, lettering, navigation, cards, panels, buttons, borders or logo. Wide landscape 1536x1024 or larger, beautiful highly detailed painterly cinematic realism. Match the reference's earthly antique Greek aesthetic: a monumental weathered marble Apollo bust with gold laurel crown occupies left quarter, partly covered with ivy; warm luminous honey sunset sky and empty misty valley in the CENTER provides calm bright negative space for dark website heading; on right third an ancient Greek hillside sanctuary with pale temples, dramatic waterfalls, cypress trees and deep forest greenery. Bottom a peaceful turquoise river through rocky valley, dark ivy and a few smoky quartz crystals in corners. Upper corners dark olive foliage and antique columns. Palette rich black forest green, aged brass gold, warm parchment, limestone, amber sunlight. Center must remain open, no statue or buildings in middle 35% to 65% of image. No light threads, no floating castles, no pink or purple fantasy glow. Reference image is style and composition guidance only. Produce only the text-free artwork and save the generated asset.

`public/images/earthly-homecoming-v1.webp`

Use case: stylized-concept. Asset: wide 1536x1024 landscape background for an earthly Greek spiritual sanctuary website. Painterly cinematic realism with intricate physical detail. Looking through an ivy-covered ancient Greek stone arch at a tranquil mountain lake and distant Greek temples at golden sunset. Foreground left: stacked aged leather books with NO legible lettering, brass candle holders, small olive branches. Foreground right: translucent smoky quartz clusters, ancient marble pedestal, abundant olive and dark forest green ivy. Center is open luminous lake, amber sunlight and serene distant mountains, with a low worn stone terrace at bottom. Ornate antique patina, rich shadows, restrained golden light, parchment sandstone, deep olive green. Beautiful grounded sacred atmosphere, physically realistic, no fantasy castles, no floating islands, no pink/lavender, no light threads. No people, no text, no lettering, no logos, no UI, no cards. Composition leaves central half open for real website copy to be overlaid later.

## Chakra assets and prompt set

The following exact prompt template was used once for each table entry, substituting its slug and theme:

Generate one polished website background artwork, landscape 1536x1024. Antique Greek spiritual botanical journal aesthetic on textured warm aged parchment, painterly engraved realism, inspired by an illuminated manuscript. Theme: {theme}. Ornate but organic ivy botanical borders and ruined columns along LEFT and RIGHT outer edges. A detailed scenic landscape occupies lower third. The CENTER and upper middle must be light blank parchment, very subtle worn grain, generous empty space for live website text. Rich dark vignette only at outer edges, antique brass accents. Parchment remains tan cream. Absolutely NO words, NO letters, NO handwriting, NO typography, NO chakra diagram, NO panels, NO UI. It is a background for the {slug} chakra webpage, not a poster. Grounded natural earth colors, restrained mystical atmosphere.

Every asset is `public/images/chakras/{slug}-v1.webp`.

| Slug | Theme |
| --- | --- |
| earth-star | deep earthy brown and sage green; ancient olive tree with deep exposed roots in stone, smoky quartz, a low Greek ruin; earth connection |
| root | dark terracotta and oxblood red leaves, garnet crystals, a magnificent rooted tree, weathered Greek columns |
| sacral | burnt orange flowers, carnelian crystals, sunlit Mediterranean sea, ancient temple arch, shell |
| solar-plexus | golden laurel leaves, citrine quartz, ancient Greek temple on a sunny hill, subtle antique lion sculpture |
| heart | deep green ivy and roses, green quartz, gentle Greek marble female statue facing a lush waterfall valley |
| throat | dusty blue flowers, aquamarine crystals, ancient Greek columns beside a moonlit sea and pale blue sky |
| third-eye | indigo foliage and amethyst, weathered Greek marble profile at left, crescent moon over mountain lake |
| crown | muted violet lavender and pale gold, amethyst crystals, Greek mountaintop sanctuary above mist under stars |
| soul-star | ivory flowers, clear quartz and antique gold, open luminous heavens, Greek columns rising above pale clouds |

## Implementation

The homepage uses `earthly-home.module.css`. Shared color tokens and existing page styles use parchment, forest, and antique gold. The shared environment selects the correct chakra artwork from the current pathname. The homepage retains all nine paths in a three-column desktop grid and a two-column mobile grid. Generated backgrounds are static; hover and focus treatments are CSS, respecting reduced motion. Existing chart calculations, assistant endpoints, account flows, and service destinations are unchanged.
