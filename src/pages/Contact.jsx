import { Mail, MapPin, Phone } from 'lucide-react';
import WhatsAppIcon from '../components/ui/WhatsAppIcon.jsx';

export default function Contact() {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER;

  return (
    <div className="container-page py-12">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-semibold text-store-dark">Contact</h1>
        <p className="mt-4 text-sm leading-7 text-store-dark/70">
          Questions about size, colour, stock, delivery, or availability? Reach out and the store team can help before you order.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <ContactCard icon={WhatsAppIcon} title="WhatsApp" text={number || 'Add number in .env'} href={number ? `https://wa.me/${number}` : undefined} />
        <ContactCard icon={Phone} title="Phone" text={number || '91XXXXXXXXXX'} href={number ? `tel:+${number}` : undefined} />
        <ContactCard icon={Mail} title="Email" text="orders@khwajastore.in" href="mailto:orders@khwajastore.in" />
      </div>

      <div className="mt-8 rounded-md border border-primary-100 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary-100 p-3 text-primary-700">
            <MapPin size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-store-dark">India-wide delivery support</h2>
            <p className="mt-2 text-sm leading-7 text-store-dark/65">
              Delivery and availability are confirmed directly over WhatsApp after the order message is generated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon: Icon, title, text, href }) {
  const content = (
    <div className="rounded-md border border-primary-100 bg-white p-6 shadow-sm transition hover:shadow-soft">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
        <Icon size={22} />
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-store-dark">{title}</h2>
      <p className="mt-2 text-sm text-store-dark/65">{text}</p>
    </div>
  );

  if (!href) return content;

  return (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
      {content}
    </a>
  );
}
