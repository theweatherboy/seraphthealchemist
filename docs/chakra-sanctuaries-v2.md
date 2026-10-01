# Chakra sanctuaries and flowing cloth — September 24, 2026

Nine project assets are saved at `public/images/chakras/{slug}-v2.webp`: earth-star, root, sacral, solar-plexus, heart, throat, third-eye, crown, and soul-star. Original v1 files remain intact. Generated with the built-in imagegen tool, then encoded as WebP quality 88. Each image is 1536 × 1024. The reference was `background_for_pages_new09222026.png`; its seven chakra panels informed the main seven scenes. Earth Star and Soul Star extend the same architecture with bronze/root and pearl/crystal palettes respectively.

## Prompt set

Shared direction: Create one finished 1536x1024 landscape website background expanding the respective chakra panel. Follow the reference's chakra row faithfully. Single cinematic photoreal fantasy ancient cream marble arched sanctuary, realistic foliage at edges, candles and shallow reflecting water floor, luminous sacred geometry centered at 52% height on rear marble wall. Arch fills composition. Luxurious dimensional stone, deep rich shadows and colored illumination, not parchment or flat illustration. Top center 20% remains dark and quiet for live HTML heading. No words, text, lettering, UI or collage. Unique full scene matching this chakra's respective reference panel.

- Root: burgundy silk, dark red ivy and roots, garnet crystals, red amber mandala.
- Sacral: orange silk, amber light, marigolds, copper vessels, orange mandala.
- Solar Plexus: golden yellow silk, citrine, yellow fruit, sunlight, golden mandala.
- Heart: green ivy, white lilies, jade silk, soft green mandala.
- Throat: pale blue silk, white flowers, aquamarine, blue mandala.
- Third Eye: indigo silk, purple blossoms, candles, indigo blue mandala.
- Crown: lavender silk, hanging wisteria, lotus bowl, intricate violet mandala.
- Earth Star: bronze silk, roots, smoky quartz, moss, warm bronze mandala.
- Soul Star: ivory silk, white blossoms, clear quartz, pearl white and pale gold mandala.

The page header keeps the center of each scene clear. Descriptions, chakra navigation, and educational content sit on marble surfaces below it. The nine-path links target the on-page chakra navigation.

## Motion

`ribbon-renderer.ts` renders translucent continuous cloth strips with signed cross-sections: folds rotate through an edge-on position and open again. Traveling deformation, iridescent highlights, and gold edge reflections animate independently. The homepage scene routes curve around the statue and water, with narrow wisps away from the main cloth. Animation remains pointer responsive, pauses when offscreen or in a hidden tab, and honors both the pause button and reduced-motion preference.

Browser checks: all nine desktop chakra routes, root/crown mobile layouts, homepage mobile overflow, two distinct animation frames, stable paused canvas, and reduced-motion stop. No runtime exceptions observed. Screenshots and the verification script are in the ignored `for AI design dev work/redesign/` working directory.
