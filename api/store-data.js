const GITHUB_API_BASE = 'https://api.github.com';

const {
  GITHUB_TOKEN,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_BRANCH = 'main',
} = process.env;

const allowedFiles = new Set(['products.json', 'categories.json', 'banners.json']);

const githubHeaders = () => ({
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
});

const decodeBase64 = (value) => Buffer.from(value || 'W10=', 'base64').toString('utf8');

const readError = async (response) => {
  const error = await response.json().catch(() => ({}));
  return error.message || response.statusText || 'GitHub request failed.';
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const requestUrl = new URL(req.url, 'http://localhost');
  const file = requestUrl.searchParams.get('file');

  if (!allowedFiles.has(file)) {
    return res.status(400).json({ error: 'Unknown data file.' });
  }

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({ error: 'Store data backend is not configured.' });
  }

  const filePath = `data/${file}`;
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
    { headers: githubHeaders() },
  );

  if (response.status === 404) {
    return res.status(200).json([]);
  }

  if (!response.ok) {
    return res.status(response.status).json({ error: `Unable to read ${filePath}: ${await readError(response)}` });
  }

  try {
    const data = await response.json();
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json(JSON.parse(decodeBase64(data.content)));
  } catch {
    return res.status(500).json({ error: `${filePath} is not valid JSON.` });
  }
}
