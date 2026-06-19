export const buildWhatsAppURL = (number, cartItems, total, formData) => {
  const itemLines = cartItems
    .map((i) => {
      const sizeText = i.size ? ` | Size: ${i.size}` : '';
      return `• ${i.name}${sizeText} x${i.qty} — ₹${(i.price * i.qty).toLocaleString('en-IN')}`;
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

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};
