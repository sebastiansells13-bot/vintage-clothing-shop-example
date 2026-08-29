# vintage-clothing-shop-example

A live, deployed example ecommerce site for a fictional shop — **Marigold & Moth
Vintage** — built from [client-site-starter](https://github.com/sebastiansells13-bot/client-site-starter),
sharing its cart/shipping-calculator infrastructure with
[comics-toys-shop-example](https://github.com/sebastiansells13-bot/comics-toys-shop-example)
but demonstrating a different content type (sized clothing) and a new feature:
cross-platform links (Instagram, eBay, Depop, Etsy).

**Live site:** https://sebastiansells13-bot.github.io/vintage-clothing-shop-example/

## What's real here, and what's a labeled demo

- **The product catalog, cart, and shipping calculator are fully functional** — same
  proven infrastructure as comics-toys-shop-example (`src/_includes/js/cart.js`),
  extended to show garment size in the cart. No external API, no backend.
- **Checkout is a labeled demo, not a real payment flow**, for the same reason as
  every other ecommerce example here: no Stripe/Square integration, no payment
  credentials. "Place Order" simulates a confirmation and clears the cart.
- **The cross-platform links (Instagram, eBay, Depop, Etsy) are placeholder URLs**
  following each platform's real URL pattern (e.g. `ebay.com/usr/<handle>`) for a
  fictional handle (`marigoldandmoth`) that likely doesn't correspond to a real
  account. They're realistic-looking so you can see how the feature reads, not
  functioning links to a real shop. Point `business.platforms` in
  `src/_data/business.json` at the client's real accounts for an actual engagement.
- **The shop name and products are fictional** but not placeholder-bracketed —
  there's no real trademarked brand or real person's identity involved, so real-
  looking (but invented) content was fine to use throughout, the same way the
  coffee-shop and comics-shop examples did.

## What's different from the template

- New `products` content type (`src/_data/products.json`) — category, size,
  condition, price, weight (used by the shipping calculator), stock status,
  featured flag
- New pages: `/shop/` (catalog), `/cart/`, `/checkout/`
- `business.platforms` — cross-platform links rendered in the footer (every page)
  and as a dedicated homepage section
- "Services"/"Team" removed — not relevant to this business type
- `pathPrefix` and sitemap/feed hostnames point at
  `sebastiansells13-bot.github.io/vintage-clothing-shop-example` — needed only
  because this demo lives at a GitHub Pages *project* URL rather than a custom
  domain

See [CREDITS.md](CREDITS.md) for photo sourcing, including a real identifiable
model photo and a museum-catalogued military garment that were both rejected during
sourcing, and why.

## Local development

```bash
npm install
npm start
```
