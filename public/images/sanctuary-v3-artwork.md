# Sanctuary homepage artwork

## Proportion correction: individual portals (v4)

The homepage now uses five separate portrait images instead of stretching the v3 mural. Each is rendered at its native 2:3 ratio and masked along all four edges in CSS. Generated with the built-in imagegen tool using `new_design_7.png`; optimized to 680 × 1020 WebP, quality 88.

Saved paths: `public/images/portal-divination-v4.webp`, `public/images/portal-healing-v4.webp`, `public/images/portal-journeys-v4.webp`, `public/images/portal-teachings-v4.webp`, `public/images/portal-loom-v4.webp`.

Shared prompt: Make one individual portrait website portal illustration, 1024 × 1536, following the reference's offerings art direction. Only one complete elegant semicircular Roman stone arch, centered and upright, gracefully proportioned, occupying 90% of width and 85% of height with slender vertical columns. Realistic undistorted statue and architectural proportions, straight-on view. Ivy and white jasmine climb the frame, with natural leaves trailing outward. Frame surrounded by warm ivory parchment #e8d2b0 blending softly toward all four edges, no straight borders. Full arch cap visible with breathing room above; bottom scene fades into blank parchment. Rich photographic painterly style, deep olive shadows, golden light, warm marble. No words, labels, symbols underneath, logos, buttons, UI, threads, or ribbons. Single artwork asset, not a website mockup, no side-by-side arches.

Subject per prompt:
- Divination: candlelit altar with clear quartz, antique brass crescent, rich olive shadow and fine gold details.
- Healing: lush classical waterfall sanctuary with distant Greek temple, small marble statues, white jasmine and reflective water.
- Journeys: celestial staircase over water toward an ancient temple beneath a twilight sky with four luminous crescent moons.
- Teachings: candlelit antique library with books, manuscripts, brass armillary, olive velvet seat and warm gold illumination.
- Loom: contemplative seated young male Greek marble statue in an artist's studio, ivy, white flowers, candles, sunset waterfall temple landscape.

Ribbons are a separate interactive canvas layer, with folded translucent surfaces and gold edges; no animation is baked into these images.

## Marble interior surfaces

`seraph-marble-surface.webp` is the generated pale sculptural marble texture used behind the homepage portals and as the shared surface for non-chakra folio pages. `page-services-marble-v1.webp` and `page-grimoire-marble-v1.webp` are the generated topic scenes currently wired to those routes. The remaining non-chakra routes retain their existing topic-specific folio art over the same marble treatment.

Created with the built-in imagegen tool, using the supplied `new_design_7.png` as the visual reference. Generated PNGs were converted to WebP at quality 88. All three images are 1536 × 1024. Text, links, and animated threads are rendered separately by the application.

## Saved assets

- `public/images/sanctuary-hero-v3.webp` — seated statue and waterfall sanctuary.
- `public/images/sanctuary-portals-v3.webp` — continuous five-arch mural, positioned separately in each responsive portal.
- `public/images/sanctuary-vision-v3.webp` — sunset waterfall terrace.

## Prompt specifications

Hero: Generate a wide landscape website hero inspired by the top scene of the reference. Seated pensive classical Greek male marble statue on the right, golden laurel, ivy and white flowers, ancient columns, distant waterfalls and Greek temples in warm sunset at center. Left 40% very dark forest foliage and shadowed columns with negative space for HTML text. Reflective water terrace along the bottom, candles, books, crystals and brass armillary near the statue. Rich photographic painterly detail, ivory marble, deep black olive foliage, antique gold. No text, logos, UI, borders, buttons, silk ribbons or threads. Full bleed scene.

Portals: Generate one cohesive wide architectural mural inspired by the middle five portals of the reference. Five evenly spaced tall rounded Roman archways, all visible, on lightly weathered warm ivory parchment and stone. Delicate ivy and white jasmine on frames. Left to right: candlelit divination altar with quartz and brass crescent; lush waterfall sanctuary; midnight blue celestial staircase with crescent moons; warm book-lined candlelit study; contemplative marble Greek young man in serene artist studio. Floors fade into parchment below. Dark olive foliage, warm gold sunset, ivory marble. No text, labels, UI, symbols underneath, ribbons or glowing threads.

Vision: Generate a wide cinematic landscape inspired by the reference's bottom scene. Classical ruined columns with ivy and white jasmine framing a reflective shallow water terrace, cascading waterfalls and ancient Greek hilltop temple in distance, warm peach sunset, candles and brass bowl at lower right. Contemplative dark olive foliage on the left 40% for HTML text. Full bleed photographic painterly art, antique gold and olive-black palette. No text, UI, logo, borders, statue, silk ribbons or threads.
