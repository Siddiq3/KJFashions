import { CheckCircle2, Loader2, Lock, LogOut, Pencil, Plus, RefreshCw, ShieldAlert, Store, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addProductFromAdmin,
  checkAdminSession,
  deleteProductFromAdmin,
  loginAdmin,
  logoutAdmin,
  updateProductFromAdmin,
} from '../api/admin';
import { fetchProducts } from '../api/data';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import {
  audienceOptions,
  getAudienceOption,
  getCategorySlug,
  getDefaultSizes,
  getProductTypeLabel,
  productTypeOptions,
} from '../data/productOptions';
import { getProductVariants } from '../utils/product';
import { createSlug } from '../utils/slug';

const today = new Date().toISOString().slice(0, 10);
const makeVariant = (sizes = '') => ({
  key: `variant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  color: '',
  sizes,
  stockCount: '',
  existingImages: [],
  imageFiles: [],
});

const emptyProduct = {
  name: '',
  audience: 'men',
  productType: 'shirts',
  customProductType: '',
  price: '',
  originalPrice: '',
  description: '',
  tags: '',
  inStock: true,
  featured: false,
  badge: '',
  fabric: '',
  occasion: '',
  careInstructions: '',
  variants: [makeVariant(getDefaultSizes({ audience: 'men', productType: 'shirts' }))],
  createdAt: today,
};

const findProductType = (product, audience) => {
  const categoryType = String(product.category || '').replace(new RegExp(`^${audience}-`), '');
  const knownType = productTypeOptions.find((type) => type.value === categoryType);

  if (knownType) return { productType: knownType.value, customProductType: '' };

  const tagType = productTypeOptions.find((type) => product.tags?.includes(type.value));
  if (tagType) return { productType: tagType.value, customProductType: '' };

  const customProductType = categoryType
    .split('-')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');

  return { productType: 'other', customProductType };
};

const productToForm = (product) => {
  const audience = String(product.category || '').startsWith('kids-') || product.gender === 'Kids' || product.forAge === 'Kids'
    ? 'kids'
    : 'men';
  const { productType, customProductType } = findProductType(product, audience);
  const variants = getProductVariants(product).map((variant) => ({
    key: variant.id || `variant-${Math.random().toString(36).slice(2, 8)}`,
    color: variant.color,
    sizes: variant.sizes.join(', '),
    stockCount: typeof variant.stockCount === 'number' ? String(variant.stockCount) : '',
    existingImages: variant.images,
    imageFiles: [],
  }));

  return {
    name: product.name || '',
    audience,
    productType,
    customProductType,
    price: product.price ? String(product.price) : '',
    originalPrice: product.originalPrice ? String(product.originalPrice) : '',
    description: product.description || '',
    tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
    inStock: Boolean(product.inStock),
    featured: Boolean(product.featured),
    badge: product.badge || '',
    fabric: product.fabric || '',
    occasion: product.occasion || '',
    careInstructions: product.careInstructions || '',
    variants,
    createdAt: product.createdAt || today,
  };
};

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [product, setProduct] = useState(emptyProduct);
  const [adminProducts, setAdminProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadSession = async () => {
      try {
        setAuthenticated(await checkAdminSession());
      } catch {
        setAuthenticated(false);
      } finally {
        setCheckingSession(false);
      }
    };

    loadSession();
  }, []);

  const loadAdminProducts = useCallback(async () => {
    setProductsLoading(true);

    try {
      const data = await fetchProducts({ preferServer: true, cacheBust: true });
      setAdminProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load products.');
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadAdminProducts();
    }
  }, [authenticated, loadAdminProducts]);

  const previewProduct = useMemo(() => {
    const slugBase = createSlug(product.name || 'new-product');
    const audience = getAudienceOption(product.audience);
    const productTypeLabel = getProductTypeLabel(product);
    const category = getCategorySlug(product);
    const variants = product.variants.map((variant, index) => ({
      id: `v${index + 1}`,
      color: variant.color.trim(),
      sizes: variant.sizes
        .split(',')
        .map((size) => size.trim())
        .filter(Boolean),
      stockCount: Math.max(0, Number(variant.stockCount) || 0),
      images: variant.existingImages,
    }));
    const stockCount = variants.reduce((total, variant) => total + variant.stockCount, 0);
    const sizes = Array.from(new Set(variants.flatMap((variant) => variant.sizes)));
    const colors = variants.map((variant) => variant.color).filter(Boolean);
    const images = variants.flatMap((variant) => variant.images);
    const tags = [
      product.audience,
      productTypeLabel,
      ...colors,
      ...product.tags.split(','),
    ]
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    return {
      slugBase,
      name: product.name.trim(),
      category,
      price: Number(product.price),
      originalPrice: Number(product.originalPrice || product.price),
      description: product.description.trim(),
      images,
      tags: Array.from(new Set(tags)),
      inStock: product.inStock && stockCount > 0,
      stockCount,
      featured: product.featured,
      badge: product.badge.trim() || null,
      sizes,
      fabric: product.fabric.trim(),
      occasion: product.occasion.trim(),
      color: colors.join(', '),
      variants,
      forAge: audience.forAge,
      gender: audience.gender,
      careInstructions: product.careInstructions.trim(),
      createdAt: product.createdAt || today,
    };
  }, [product]);

  const updateProduct = (field, value) => {
    setProduct((current) => {
      const next = { ...current, [field]: value };

      if (field === 'audience' || field === 'productType') {
        const sizes = getDefaultSizes({
          audience: field === 'audience' ? value : current.audience,
          productType: field === 'productType' ? value : current.productType,
        });
        next.variants = current.variants.map((variant) => ({ ...variant, sizes }));
      }

      return next;
    });
    setError('');
    setSuccess('');
  };

  const updateVariant = (key, field, value) => {
    setProduct((current) => ({
      ...current,
      variants: current.variants.map((variant) =>
        variant.key === key ? { ...variant, [field]: value } : variant,
      ),
    }));
    setError('');
    setSuccess('');
  };

  const addVariant = () => {
    const sizes = getDefaultSizes(product);
    setProduct((current) => ({
      ...current,
      variants: [...current.variants, makeVariant(sizes)],
    }));
  };

  const removeVariant = (key) => {
    setProduct((current) => ({
      ...current,
      variants: current.variants.filter((variant) => variant.key !== key),
    }));
  };

  const updateImageFiles = (key, fileList) => {
    const selectedFiles = Array.from(fileList || []);

    setProduct((current) => ({
      ...current,
      variants: current.variants.map((variant) => {
        if (variant.key !== key) return variant;
        const currentKeys = new Set(
          variant.imageFiles.map((file) => `${file.name}-${file.size}-${file.lastModified}`),
        );
        const newFiles = selectedFiles.filter(
          (file) => !currentKeys.has(`${file.name}-${file.size}-${file.lastModified}`),
        );
        return { ...variant, imageFiles: [...variant.imageFiles, ...newFiles] };
      }),
    }));
    setError('');
    setSuccess('');
  };

  const removeImageFile = (key, fileToRemove) => {
    setProduct((current) => ({
      ...current,
      variants: current.variants.map((variant) =>
        variant.key === key
          ? { ...variant, imageFiles: variant.imageFiles.filter((file) => file !== fileToRemove) }
          : variant,
      ),
    }));
    setError('');
    setSuccess('');
  };

  const removeExistingImage = (key, imageToRemove) => {
    setProduct((current) => ({
      ...current,
      variants: current.variants.map((variant) =>
        variant.key === key
          ? { ...variant, existingImages: variant.existingImages.filter((image) => image !== imageToRemove) }
          : variant,
      ),
    }));
    setError('');
    setSuccess('');
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProduct((current) => ({
      ...emptyProduct,
      audience: current.audience,
      productType: current.productType,
      customProductType: current.customProductType,
      variants: [makeVariant(getDefaultSizes(current))],
    }));
    setError('');
  };

  const startEditingProduct = (selectedProduct) => {
    setEditingProduct(selectedProduct);
    setProduct(productToForm(selectedProduct));
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validate = () => {
    if (!product.name.trim()) return 'Product name is required.';
    if (!product.audience) return 'Choose Men or Kids.';
    if (!product.productType) return 'Choose product type.';
    if (product.productType === 'other' && !product.customProductType.trim()) return 'Enter the product type.';
    if (!Number(product.price) || Number(product.price) <= 0) return 'Price must be greater than zero.';
    if (!product.description.trim()) return 'Description is required.';
    if (!product.fabric.trim()) return 'Fabric is required.';
    if (product.variants.length === 0) return 'Add at least one color variant.';
    const invalidVariant = product.variants.find((variant) =>
      !variant.color.trim()
      || variant.stockCount === ''
      || Number(variant.stockCount) < 0
      || !variant.sizes.split(',').some((size) => size.trim())
      || (variant.imageFiles.length === 0 && variant.existingImages.length === 0),
    );
    if (invalidVariant) return 'Every color needs a name, stock count, at least one size, and at least one image.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const variantUploads = product.variants.flatMap((variant, variantIndex) =>
        variant.imageFiles.map((file) => ({ file, variantIndex })),
      );
      if (editingProduct) {
        await updateProductFromAdmin({
          id: editingProduct.id,
          product: previewProduct,
          variantUploads,
        });
        setSuccess(`${previewProduct.name} was updated in the catalogue.`);
      } else {
        await addProductFromAdmin({ product: previewProduct, variantUploads });
        setSuccess(`${previewProduct.name} was saved to the catalogue.`);
      }

      await loadAdminProducts();
      resetProductForm();
    } catch (err) {
      setError(err.message || `Unable to ${editingProduct ? 'update' : 'add'} product.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (selectedProduct) => {
    const confirmed = window.confirm(`Delete ${selectedProduct.name}? This removes it from the catalogue.`);

    if (!confirmed) return;

    setDeletingId(selectedProduct.id);
    setError('');
    setSuccess('');

    try {
      await deleteProductFromAdmin(selectedProduct.id);
      setSuccess(`${selectedProduct.name} was deleted from the catalogue.`);
      if (editingProduct?.id === selectedProduct.id) {
        resetProductForm();
      }
      await loadAdminProducts();
    } catch (err) {
      setError(err.message || 'Unable to delete product.');
    } finally {
      setDeletingId('');
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    try {
      await loginAdmin(loginForm);
      setAuthenticated(true);
    } catch (err) {
      setLoginError(err.message || 'Unable to log in.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAuthenticated(false);
    setLoginForm({ email: '', password: '' });
  };

  if (checkingSession) return <LoadingSpinner label="Checking admin access" />;

  if (!authenticated) {
    return (
      <div className="container-page flex min-h-[70vh] items-center justify-center py-10">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-md border border-primary-100 bg-white p-7 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <Lock size={24} />
          </div>
          <h1 className="mt-5 text-4xl font-semibold text-store-dark">Admin Login</h1>
          <p className="mt-2 text-sm leading-6 text-store-dark/65">
            Sign in to manage products.
          </p>
          <label className="mt-6 block">
            <span className="text-sm font-semibold text-store-dark">Email</span>
            <input
              type="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
              className="form-input mt-2"
              autoComplete="username"
              required
            />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-semibold text-store-dark">Password</span>
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
              className="form-input mt-2"
              autoComplete="current-password"
              required
            />
          </label>
          {loginError && (
            <div className="mt-5 flex gap-3 rounded-md bg-red-50 p-4 text-sm font-medium text-red-700">
              <ShieldAlert size={19} />
              <span>{loginError}</span>
            </div>
          )}
          <button type="submit" disabled={loggingIn} className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:bg-store-dark/25">
            {loggingIn ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
            {loggingIn ? 'Signing In' : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-700">
            <Store size={17} />
            Store Admin
          </p>
          <h1 className="mt-3 text-5xl font-semibold text-store-dark">Manage Products</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-store-dark/65">
            Add, update, and delete men&apos;s and kids&apos; wear products with photos, stock, sizes, and care details.
          </p>
        </div>
        <button type="button" onClick={handleLogout} className="btn-secondary self-start md:self-auto">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <form onSubmit={handleSubmit} className="rounded-md border border-primary-100 bg-white p-5 shadow-sm md:p-7">
          <section>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-semibold text-store-dark">
                {editingProduct ? 'Update Product' : 'Product Details'}
              </h2>
              {editingProduct && (
                <button type="button" onClick={resetProductForm} className="btn-secondary self-start px-4 py-2">
                  <X size={17} />
                  Cancel Edit
                </button>
              )}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Product Name" full>
                <input value={product.name} onChange={(event) => updateProduct('name', event.target.value)} className="form-input" placeholder="Men's cotton shirt" />
              </Field>
              <Field label="For">
                <select value={product.audience} onChange={(event) => updateProduct('audience', event.target.value)} className="form-input">
                  {audienceOptions.map((audience) => (
                    <option key={audience.value} value={audience.value}>
                      {audience.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Product Type">
                <select value={product.productType} onChange={(event) => updateProduct('productType', event.target.value)} className="form-input">
                  {productTypeOptions.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </Field>
              {product.productType === 'other' && (
                <Field label="Type Name">
                  <input value={product.customProductType} onChange={(event) => updateProduct('customProductType', event.target.value)} className="form-input" placeholder="Track pants" />
                </Field>
              )}
              <Field label="Badge">
                <input value={product.badge} onChange={(event) => updateProduct('badge', event.target.value)} className="form-input" placeholder="New Arrival" />
              </Field>
              <Field label="Price">
                <input type="number" min="1" value={product.price} onChange={(event) => updateProduct('price', event.target.value)} className="form-input" />
              </Field>
              <Field label="Original Price">
                <input type="number" min="1" value={product.originalPrice} onChange={(event) => updateProduct('originalPrice', event.target.value)} className="form-input" />
              </Field>
              <Field label="Fabric">
                <input value={product.fabric} onChange={(event) => updateProduct('fabric', event.target.value)} className="form-input" placeholder="Cotton" />
              </Field>
              <Field label="Occasion">
                <input value={product.occasion} onChange={(event) => updateProduct('occasion', event.target.value)} className="form-input" placeholder="Eid / Casual" />
              </Field>
              <Field label="Created At">
                <input value={product.createdAt} onChange={(event) => updateProduct('createdAt', event.target.value)} className="form-input" placeholder="2025-04-15" />
              </Field>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-store-dark">Color Variants</h3>
                    <p className="mt-1 text-xs leading-5 text-store-dark/55">
                      Add each available color with its own photos, sizes, and stock.
                    </p>
                  </div>
                  <button type="button" onClick={addVariant} className="btn-secondary px-4 py-2">
                    <Plus size={17} />
                    Add Color
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  {product.variants.map((variant, variantIndex) => (
                    <div key={variant.key} className="rounded-md border border-primary-100 bg-primary-50/50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-semibold text-store-dark">Color {variantIndex + 1}</h4>
                        {product.variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(variant.key)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-700"
                          >
                            <Trash2 size={15} />
                            Remove color
                          </button>
                        )}
                      </div>
                      <div className="mt-3 grid gap-4 md:grid-cols-2">
                        <Field label="Color Name">
                          <input
                            value={variant.color}
                            onChange={(event) => updateVariant(variant.key, 'color', event.target.value)}
                            className="form-input"
                            placeholder="White"
                          />
                        </Field>
                        <Field label="Stock Count">
                          <input
                            type="number"
                            min="0"
                            value={variant.stockCount}
                            onChange={(event) => updateVariant(variant.key, 'stockCount', event.target.value)}
                            className="form-input"
                            placeholder="12"
                          />
                        </Field>
                        <Field label="Available Sizes" full>
                          <input
                            value={variant.sizes}
                            onChange={(event) => updateVariant(variant.key, 'sizes', event.target.value)}
                            className="form-input"
                            placeholder="S, M, L, XL, XXL"
                          />
                        </Field>
                        <Field label="Color Images" full>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(event) => {
                              updateImageFiles(variant.key, event.target.files);
                              event.target.value = '';
                            }}
                            className="form-input resize-none"
                          />
                          {variant.existingImages.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                              {variant.existingImages.map((image) => (
                                <div key={image} className="overflow-hidden rounded-md border border-primary-100 bg-white">
                                  <img src={image} alt="" className="h-28 w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removeExistingImage(variant.key, image)}
                                    className="w-full px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                                  >
                                    Remove image
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {variant.imageFiles.length > 0 && (
                            <div className="mt-3 space-y-2 rounded-md bg-white p-3 text-xs leading-5 text-store-dark/70">
                              {variant.imageFiles.map((file) => (
                                <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-3">
                                  <span className="truncate">{file.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeImageFile(variant.key, file)}
                                    className="rounded-md px-2 py-1 font-semibold text-red-700 transition hover:bg-red-50"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Field label="Description" full>
                <textarea
                  rows={4}
                  value={product.description}
                  onChange={(event) => updateProduct('description', event.target.value)}
                  className="form-input resize-none"
                  placeholder="Mention fit, material, available sizes, and care details."
                />
              </Field>
              <Field label="Care Instructions" full>
                <input value={product.careInstructions} onChange={(event) => updateProduct('careInstructions', event.target.value)} className="form-input" placeholder="Machine wash cold" />
              </Field>
              <Field label="Tags" full>
                <input value={product.tags} onChange={(event) => updateProduct('tags', event.target.value)} className="form-input" placeholder="mens, shirt, cotton" />
              </Field>
              <label className="flex items-center justify-between rounded-md bg-primary-50 px-4 py-3 text-sm font-semibold text-store-dark">
                In stock
                <input type="checkbox" checked={product.inStock} onChange={(event) => updateProduct('inStock', event.target.checked)} className="h-5 w-5 accent-primary-600" />
              </label>
              <label className="flex items-center justify-between rounded-md bg-primary-50 px-4 py-3 text-sm font-semibold text-store-dark">
                Featured product
                <input type="checkbox" checked={product.featured} onChange={(event) => updateProduct('featured', event.target.checked)} className="h-5 w-5 accent-primary-600" />
              </label>
            </div>
          </section>

          {error && (
            <div className="mt-6 flex gap-3 rounded-md bg-red-50 p-4 text-sm font-medium text-red-700">
              <ShieldAlert size={19} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mt-6 flex gap-3 rounded-md bg-green-50 p-4 text-sm font-medium text-green-700">
              <CheckCircle2 size={19} />
              <span>{success}</span>
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary mt-7 w-full disabled:cursor-not-allowed disabled:bg-store-dark/25">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : editingProduct ? <Pencil size={18} /> : <Plus size={18} />}
            {submitting ? 'Saving Product' : editingProduct ? 'Update Product' : 'Save Product'}
          </button>
        </form>

        <aside className="rounded-md border border-primary-100 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-semibold text-store-dark">Product Preview</h2>
          <p className="mt-2 text-sm leading-6 text-store-dark/65">
            Review the main product details before saving.
          </p>
          <div className="mt-5 space-y-4 text-sm">
            <PreviewRow label="Name" value={previewProduct.name || 'Product name'} />
            <PreviewRow label="For" value={getAudienceOption(product.audience).label} />
            <PreviewRow label="Type" value={getProductTypeLabel(product)} />
            <PreviewRow label="Price" value={previewProduct.price ? `₹${previewProduct.price.toLocaleString('en-IN')}` : '₹0'} />
            <PreviewRow label="Stock" value={`${previewProduct.stockCount} item${previewProduct.stockCount === 1 ? '' : 's'}`} />
            <PreviewRow label="Sizes" value={previewProduct.sizes.join(', ') || 'Sizes'} />
            <PreviewRow label="Fabric" value={previewProduct.fabric || 'Fabric'} />
            <PreviewRow label="Colors" value={previewProduct.color || 'Add a color'} />
            <PreviewRow
              label="Images"
              value={`${product.variants.reduce(
                (total, variant) => total + variant.existingImages.length + variant.imageFiles.length,
                0,
              )} across ${product.variants.length} color${product.variants.length === 1 ? '' : 's'}`}
            />
          </div>
        </aside>
      </div>

      <section className="mt-8 rounded-md border border-primary-100 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-store-dark">Catalogue Products</h2>
            <p className="mt-1 text-sm leading-6 text-store-dark/65">
              Select a product to edit it, or remove it from the catalogue.
            </p>
          </div>
          <button
            type="button"
            onClick={loadAdminProducts}
            disabled={productsLoading}
            className="btn-secondary self-start px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={17} className={productsLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {productsLoading && (
            <div className="rounded-md bg-primary-50 p-4 text-sm font-medium text-store-dark/65">
              Loading products...
            </div>
          )}

          {!productsLoading && adminProducts.length === 0 && (
            <div className="rounded-md bg-primary-50 p-4 text-sm font-medium text-store-dark/65">
              No products found yet.
            </div>
          )}

          {!productsLoading && adminProducts.map((item) => (
            <div
              key={item.id || item.slug}
              className={`flex flex-col gap-4 rounded-md border p-4 md:flex-row md:items-center md:justify-between ${
                editingProduct?.id === item.id ? 'border-primary-500 bg-primary-50' : 'border-primary-100'
              }`}
            >
              <div className="flex min-w-0 gap-4">
                <img
                  src={item.images?.[0]}
                  alt={item.name}
                  className="h-20 w-20 flex-none rounded-md border border-primary-100 object-cover"
                />
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-store-dark">{item.name}</h3>
                  <p className="mt-1 text-sm text-store-dark/65">
                    {item.category || 'Uncategorised'} · ₹{Number(item.price || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="mt-1 text-xs font-medium text-store-dark/50">
                    {item.stockCount ?? 0} in stock · {item.id}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                <button type="button" onClick={() => startEditingProduct(item)} className="btn-secondary px-4 py-2">
                  <Pencil size={17} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-red-100 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === item.id ? <Loader2 size={17} className="animate-spin" /> : <Trash2 size={17} />}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children, full = false }) {
  return (
    <label className={`block ${full ? 'md:col-span-2' : ''}`}>
      <span className="text-sm font-semibold text-store-dark">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function PreviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-primary-100 pb-3">
      <span className="font-semibold text-store-dark">{label}</span>
      <span className="text-right text-store-dark/65">{value}</span>
    </div>
  );
}
