# Rebuild the artwork

The finished images are in `../images/`. The HTML source keeps text, colors and layouts editable. Native brand photographs remain separate originals.

From this directory:

```sh
npm install playwright
npx playwright install chromium
node render-artwork.cjs
```

Rebuild one static image by passing its name, for example `node render-artwork.cjs request-flow`. Use `node render-artwork.cjs video` to rebuild all ten video cards. Rebuilding replaces the corresponding exports.

If you already have a compatible Chromium installation, set `CHROME_PATH` to its executable. The scripts use the included local fonts and images and require no image-generation API credentials.

Edit `designs.html` to change text or composition. Query parameters select the artwork: `?type=portfolio-cover`, `?type=readme-banner`, `?type=request-flow`, `?type=social-square`, `?type=social-portrait`, or `?type=video&format=portrait&slide=3`. Open the HTML in a browser to preview it.

For the generated photographs, see `IMAGE-PROMPTS.md`. The original project logo motif was adapted from its SVG source. The kit uses the original three butterflies and project's palette and fonts.

## Production notes

- Artwork is rendered at exact export dimensions with browser typesetting.
- Screenshots were captured from a local copy of repository commit `ec8b6f349a42479765246369fae3d3919e71c287`.
- The capture used the original page content and UI. A fictional local appointment request supplied the booking example; no live customer data was used.
- Local-only Next.js configuration set `turbopack.root` to the clone directory and disabled the development indicator. No product source changes were published.
- Native images were generated with the built-in image generation tool. Text and the SVG butterfly motif were typeset in HTML for accurate exports.
- Fonts: Cormorant Garamond Regular and Jost Regular, distributed through Fontsource/jsDelivr. Their OFL notices are in `fonts/`.
- Videos are intentionally silent. Their scene text conveys the story without sound.
