import { Mail, MapPin, Phone } from 'lucide-react';
import WhatsAppIcon from '../components/ui/WhatsAppIcon.jsx';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';

export default function Contact() {
  const number = normalizeWhatsAppNumber(import.meta.env.VITE_WHATSAPP_NUMBER || '9505701786');

  return (
    <div className="container-page py-12">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-semibold text-store-dark">Contact</h1>
        <p className="mt-4 text-sm leading-7 text-store-dark/70">
          Questions about size, colour, stock, delivery, or availability?
          Reach out and the store team can help before you order.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <ContactCard
          icon={WhatsAppIcon}
          title="WhatsApp"
          text="+91 95057 01786"
          href={`https://wa.me/${number}`}
        />

        <ContactCard
          icon={Phone}
          title="Phone"
          text="+91 95057 01786"
          href="tel:+919505701786"
        />

        <ContactCard
          icon={Mail}
          title="Email"
          text="siddiq.kolimi@gmail.com"
          href="mailto:siddiq.kolimi@gmail.com"
        />
      </div>

      <div className="mt-8 rounded-md border border-primary-100 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary-100 p-3 text-primary-700">
            <MapPin size={22} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-store-dark">
              India-wide delivery support
            </h2>

            <p className="mt-2 text-sm leading-7 text-store-dark/65">
              Delivery and availability are confirmed directly over WhatsApp
              after the order message is generated.
            </p>
          </div>
          <div>
  <h2 className="text-2xl font-semibold text-store-dark">
    Shop Address
  </h2>

  <p className="mt-2 text-sm leading-7 text-store-dark/65">
    RTC Bus Stand Road, Opposite to Sri Rama Cool Drinks,
    Prasad Complex, koilakuntla,
    Nandyal District, Andhra Pradesh - 518134.
  </p>

  <p className="mt-3 text-sm leading-7 text-store-dark/65">
    Delivery and availability are confirmed directly over WhatsApp
    after the order message is generated.
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

      <h2 className="mt-4 text-2xl font-semibold text-store-dark">
        {title}
      </h2>

      <p className="mt-2 text-sm text-store-dark/65">{text}</p>
    </div>
  );

  if (!href) return content;

  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
    >
      {content}
    </a>
  );
}
