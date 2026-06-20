# Khwaja Textiles & readymades Store

Production-ready React + Vite storefront for men's and kids' wear with GitHub raw JSON data, GitHub-hosted product images, localStorage cart, and WhatsApp order submission.

## Setup

1. Create a public GitHub data repository with:
   - `data/products.json`
   - `data/categories.json`
   - `data/banners.json`
2. Store product images in `data/images` using the admin panel. Category and banner images can also use raw GitHub image URLs.
3. Create `.env` from `.env.example`:

```bash
VITE_DATA_BASE_URL=https://raw.githubusercontent.com/Siddiq3/shopbackend/main/data
VITE_WHATSAPP_NUMBER=919952632682
VITE_STORE_NAME=Khwaja Textiles & readymades
GITHUB_OWNER=Siddiq3
GITHUB_REPO=shopbackend
GITHUB_BRANCH=main
PRODUCTS_PATH=data/products.json
IMAGES_PATH=data/images
GITHUB_TOKEN=
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=change-this-long-random-secret
```

4. Install and run:

```bash
npm install
npm run dev
```

## Deploy

Deploy to Vercel as a Vite project. The included `vercel.json` rewrites all routes to `/` for React Router.

## Admin Panel

Open `/admin` to add products. The admin panel shows only shop-friendly product fields. A private serverless API uploads product images to `data/images` and updates `data/products.json`.

Use a fine-grained token with contents read/write access for the catalogue repository. Set it as `GITHUB_TOKEN` in Vercel environment variables. Also set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` in Vercel for the admin login. Do not use `VITE_` for secrets, because Vite frontend env values are visible in the browser bundle.

The admin product form is designed for quick shop entry: choose `Men` or `Kids`, choose a product type such as `Shirts`, `T-Shirts`, `Pants`, `Jeans`, `Shorts`, or `Kurta`, and the app creates the product category automatically. Sizes change automatically too: men’s jeans/pants use waist sizes like `28, 30, 32`, men’s shirts use `S, M, L`, and kids products use age sizes like `2-3Y, 4-5Y`. Product codes are also automatic: the API reads existing product IDs and creates the next code such as `p034`.

## Product Schema

Products in `data/products.json` should use this shape:

```json
{
  "id": "p033",
  "name": "Product Name",
  "slug": "product-name-p033",
  "category": "men-shirts",
  "price": 900,
  "originalPrice": 1300,
  "description": "Full product description here...",
  "images": [
    "https://raw.githubusercontent.com/Siddiq3/shopbackend/main/data/images/product-name-p033-1.jpg"
  ],
  "tags": ["men", "shirts", "white"],
  "inStock": true,
  "stockCount": 12,
  "featured": false,
  "badge": null,
  "sizes": ["S", "M", "L", "XL", "XXL"],
  "fabric": "Cotton",
  "occasion": "Eid / Casual",
  "color": "White",
  "forAge": "Adult",
  "gender": "Men",
  "careInstructions": "Machine wash cold",
  "createdAt": "2025-04-15"
}
```
