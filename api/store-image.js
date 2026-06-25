const GITHUB_API_BASE = 'https://api.github.com';

const {
  GITHUB_TOKEN,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_BRANCH = 'main',
  IMAGES_PATH = 'data/images',
} = process.env;

const imageContentTypes = {
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const githubHeaders = () => ({
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.raw+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'khwaja-textiles-storefront',
});

const readError = async (response) => {
  const error = await response.json().catch(() => ({}));
  return error.message || response.statusText || 'GitHub request failed.';
};

const isAllowedImagePath = (filePath) => {
  const imageFolder = IMAGES_PATH.replace(/\/$/, '');
  return filePath.startsWith(`${imageFolder}/`) && !filePath.includes('..');
};

const getContentType = (filePath) => {
  const extension = filePath.split('.').pop()?.toLowerCase();
  return imageContentTypes[extension] || 'application/octet-stream';
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const requestUrl = new URL(req.url, 'http://localhost');
  const filePath = requestUrl.searchParams.get('path') || '';

  if (!isAllowedImagePath(filePath)) {
    return res.status(400).json({ error: 'Unknown image path.' });
  }

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({ error: 'Store image backend is not configured.' });
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
    { headers: githubHeaders() },
  );

  if (!response.ok) {
    return res.status(response.status).json({ error: `Unable to read ${filePath}: ${await readError(response)}` });
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());

  res.setHeader('Content-Type', getContentType(filePath));
  res.setHeader('Content-Length', String(imageBuffer.length));
  res.setHeader(
    'Cache-Control',
    'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
  );
  return res.end(imageBuffer);
}
