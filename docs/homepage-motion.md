# Homepage motion

## Current implementation: still artwork with live threads

The homepage uses clean 1536 x 1024 still backgrounds and transparent canvases for the threads. It no longer plays or downloads background videos. The scenery, including waterfalls, is still. Text remains HTML above the artwork and threads.

The September 19 thread revision uses native WebGL to draw separate, irregularly braided strands in gold, ice blue and lavender. Each route carries 42 strands with fine side fibers, tapered white centers, colored sheaths, soft halos and drifting gold flakes. Traveling highlights and varying strand widths break up the earlier evenly spaced wire appearance. The existing scene routes remain. Physical cross-section interpolation keeps the tapered strands smooth, and their endpoints fade out. Geometry and particle buffers are allocated once; the shaders animate their shape and lighting without full-resolution canvas blur on every frame. A Canvas 2D renderer is available when WebGL is unavailable.

`SceneBackdrop.tsx` owns pause/play, reduced-motion preferences, visibility and resize handling. Pausing freezes the exact current frame; resuming continues from it. Offscreen scenes and hidden tabs stop requesting frames. Reduced-motion visitors see stationary threads. Canvas resolution follows device pixel ratio up to 2, and its artwork coordinates follow the same cover crop as the photo.

`thread-renderer.ts` defines the shared scene paths and Canvas 2D fallback. `silk-renderer.ts` owns WebGL geometry, light textures and motion. Both use the same image coordinates and pause timeline. No external rendering library or new media download is needed.

Clean images were edited with the built-in imagegen tool, then saved as quality-95 WebP files (about 1.60 MB total):

- `public/images/sanctuary-dawn-clean-v1.webp`
- `public/images/sanctuary-portal-clean-v1.webp`
- `public/images/sanctuary-starlight-clean-v1.webp`

Prompt set: remove all gold, blue, lavender and white ribbon threads, swooshes and streak reflections from each corresponding original `sanctuary-*-v2.webp`; reconstruct the underlying scenery; preserve its exact composition, arch geometry, flowers, castles, waterfalls, colors and 3:2 framing. Dawn retains natural sunlight and the marble terrace; portal retains the crystal glow and galaxy; starlight retains stars, dusk horizon and pale water. No added objects, text or replacement threads. Produce a sharp clean background for separately composited animation.

Browser verification checks actual changing canvas pixels in all three scenes, exact frozen pixels on pause, resume, reduced-motion stillness, offscreen suspension, no video elements, retina mobile sizing and no horizontal overflow or browser exceptions.

## Previous video iterations (retained for reference)

Status: All three scenes generated through Higgsfield using Wan 3.0 on September 19, 2026, reviewed, and integrated as local assets in `public/videos/`. Each is a silent five-second H.264 loop (1174 × 782), encoded at CRF 23 with fast-start metadata. Current active clips total approximately 3.86 MB. Matching start/end artwork was supplied to keep loop transitions gentle.

Revision 2 replaces dawn and portal with stronger motion prompts after feedback that some strands and waterfalls looked static. Portal job: `f4ed4b87-f625-4e56-9b8c-202a95e83304`; dawn job: `b2f5f350-2deb-407a-ac2d-56668e59446a`. These explicitly target all foreground ribbons, distant waterfalls, and the waterfall beneath the portal steps. Foreground ribbon movement is more pronounced; fine waterfall motion remains subtler than the ribbons. Do not interpret the prompt as proof that every individual strand moves. Starlight retains its first export. Browser checks passed for all three clips: inline playback, looping, pause/resume, offscreen pausing, reduced-motion fallback, deferred loading, and mobile layout.

The homepage plays silent, inline, looping background clips through `SceneBackdrop`, with local video paths in `src/data/home-videos.ts`. The original artwork remains visible while media loads, when playback fails, and for reduced-motion preferences. Clips load on intersection and pause offscreen or when the tab is hidden. Each clip has a pause control. All headings, links, and body text remain live HTML above the video, with pale backlights or dark shading for contrast.

Generation IDs: dawn `96115ec6-b3db-4192-afd3-ddec315b8878`, portal `2d9dc6e9-7d65-4cd0-9017-f5d11fab8784`, starlight `67dbcaf3-f976-4ad6-8aa9-bd57fd2c04fd`. Generation settings: Wan 3.0, five seconds, 720p tier, original aspect ratio, no audio, identical reference images for start and end. Five seconds was selected to fit the available credit balance; the original longer-duration brief below is retained for future iterations.

## Generation brief

Generate each scene separately, preserving its supplied artwork and 3:2 aspect ratio. Aim for 8–10 seconds with a seamless loop, static camera, no soundtrack, no titles, and no interface. Export a web-compatible MP4, ideally H.264, and retain the original generated export for review. Review the loop seam and architecture before wiring an asset into the page.

### Dawn

Reference: `public/images/sanctuary-dawn-v2.webp`

Animate this exact fantasy sanctuary artwork as a restrained, seamless website background loop. Locked tripod camera. Preserve the composition, castle architecture, stone arch, flowers, floating islands, colors, and original light. The existing gold, ice-blue, and lavender threads flow smoothly along their current curved paths with delicate traveling highlights. Animate visible waterfalls downward continuously with fine mist at their bases; water must fall from the existing ledges, never rise. Add subtle rippling reflections on the foreground water. Keep the central sky calm and clear for website text that will be rendered separately. No camera motion, no zoom, no cuts, no added objects, no flicker, no morphing castles, no letters, no logo, no baked-in website text. Match the beginning and end for an unobtrusive loop.

### Portal

Reference: `public/images/sanctuary-portal-v2.webp`

Animate this exact crystal-portal sanctuary artwork as a restrained seamless loop. Locked camera; preserve the archway, crystal shape, steps, flowers, and landscape. Let existing luminous gold, blue, and lavender threads circulate gently around the arch and along the water. The waterfall below the steps flows continuously downward with fine mist and soft expanding ripples. The crystal breathes with a very subtle steady glow. Keep architecture perfectly still and preserve pale areas at the sides for separately rendered HTML text. No camera motion, no zoom, no new elements, no flicker, no text, no logo, no audio. Match beginning and end.

### Starlight

Reference: `public/images/sanctuary-starlight-v2.webp`

Animate this exact starlit sanctuary artwork as a restrained seamless loop. Locked camera. Keep all arches, flowers, distant buildings, and mountains fixed. The existing gold, blue, and lavender threads flow slowly across the horizon, with a few delicate traveling glints. Foreground water has subtle rippling reflections; any visible waterfalls flow downward. Stars stay stable with only faint occasional twinkling. Preserve the dark upper center and pale lower center for separately rendered HTML text. No camera motion, no zoom, no cuts, no new objects, no flashing, no text, no logo, no audio. Match beginning and end.
