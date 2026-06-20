import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildWhatsAppURL, normalizeWhatsAppNumber } from '../../utils/whatsapp';

const initialForm = {
  name: '',
  phone: '',
  address: '',
  city: '',
  pincode: '',
  notes: '',
};

export default function OrderForm({ orderItems, orderTotal, onOrderComplete, emptyMessage = 'Add men\'s or kids\' wear items to your cart before placing an order.' }) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const whatsappNumber = normalizeWhatsAppNumber(import.meta.env.VITE_WHATSAPP_NUMBER);

  const disabled = useMemo(() => orderItems.length === 0 || !whatsappNumber, [orderItems.length, whatsappNumber]);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = 'Full name is required.';
    if (!/^\d{10}$/.test(formData.phone.trim())) nextErrors.phone = 'Enter a valid 10 digit phone number.';
    if (!formData.address.trim()) nextErrors.address = 'Address is required.';
    if (!formData.city.trim()) nextErrors.city = 'City is required.';
    if (!formData.pincode.trim()) nextErrors.pincode = 'Pincode is required.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate() || disabled) return;

    const url = buildWhatsAppURL(whatsappNumber, orderItems, orderTotal, formData);
    onOrderComplete();
    window.location.href = url;
  };

  if (orderItems.length === 0) {
    return (
      <div className="rounded-md border border-primary-100 bg-white p-8 text-center shadow-sm">
        <h2 className="text-3xl font-semibold">Your cart is empty</h2>
        <p className="mt-3 text-sm text-store-dark/65">{emptyMessage}</p>
        <button type="button" onClick={() => navigate('/products')} className="btn-primary mt-6">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-primary-100 bg-white p-5 shadow-sm md:p-7">
      {!whatsappNumber && (
        <div className="mb-5 rounded-md bg-primary-50 p-4 text-sm font-medium text-primary-700">
          Add VITE_WHATSAPP_NUMBER to your environment before taking orders.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full Name" error={errors.name}>
          <input value={formData.name} onChange={(e) => updateField('name', e.target.value)} className="form-input" />
        </Field>
        <Field label="Phone Number" error={errors.phone}>
          <input
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="form-input"
            inputMode="numeric"
          />
        </Field>
        <Field label="Address" error={errors.address} full>
          <textarea
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            rows={4}
            className="form-input resize-none"
          />
        </Field>
        <Field label="City" error={errors.city}>
          <input value={formData.city} onChange={(e) => updateField('city', e.target.value)} className="form-input" />
        </Field>
        <Field label="Pincode" error={errors.pincode}>
          <input
            value={formData.pincode}
            onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="form-input"
            inputMode="numeric"
          />
        </Field>
        <Field label="Notes / Special Instructions" full>
          <textarea
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={3}
            className="form-input resize-none"
          />
        </Field>
      </div>
      <button type="submit" disabled={disabled} className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:bg-store-dark/25">
        Send Order on WhatsApp
      </button>
    </form>
  );
}

function Field({ label, error, children, full = false }) {
  return (
    <label className={`block ${full ? 'md:col-span-2' : ''}`}>
      <span className="text-sm font-semibold text-store-dark">{label}</span>
      <div className="mt-2">{children}</div>
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}
