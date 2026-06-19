import { verifyAdminRequest } from './_auth.js';

const GITHUB_API_BASE = 'https://api.github.com';

const {
  GITHUB_TOKEN,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_BRANCH = 'main',
  PRODUCTS_PATH = 'data/products.json',
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

const writeProducts = async ({ products, sha, product }) => {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PRODUCTS_PATH}`,
    {
      method: 'PUT',
      headers: githubHeaders(),
      body: JSON.stringify({
        message: `Delete product: ${product.name}`,
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
  if (req.method !== 'DELETE') {
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
    const { id } = body;

    if (!id) {
      return res.status(400).json({ error: 'Product id is required.' });
    }

    const { products, sha } = await readProducts();
    const productToDelete = products.find((product) => product.id === id);

    if (!productToDelete) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await writeProducts({
      products: products.filter((product) => product.id !== id),
      sha,
      product: productToDelete,
    });

    return res.status(200).json({ deleted: true, id });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to delete product.' });
  }
}
