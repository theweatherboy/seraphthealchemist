# Sanctuary first pass

The shared AppShell keeps the sanctuary artwork, original particle field, and luminous SVG threads mounted across client-side page navigation. The deterministic curves avoid random server/client rendering differences. Thread motion respects reduced-motion settings. Home introduces seven linked realm cards, and the existing dragon logo is retained.

## Artwork

Created with the built-in image generation tool. Original: `public/images/sanctuary-v1.png`. Optimized website asset: `public/images/sanctuary-v1.webp`. Both remain in the project; CSS uses WebP. The cards currently reuse different crops of this image rather than seven separate illustrations.

Final generation prompt:

> Use case: stylized-concept. Asset type: wide cinematic website background artwork, landscape 1536x1024 or wider. Create a richly detailed painterly fantasy sanctuary bridging earth and heaven. Ancient dark woodland and warm amber foliage on the left, a stone bridge leading from lower center toward a luminous distant opening in clouds, ethereal gothic celestial towers and a graceful stone angel on the right against indigo violet stars. Tiny distant robed traveler on bridge. Rich atmospheric depth, fine organic textures, restrained gold highlights, deep midnight shadows, sophisticated luminous fantasy illustration. Leave upper middle relatively calm and dark enough for ivory website title overlay. Bottom fades into dark midnight. No text, letters, logo, panels, UI, borders or watermark. No baked-in colored light ribbons: animated threads will be layered in code. Inspired by the user's earth-to-celestial website reference.

## Payments

Product acquisition, service purchases, and support buttons open a shared native modal dialog. It supports Escape, focus containment, restored focus on close, and a scrollable layout. Cash App, PayPal, Venmo (HTTPS), and Stripe use the supplied destinations. The selected offering and price appear in the dialog.

These are external payment links, not an order management integration. They do not prefill the selected amount or product, verify payment, schedule sessions, or deliver digital files. Confirm the supplied Stripe link is appropriate for the offering before launch; its configured amount is not controlled by this site. A later phase can use product-specific Stripe links and verified webhook fulfillment.

## Contact activation

The form posts to `https://formsubmit.co/seraphthealchemist@gmail.com`. It sends name, email, intent and message, with a custom subject. FormSubmit's default CAPTCHA stays enabled. Visitors are taken through FormSubmit's confirmation flow, with a direct mailto fallback available on the contact page. No Gmail password or secret is placed in browser code.

1. Deploy the site and submit one real test inquiry through the contact page.
2. Open the activation email in `seraphthealchemist@gmail.com` and confirm the form; check spam if necessary.
3. Submit a second inquiry and verify it arrives, including the sender's reply address.

Delivery is not verified until those steps are complete. No live email or payment was submitted during development.

Provider documentation: https://formsubmit.co/

## Validation

Production build and lint for all changed TypeScript files passed. Hidden Chrome checks passed for desktop/mobile rendering, mobile overflow, Forge/service/support payment entry points, all four provider links, dialog initial focus and Escape dismissal, contact POST destination and named labels, with no runtime exceptions on tested pages. Full-repository lint still reports pre-existing errors in older canvas, MDX and design-reference files.

One separate existing issue remains: the Grimoire article route also reads asynchronous route parameters synchronously. This pass fixes that issue for service purchases only; Grimoire article routing needs a follow-up.

## Navigation

The main navigation now targets existing routes. Enter the Sanctuary scrolls to the realm cards. Automatic wheel-triggered route changes were disabled because they interrupted reading, forms and modal interactions; users retain normal scrolling and explicit navigation.
