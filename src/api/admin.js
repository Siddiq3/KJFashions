const MAX_IMAGE_DIMENSION = 1400;
const WEBP_QUALITY = 0.78;

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = () => reject(new Error('Unable to read optimized image.'));
    reader.readAsDataURL(blob);
  });

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error(`${file.name} is not a supported image file.`));
    };
    image.src = imageUrl;
  });

const canvasToWebp = (canvas, fileName) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Unable to optimize ${fileName}.`));
          return;
        }

        resolve(blob);
      },
      'image/webp',
      WEBP_QUALITY,
    );
  });

const getOptimizedSize = ({ width, height }) => {
  const largestSide = Math.max(width, height);

  if (largestSide <= MAX_IMAGE_DIMENSION) {
    return { width, height };
  }

  const scale = MAX_IMAGE_DIMENSION / largestSide;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
};

const getBaseName = (fileName, fallback) => {
  const name = fileName.replace(/\.[^.]+$/, '').trim();
  return name
    ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : fallback;
};

const optimizeImageToWebp = async (file, index) => {
  if (!file.type.startsWith('image/')) {
    throw new Error(`${file.name} is not an image file.`);
  }

  const image = await loadImage(file);
  const { width, height } = getOptimizedSize({
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
  });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToWebp(canvas, file.name);
  const baseName = getBaseName(file.name, `product-image-${index + 1}`);

  return {
    name: `${baseName}.webp`,
    type: 'image/webp',
    originalName: file.name,
    originalSize: file.size,
    size: blob.size,
    content: await blobToBase64(blob),
  };
};

export const addProductFromAdmin = async ({ product, imageFiles }) => {
  const images = await Promise.all(
    imageFiles.map((file, index) => optimizeImageToWebp(file, index)),
  );

  const response = await fetch('/api/add-product', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product, images }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Unable to add product.');
  }

  return data.product;
};

export const updateProductFromAdmin = async ({ id, product, imageFiles, existingImages }) => {
  const images = await Promise.all(
    imageFiles.map((file, index) => optimizeImageToWebp(file, index)),
  );

  const response = await fetch('/api/update-product', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, product, images, existingImages }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Unable to update product.');
  }

  return data.product;
};

export const deleteProductFromAdmin = async (id) => {
  const response = await fetch('/api/delete-product', {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Unable to delete product.');
  }

  return data;
};

export const loginAdmin = async ({ email, password }) => {
  const response = await fetch('/api/admin-login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Unable to log in.');
  }

  return data;
};

export const checkAdminSession = async () => {
  const response = await fetch('/api/admin-session', {
    credentials: 'include',
  });
  const data = await response.json().catch(() => ({}));
  return Boolean(data.authenticated);
};

export const logoutAdmin = async () => {
  await fetch('/api/admin-logout', {
    method: 'POST',
    credentials: 'include',
  });
};
