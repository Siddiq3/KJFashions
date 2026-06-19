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

const safeImagePath = ({ product, image, index }) => {
  const extension = image.name?.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const imageFolder = IMAGES_PATH.replace(/\/$/, '');
  return `${imageFolder}/${product.slug}-${index + 1}.${extension}`;
};

const getNextProductId = (products) => {
  const maxNumber = products.reduce((max, product) => {
    const match = String(product.id || '').match(/^p(\d+)$/i);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `p${String(maxNumber + 1).padStart(3, '0')}`;
};

const readProducts = async () => {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PRODUCTS_PATH}?ref=${GITHUB_BRANCH}`,
    { headers: githubHeaders() },
  );

  if (!response.ok) {
    if (response.status === 404) {
      return { products: [], sha: null };
    }

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
        message: `Upload product image: ${product.name}`,
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
        message: `Add product: ${product.name}`,
        content: encodeBase64(`${JSON.stringify(products, null, 2)}\n`),
        ...(sha ? { sha } : {}),
        branch: GITHUB_BRANCH,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to update ${PRODUCTS_PATH}: ${await readGithubError(response)}`);
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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
    const { product, images = [] } = body;

    if (!product?.slugBase || !product?.name) {
      return res.status(400).json({ error: 'Product name is required.' });
    }

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Upload at least one product image.' });
    }

    const { products, sha } = await readProducts();
    const nextId = getNextProductId(products);
    const productToSave = {
      ...product,
      id: nextId,
      slug: `${product.slugBase}-${nextId}`,
    };
    delete productToSave.slugBase;

    if (products.some((item) => item.id === productToSave.id || item.slug === productToSave.slug)) {
      return res.status(409).json({ error: 'A product with the same id or slug already exists.' });
    }

    const imagePaths = images.map((image, index) => safeImagePath({ product: productToSave, image, index }));

    for (const [index, image] of images.entries()) {
      await uploadImage({ filePath: imagePaths[index], image, product: productToSave });
    }

    const productWithImages = {
      ...productToSave,
      images: imagePaths.map((filePath) => rawUrl(filePath)),
    };

    await writeProducts({ products: [productWithImages, ...products], sha, product: productWithImages });

    return res.status(200).json({ product: productWithImages });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to add product.' });
  }
}
