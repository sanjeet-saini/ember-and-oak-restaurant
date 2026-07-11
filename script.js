// The first 20 source frames were intentionally removed. The animation now
// treats frame_020 as its first frame instead of requesting missing images.
const START_FRAME = 20;
const END_FRAME = 200;
const FRAME_COUNT = END_FRAME - START_FRAME + 1;
const canvas = document.querySelector('#food-canvas');
const context = canvas.getContext('2d');
const scrolly = document.querySelector('.scrolly');
const loader = document.querySelector('#loader');
const loaderBar = document.querySelector('#loader-bar');
const loaderText = document.querySelector('#loader-text');
const overlays = [...document.querySelectorAll('.overlay')];
const frames = [];
let loadedFrames = 0;
let activeFrame = 0;
let ticking = false;

function frameSource(index) {
  const sourceNumber = START_FRAME + index;
  return `sequence/frame_${String(sourceNumber).padStart(3, '0')}_delay-0.05s.png`;
}

function sizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawFrame(index) {
  const image = frames[index];
  if (!image || !image.complete || !image.naturalWidth) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const renderWidth = image.naturalWidth * scale;
  const renderHeight = image.naturalHeight * scale;
  context.clearRect(0, 0, width, height);
  context.drawImage(image, (width - renderWidth) / 2, (height - renderHeight) / 2, renderWidth, renderHeight);
}

function opacityAt(progress, start, peakIn, peakOut, end) {
  if (progress < start || progress > end) return 0;
  if (progress <= peakIn) return (progress - start) / Math.max(peakIn - start, .001);
  if (progress <= peakOut) return 1;
  return 1 - (progress - peakOut) / Math.max(end - peakOut, .001);
}

function updateScene() {
  const scrollRange = scrolly.offsetHeight - window.innerHeight;
  const progress = Math.max(0, Math.min(1, -scrolly.getBoundingClientRect().top / scrollRange));
  const nextFrame = Math.min(FRAME_COUNT - 1, Math.round(progress * (FRAME_COUNT - 1)));
  if (nextFrame !== activeFrame) {
    activeFrame = nextFrame;
    drawFrame(activeFrame);
  }
  overlays.forEach((overlay) => {
    const start = Number(overlay.dataset.start);
    const peakIn = Number(overlay.dataset.peakIn);
    const peakOut = Number(overlay.dataset.peakOut);
    const end = Number(overlay.dataset.end);
    overlay.style.opacity = opacityAt(progress, start, peakIn, peakOut, end);
    const localProgress = Math.max(0, Math.min(1, (progress - start) / Math.max(end - start, .001)));
    overlay.style.transform = `translate3d(0, ${55 - localProgress * 120}px, 0)`;
  });
  ticking = false;
}

function requestSceneUpdate() {
  if (!ticking) {
    requestAnimationFrame(updateScene);
    ticking = true;
  }
}

function preloadFrames() {
  for (let index = 0; index < FRAME_COUNT; index += 1) {
    const image = new Image();
    image.decoding = 'async';
    const complete = () => {
      loadedFrames += 1;
      const percentage = Math.round((loadedFrames / FRAME_COUNT) * 100);
      loaderBar.style.width = `${percentage}%`;
      loaderText.textContent = `${percentage}%`;
      if (index === 0) drawFrame(0);
      if (loadedFrames === FRAME_COUNT) {
        loader.classList.add('done');
        updateScene();
      }
    };
    image.addEventListener('load', complete, { once: true });
    image.addEventListener('error', complete, { once: true });
    image.src = frameSource(index);
    frames.push(image);
  }
}

sizeCanvas();
preloadFrames();
updateScene();
window.addEventListener('scroll', requestSceneUpdate, { passive: true });
window.addEventListener('resize', () => { sizeCanvas(); drawFrame(activeFrame); updateScene(); });

/* --------------------------------------------------------------------------
   FULL MENU
   Replace this placeholder array with real dishes. Keep the same category keys
   used by the buttons in index.html: starters, mains, burgers, desserts, drinks.
---------------------------------------------------------------------------- */
const menuItems = [
  { category: 'starters', name: 'Fire-Roasted Peppers', description: 'Whipped feta, toasted seeds and ember oil.', price: '$12' },
  { category: 'starters', name: 'Charred Corn Ribs', description: 'Smoked lime butter, pecorino and chilli dust.', price: '$11' },
  { category: 'starters', name: 'Crispy Halloumi', description: 'Hot honey, lemon and crushed pistachio.', price: '$14' },
  { category: 'mains', name: 'Oak-Grilled Chicken', description: 'Herb jus, roast garlic mash and bitter leaves.', price: '$26' },
  { category: 'mains', name: 'Ember Sea Bass', description: 'Brown butter, capers and market vegetables.', price: '$31' },
  { category: 'mains', name: 'Wild Mushroom Steak', description: 'Coal-roasted mushrooms, pepper sauce and fries.', price: '$23' },
  { category: 'burgers', name: 'The Ember Stack', description: 'Double beef, smoked cheddar and ember sauce.', price: '$24' },
  { category: 'burgers', name: 'Oakhouse Classic', description: 'Dry-aged beef, heritage tomato and house pickles.', price: '$19' },
  { category: 'burgers', name: 'Golden Hour', description: 'Mature cheddar, caramelised onion and mustard aioli.', price: '$21' },
  { category: 'desserts', name: 'Burnt Honey Tart', description: 'Crème fraîche, sea salt and honeycomb.', price: '$10' },
  { category: 'desserts', name: 'Dark Chocolate Ember', description: 'Warm chocolate, malt ice cream and cocoa nib.', price: '$12' },
  { category: 'desserts', name: 'Fire-Roasted Peach', description: 'Vanilla mascarpone and almond brittle.', price: '$11' },
  { category: 'drinks', name: 'Smoked Old Fashioned', description: 'Bourbon, maple, bitters and oak smoke.', price: '$15' },
  { category: 'drinks', name: 'Golden Spritz', description: 'Apricot, sparkling wine and fresh citrus.', price: '$13' },
  { category: 'drinks', name: 'House Ember Soda', description: 'Blood orange, ginger and charred rosemary.', price: '$7' }
];

const menuList = document.querySelector('#menu-list');
const menuTabs = [...document.querySelectorAll('.menu-tab')];
let menuSwitchTimer;

function renderMenu(category) {
  menuList.replaceChildren();
  menuItems.filter((item) => item.category === category).forEach((item) => {
    const article = document.createElement('article');
    article.className = 'menu-item';
    const title = document.createElement('h3');
    const description = document.createElement('p');
    const price = document.createElement('strong');
    title.textContent = item.name;
    description.textContent = item.description;
    price.textContent = item.price;
    article.append(title, description, price);
    menuList.append(article);
  });
}

menuTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    if (tab.classList.contains('active')) return;
    menuTabs.forEach((button) => {
      const selected = button === tab;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
    });
    menuList.classList.add('switching');
    clearTimeout(menuSwitchTimer);
    menuSwitchTimer = setTimeout(() => {
      renderMenu(tab.dataset.category);
      requestAnimationFrame(() => menuList.classList.remove('switching'));
    }, 180);
  });
});

renderMenu('starters');

/* --------------------------------------------------------------------------
   REVIEWS CAROUSEL
   It advances every 4.5 seconds, loops, pauses on hover and adapts its page
   count to show 3 cards on desktop, 2 on tablet and 1 on mobile.
---------------------------------------------------------------------------- */
const reviewCarousel = document.querySelector('#review-carousel');
const reviewTrack = reviewCarousel.querySelector('.review-track');
const reviewCards = [...reviewTrack.querySelectorAll('.review-card')];
const reviewDots = document.querySelector('#review-dots');
const reviewPrev = document.querySelector('#review-prev');
const reviewNext = document.querySelector('#review-next');
let reviewIndex = 0;
let reviewTimer;

function reviewsPerView() {
  if (window.innerWidth > 900) return 3;
  if (window.innerWidth > 700) return 2;
  return 1;
}

function reviewPageCount() {
  return Math.max(1, reviewCards.length - reviewsPerView() + 1);
}

function buildReviewDots() {
  reviewDots.replaceChildren();
  for (let index = 0; index < reviewPageCount(); index += 1) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `carousel-dot${index === reviewIndex ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Show review page ${index + 1}`);
    dot.addEventListener('click', () => { reviewIndex = index; updateReviews(); restartReviews(); });
    reviewDots.append(dot);
  }
}

function updateReviews() {
  reviewIndex = (reviewIndex + reviewPageCount()) % reviewPageCount();
  reviewTrack.style.transform = `translateX(-${reviewCards[reviewIndex].offsetLeft}px)`;
  [...reviewDots.children].forEach((dot, index) => dot.classList.toggle('active', index === reviewIndex));
}

function startReviews() {
  clearInterval(reviewTimer);
  reviewTimer = setInterval(() => { reviewIndex += 1; updateReviews(); }, 4500);
}

function restartReviews() { startReviews(); }
reviewPrev.addEventListener('click', () => { reviewIndex -= 1; updateReviews(); restartReviews(); });
reviewNext.addEventListener('click', () => { reviewIndex += 1; updateReviews(); restartReviews(); });
reviewCarousel.addEventListener('mouseenter', () => clearInterval(reviewTimer));
reviewCarousel.addEventListener('mouseleave', startReviews);
window.addEventListener('resize', () => {
  reviewIndex = Math.min(reviewIndex, reviewPageCount() - 1);
  buildReviewDots();
  updateReviews();
});
buildReviewDots();
updateReviews();
startReviews();

/* Lightweight fade-up reveal for each newly added section. */
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal-section').forEach((section) => revealObserver.observe(section));
