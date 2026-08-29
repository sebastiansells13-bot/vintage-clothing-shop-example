# Editing your website's content

You can update your site's content without touching any code.

## 1. Log in

1. Go to `https://app.pagescms.org/edit/<your-github-org>/<your-repo-name>`
   (your web developer will give you the exact link)
2. Sign in with the GitHub account your developer set up for you

## 2. What you can edit

- **Blog Posts** — add, edit, or remove posts. Each post has a title, short
  description, date, tags, an optional cover image, and the body text.
- **Products** — everything shown on the Shop and Home pages: title, category,
  size, condition, price, weight, photo, description, and stock status.
  **Weight matters** — it feeds the shipping calculator on the cart page, so
  keep it realistic.
- **Shop Info** — the shop name, tagline, contact details, the two settings
  that drive the shipping calculator (your origin zip and free-shipping
  threshold), and your **Other Platforms** links (Instagram, eBay, Depop,
  Etsy) shown in the footer and on the homepage. Leave any of those blank to
  hide that link.

## A note on "Add to Cart" and checkout

The cart and shipping calculator on the live site are fully working — but the
final "Place Order" button is a **labeled demo**, not a real payment processor.
Editing content here doesn't change that; connecting a real payment processor
(Stripe, Square, etc.) is a separate, one-time development task, not something
done through this editor.

## 3. Making a change

1. Click into the content type you want to edit (e.g. "Blog Posts")
2. Click an existing item to edit it, or "Add" to create a new one
3. Fill in the fields — required fields are marked
4. Click **Save**

Saving creates a new version of the site automatically. It typically takes 1–3
minutes for changes to appear live — refresh the page after a few minutes if you
don't see it right away.

## 4. Images

- Use the **Image** field's upload button rather than pasting a URL
- Keep photos under ~500KB where possible — the site automatically compresses
  images further at publish time, but smaller originals publish faster
- Landscape (wider than tall) photos work best for cover/hero images

## 5. Getting help

If something looks wrong after publishing, or you're not sure how to add a new
type of content, contact your developer rather than editing files directly on
GitHub.
