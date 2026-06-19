const DATA_BASE_URL = import.meta.env.VITE_DATA_BASE_URL || '';

const getPrivateGithubImagePath = (url) => {
  if (!url || typeof url !== 'string') return '';

  try {
    const imageUrl = new URL(url, window.location.origin);
    const dataBaseUrl = DATA_BASE_URL ? new URL(DATA_BASE_URL) : null;

    if (
      dataBaseUrl &&
      imageUrl.hostname === dataBaseUrl.hostname &&
      imageUrl.pathname.startsWith(`${dataBaseUrl.pathname.replace(/\/$/, '')}/images/`)
    ) {
      return `data/images/${imageUrl.pathname.split('/images/')[1]}`;
    }

    if (
      imageUrl.hostname === 'raw.githubusercontent.com' &&
      imageUrl.pathname.includes('/data/images/')
    ) {
      return `data/images/${imageUrl.pathname.split('/data/images/')[1]}`;
    }
  } catch {
    return '';
  }

  return '';
};

export const optimizeImageUrl = (url) => {
  const githubImagePath = getPrivateGithubImagePath(url);

  if (githubImagePath) {
    return `/api/store-image?path=${encodeURIComponent(githubImagePath)}`;
  }

  return url;
};
