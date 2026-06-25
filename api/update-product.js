import { verifyAdminRequest } from './_auth.js';

const GITHUB_API_BASE = 'https://api.github.com';

const {
  GITHUB_TOKEN,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_BRANCH = 'main',
  PRODUCTS_PATH = 'data/products.json',
  IMAGES_PATH = 'data/images',
} = process.env;

const githubHeaders = () => ({
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
});

const decodeBase64 = (value) => Buffer.from(value || 'W10=', 'base64').toString('utf8');

const encodeBase64 = (value) => Buffer.from(value).toString('base64');

const readGithubError = async (response) => {
  const error = await response.json().catch(() => ({}));
  return error.message || response.statusText || 'GitHub request failed.';
};

const rawUrl = (filePath) =>
  `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;

const safeNewImagePath = ({ product, image, index, uploadId }) => {
  const extension = image.name?.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const imageFolder = IMAGES_PATH.replace(/\/$/, '');
  const variantNumber = Number(image.variantIndex) + 1;
  return `${imageFolder}/${product.slug}-v${variantNumber}-${uploadId}-${index + 1}.${extension}`;
};

const readProducts = async () => {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PRODUCTS_PATH}?ref=${GITHUB_BRANCH}`,
    { headers: githubHeaders() },
  );

  if (!response.ok) {
    throw new Error(`Unable to read ${PRODUCTS_PATH}: ${await readGithubError(response)}`);
  }

  const data = await response.json();
  const products = JSON.parse(decodeBase64(data.content));

  if (!Array.isArray(products)) {
    throw new Error(`${PRODUCTS_PATH} must contain a JSON array.`);
  }

  return { products, sha: data.sha };
};

const uploadImage = async ({ filePath, image, product }) => {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: githubHeaders(),
      body: JSON.stringify({
        message: `Update product image: ${product.name}`,
        content: image.content,
        branch: GITHUB_BRANCH,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to upload ${filePath}: ${await readGithubError(response)}`);
  }
};

const writeProducts = async ({ products, sha, product }) => {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PRODUCTS_PATH}`,
    {
      method: 'PUT',
      headers: githubHeaders(),
      body: JSON.stringify({
        message: `Update product: ${product.name}`,
        content: encodeBase64(`${JSON.stringify(products, null, 2)}\n`),
        sha,
        branch: GITHUB_BRANCH,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to update ${PRODUCTS_PATH}: ${await readGithubError(response)}`);
  }
};

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!verifyAdminRequest(req)) {
    return res.status(401).json({ error: 'Please log in to continue.' });
  }

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({ error: 'Admin backend is not configured.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { id, product, images = [] } = body;

    if (!id) {
      return res.status(400).json({ error: 'Product id is required.' });
    }

    if (!product?.slugBase || !product?.name) {
      return res.status(400).json({ error: 'Product name is required.' });
    }

    if (!Array.isArray(images) || !Array.isArray(product.variants) || product.variants.length === 0) {
      return res.status(400).json({ error: 'Images must be an array.' });
    }

    if (product.variants.some((variant, index) =>
      (!Array.isArray(variant.images) || variant.images.length === 0)
      && !images.some((image) => Number(image.variantIndex) === index)
    )) {
      return res.status(400).json({ error: 'Keep or upload at least one image for every color.' });
    }

    const { products, sha } = await readProducts();
    const productIndex = products.findIndex((item) => item.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const existingProduct = products[productIndex];
    const productToSave = {
      ...existingProduct,
      ...product,
      id,
      slug: `${product.slugBase}-${id}`,
    };
    delete productToSave.slugBase;

    if (
      products.some((item, index) =>
        index !== productIndex && (item.id === productToSave.id || item.slug === productToSave.slug),
      )
    ) {
      return res.status(409).json({ error: 'A product with the same id or slug already exists.' });
    }

    if (images.length > 0) {
      const uploadId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const imagePaths = images.map((image, index) =>
        safeNewImagePath({ product: productToSave, image, index, uploadId }),
      );

      for (const [index, image] of images.entries()) {
        await uploadImage({ filePath: imagePaths[index], image, product: productToSave });
      }

      productToSave.variants = productToSave.variants.map((variant, variantIndex) => ({
        ...variant,
        images: [
          ...(Array.isArray(variant.images) ? variant.images : []),
          ...imagePaths
            .filter((_, imageIndex) => Number(images[imageIndex].variantIndex) === variantIndex)
            .map((filePath) => rawUrl(filePath)),
        ],
      }));
    }
    productToSave.variants = productToSave.variants.map((variant) => {
      const existingVariant = (existingProduct.variants || []).find((item) => item.id === variant.id);
      const existingPreviews = new Map(
        (existingVariant?.images || []).map((image, index) => [image, existingVariant.previews?.[index] || null]),
      );

      return {
        ...variant,
        previews: (variant.images || []).map((image) => existingPreviews.get(image) || null),
      };
    });
    productToSave.images = productToSave.variants.flatMap((variant) => variant.images || []);
    productToSave.previews = productToSave.variants.flatMap((variant) => variant.previews || []);

    const nextProducts = [...products];
    nextProducts[productIndex] = productToSave;
    await writeProducts({ products: nextProducts, sha, product: productToSave });

    return res.status(200).json({ product: productToSave });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to update product.' });
  }
}
