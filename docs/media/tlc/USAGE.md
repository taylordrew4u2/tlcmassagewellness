# Use the TLC Massage Wellness media kit

Prepared for the public repository [taylordrew4u2/tlcmassagewellness](https://github.com/taylordrew4u2/tlcmassagewellness), reviewed at commit `ec8b6f349a42479765246369fae3d3919e71c287`. The complete kit is included in this repository under `docs/media/tlc/` and featured in the root README.

## Media layout and README

The root README already embeds all seven finished images, links both videos, and includes expandable marketing copy and portfolio text. Files keep the portable kit layout:

| Directory | Contents |
| --- | --- |
| `images/` | Seven final PNGs: three project graphics, two social graphics and two conceptual photographs. |
| `videos/` | Landscape and vertical 20-second MP4s plus verification notes. |
| `copy/` | Marketing copy, social captions and portfolio case study. |
| `screenshots/` | Original local interface captures. |
| `source/` | Editable artwork, rendering scripts, fonts, video cards and provenance. |

Root README paths start with `./docs/media/tlc/`; media-kit documents use paths relative to this directory. Preserve the folder structure when copying the kit elsewhere. `README-SECTION.md` contains the shorter reusable media section with repository-relative paths.

Video thumbnails link to the committed MP4s. On surfaces without an inline player, use the watch/download links. Open `index.html` locally after cloning or downloading the repository for an interactive gallery; GitHub displays the HTML source.

## Portfolio and marketing copy

- `copy/portfolio-case-study.md` contains the project overview, implemented experience, technical approach, boundaries and short portfolio-card copy.
- `copy/marketing-copy.md` contains headlines, social captions, calls to action, optional video copy and wording guidance.
- Use `portfolio-cover.png` as the portfolio card or case-study opening image. Follow it with `request-flow.png` to explain the working request flow.
- Use the landscape video in a case study or presentation. Use the vertical video for a mobile social story or reel. Both finished videos are silent; their on-screen text carries the message.
- Some copy in `copy/marketing-copy.md` offers alternative video concepts. The delivered MP4s use the five-card, 20-second sequence recorded in `source/video-timing.json`.

Add your personal role, dates and collaborator credits only when those facts are confirmed. The case study describes implemented features; it does not report measured traffic, conversion, revenue or customer outcomes.

## What the images show

`images/wellness-room.png` and `images/wellness-detail.png` are AI-generated conceptual brand photographs made with the built-in `image_gen` tool. They provide the kit's calm visual atmosphere. They are not photographs of actual TLC Massage Wellness premises, staff, treatments or products. Exact generation prompts are recorded in `source/IMAGE-PROMPTS.md`.

Interface images are real captures of the project running locally, using the repository's demo and seed content. They are presented in designed portfolio compositions. They demonstrate the interface at the reviewed source state, not a live production deployment. Any appointment request shown uses the fictional example **Jordan Lee**, **jordan@example.com**. No real client contact information was added to the kit.

Keep a short caption when publishing the combined compositions: **“Local demo with sample content. Conceptual wellness photography generated with AI.”** Do not describe the generated room as an actual practice photograph.

## Image alt text

Use the following descriptions where the asset communicates information. If an image is purely decorative beside equivalent text, use empty alt text (`alt=""`).

| Asset | Suggested alt text |
| --- | --- |
| `readme-banner.png` | TLC Massage Wellness project banner in forest green, antique gold and warm cream, introducing a calm website with practical owner controls. |
| `portfolio-cover.png` | TLC Massage Wellness portfolio composition featuring desktop and mobile captures of the local demo website. |
| `request-flow.png` | TLC Massage Wellness appointment request workflow, showing the visitor's request and the owner's review controls in a local demo. |
| `social-square.png` | TLC Massage Wellness square promotional graphic using forest green, antique gold and warm cream. |
| `social-portrait.png` | TLC Massage Wellness portrait promotional graphic with conceptual wellness imagery and a calm brand message. |
| `images/wellness-room.png` | Conceptual image of a massage treatment room with forest-green linens, cream walls and leafy sunlight. |
| `images/wellness-detail.png` | Conceptual wellness still-life with cream towels, forest-green linen, a ceramic dish and a botanical branch. |
| Landscape video thumbnail | Play the 20-second TLC Massage Wellness portfolio video. |

If a social platform supports alt text, include any important visible headline that is not already repeated in the post caption. Avoid implying that conceptual imagery is a photographed business location.

## Visual system and font sources

The kit uses forest green `#2f3b2a`, antique gold `#a89240` and warm cream `#f7f3e8`, with **Cormorant Garamond** for headings and **Jost** for supporting text. The fonts were obtained from Fontsource through jsDelivr and are distributed under the SIL Open Font License (OFL). Bundled WOFF2 files live in `source/fonts/`.

- [Cormorant Garamond on Fontsource](https://fontsource.org/fonts/cormorant-garamond) · [Fontsource package on jsDelivr](https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond/)
- [Jost on Fontsource](https://fontsource.org/fonts/jost) · [Fontsource package on jsDelivr](https://cdn.jsdelivr.net/npm/@fontsource/jost/)

The source graphics use the project's existing identity and butterfly motif. Photography and promotional layouts were created for this kit. Keep the included source and provenance notes when handing the assets to another designer or developer.

## Rebuild the videos

The rendered video cards and timing manifest are included. See `source/VIDEO-REBUILD.md` for the FFmpeg-based rebuild procedure and `source/video-timing.json` for frame, duration and encoding details.
