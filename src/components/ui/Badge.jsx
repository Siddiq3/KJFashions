export default function Badge({ children, tone = 'primary' }) {
  const tones = {
    primary: 'bg-primary-100 text-primary-700',
    gold: 'bg-gold-400/25 text-store-dark',
    dark: 'bg-store-dark text-white',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
