const GITHUB_API_BASE = 'https://api.github.com';

const encodeBase64 = (value) => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const decodeBase64 = (value) => {
  const binary = atob(value.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const encodeArrayBufferBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

export const parseGitHubRawConfig = () => {
  const rawBaseUrl = import.meta.env.VITE_DATA_BASE_URL || '';
  const match = rawBaseUrl.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/);

  if (!match) {
    return {
      owner: import.meta.env.VITE_GITHUB_OWNER || '',
      repo: import.meta.env.VITE_GITHUB_REPO || '',
      branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
      productsPath: import.meta.env.VITE_PRODUCTS_PATH || 'data/products.json',
      imagesPath: import.meta.env.VITE_IMAGES_PATH || 'data/images',
    };
  }

  const [, owner, repo, branch, basePath] = match;

  return {
    owner: import.meta.env.VITE_GITHUB_OWNER || owner,
    repo: import.meta.env.VITE_GITHUB_REPO || repo,
    branch: import.meta.env.VITE_GITHUB_BRANCH || branch,
    productsPath: import.meta.env.VITE_PRODUCTS_PATH || `${basePath.replace(/\/$/, '')}/products.json`,
    imagesPath: import.meta.env.VITE_IMAGES_PATH || `${basePath.replace(/\/$/, '')}/images`,
  };
};

const githubHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
});

export const fetchGitHubProductsFile = async ({ owner, repo, branch, productsPath, token }) => {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${productsPath}?ref=${branch}`;
  const response = await fetch(url, { headers: githubHeaders(token) });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Unable to read ${productsPath}. Status ${response.status}`);
  }

  const data = await response.json();
  const products = JSON.parse(decodeBase64(data.content || 'W10='));

  if (!Array.isArray(products)) {
    throw new Error(`${productsPath} must contain a JSON array.`);
  }

  return { products, sha: data.sha };
};

export const buildRawGitHubUrl = ({ owner, repo, branch, filePath }) =>
  `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;

export const uploadImageToGitHub = async ({ config, token, file, filePath, productName }) => {
  const safeConfig = {
    owner: config.owner?.trim(),
    repo: config.repo?.trim(),
    branch: config.branch?.trim() || 'main',
  };

  if (!token?.trim()) throw new Error('GitHub token is required.');
  if (!safeConfig.owner || !safeConfig.repo) throw new Error('GitHub owner and repository are required.');

  const content = encodeArrayBufferBase64(await file.arrayBuffer());
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${safeConfig.owner}/${safeConfig.repo}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: githubHeaders(token.trim()),
      body: JSON.stringify({
        message: `Upload product image: ${productName}`,
        content,
        branch: safeConfig.branch,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Unable to upload ${filePath}. Status ${response.status}`);
  }

  return response.json();
};

export const addProductToGitHub = async ({ config, token, product }) => {
  const safeConfig = {
    owner: config.owner?.trim(),
    repo: config.repo?.trim(),
    branch: config.branch?.trim() || 'main',
    productsPath: config.productsPath?.trim() || 'data/products.json',
  };

  if (!token?.trim()) throw new Error('GitHub token is required.');
  if (!safeConfig.owner || !safeConfig.repo) throw new Error('GitHub owner and repository are required.');

  const { products, sha } = await fetchGitHubProductsFile({
    ...safeConfig,
    token: token.trim(),
  });

  if (products.some((item) => item.id === product.id || item.slug === product.slug)) {
    throw new Error('A product with the same id or slug already exists.');
  }

  const nextProducts = [product, ...products];
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${safeConfig.owner}/${safeConfig.repo}/contents/${safeConfig.productsPath}`,
    {
      method: 'PUT',
      headers: githubHeaders(token.trim()),
      body: JSON.stringify({
        message: `Add product: ${product.name}`,
        content: encodeBase64(`${JSON.stringify(nextProducts, null, 2)}\n`),
        sha,
        branch: safeConfig.branch,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Unable to update ${safeConfig.productsPath}. Status ${response.status}`);
  }

  return response.json();
};
