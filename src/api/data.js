const DATA_BASE_URL = import.meta.env.VITE_DATA_BASE_URL;

const fetchFromServer = async (fileName, { cacheBust = false } = {}) => {
  const params = new URLSearchParams({ file: fileName });

  if (cacheBust) {
    params.set('t', String(Date.now()));
  }

  const response = await fetch(`/api/store-data?${params.toString()}`, {
    cache: cacheBust ? 'no-store' : 'default',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Unable to fetch ${fileName}. Status ${response.status}`);
  }

  return response.json();
};

const fetchJson = async (fileName, { preferServer = false, cacheBust = false } = {}) => {
  if (preferServer) {
    return fetchFromServer(fileName, { cacheBust });
  }

  if (!DATA_BASE_URL) {
    return fetchFromServer(fileName, { cacheBust });
  }

  try {
    const url = new URL(`${DATA_BASE_URL.replace(/\/$/, '')}/${fileName}`);

    if (cacheBust) {
      url.searchParams.set('t', String(Date.now()));
    }

    const response = await fetch(url.toString(), {
      cache: cacheBust ? 'no-store' : 'default',
    });

    if (!response.ok) {
      return fetchFromServer(fileName, { cacheBust });
    }

    return await response.json();
  } catch (error) {
    try {
      return await fetchFromServer(fileName, { cacheBust });
    } catch {
      throw new Error(error.message || `Unable to fetch ${fileName}.`);
    }
  }
};

export const fetchProducts = (options) => fetchJson('products.json', options);
export const fetchCategories = (options) => fetchJson('categories.json', options);
export const fetchBanners = (options) => fetchJson('banners.json', options);
