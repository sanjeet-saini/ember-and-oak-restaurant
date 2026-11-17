# Ember & Oak – Restaurant Landing Page

A restaurant landing page where a burger builds itself as you scroll, followed by signature dishes, a tabbed menu and guest reviews.

**Live demo:** https://sanjeet-saini.github.io/ember-and-oak-restaurant/

> 🤖 **AI-assisted project.** I created the burger video, converted it into image frames and planned the page. The scroll animation and page code were built with AI tools from my prompts.

## Features

- **Scroll-driven animation** – 181 image frames drawn on a `<canvas>` as you scroll, so the burger assembles itself
- **Loading screen** with a live percentage while the frames load
- **Text overlays** that fade in and out at different points of the scroll
- **Signature dishes** section and an **Instagram-style** gallery
- **Menu with 5 category tabs** (starters, mains, burgers, desserts, drinks) rendered from JavaScript data
- **Reviews carousel** with auto-play, arrows and dots
- **Scroll reveal** effects with `IntersectionObserver`

## How the animation works

1. A short burger video was exported as individual frames (`sequence/frame_XXX.webp`).
2. All frames are preloaded, and the loader shows the progress.
3. On scroll, the page works out how far through the section you are and draws the matching frame on the canvas with `drawImage()`, using `requestAnimationFrame` to stay smooth.

Frames are stored as WebP (about 7 MB in total instead of over 200 MB as PNG) so the page loads quickly on mobile.

## Tech stack

- JavaScript (ES6+), HTML5 Canvas API, `IntersectionObserver`
- HTML5 and CSS3
- AI tools for code generation

## Run locally

```bash
git clone https://github.com/sanjeet-saini/ember-and-oak-restaurant.git
cd ember-and-oak-restaurant
npx http-server .
```

## Author

**Sanjeet Saini** · [GitHub](https://github.com/sanjeet-saini) · [LinkedIn](https://www.linkedin.com/in/sanjeet-saini-880b1827a)
