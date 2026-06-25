export const STORE_WHATSAPP_NUMBER = '919505701786';

export const normalizeWhatsAppNumber = (number, fallback = STORE_WHATSAPP_NUMBER) => {
  const digits = String(number || '').replace(/\D/g, '');

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }

  return fallback;
};

export const buildWhatsAppURL = (number, cartItems, total, formData) => {
  const whatsappNumber = normalizeWhatsAppNumber(number);
  const itemLines = cartItems
    .map((i) => {
      const sizeText = i.size ? ` | Size: ${i.size}` : '';
      const colorText = i.color ? ` | Color: ${i.color}` : '';
      return `• ${i.name}${colorText}${sizeText} x${i.qty} — ₹${(i.price * i.qty).toLocaleString('en-IN')}`;
    })
    .join('\n');

  const storeName = import.meta.env.VITE_STORE_NAME || 'New Khwaja Textiles & Readymades';
  const notes = formData.notes?.trim() || 'None';
  const message = `🛍️ New Order - ${storeName}
👤 Customer: ${formData.name}
📞 Phone: ${formData.phone}
📍 Address: ${formData.address}, ${formData.city} - ${formData.pincode}
🛒 *Order Items:*
${itemLines}
💰 Total: ₹${total.toLocaleString('en-IN')}
📝 Notes: ${notes}`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};
