import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Mahammad Rafi',
    text: 'Shop lo mens wear collection chala bagundi. Shirt quality, fitting rendu super ga unnayi, price kuda reasonable.',
  },
  {
    name: 'Ravi Kumar',
    text: 'Good collection for daily wear. The staff confirmed size and stock quickly on WhatsApp, and the product quality was worth the price.',
  },
  {
    name: 'Fayaz',
    text: 'Kurta and pant material chala comfortable ga undi. Eid ki teesukunna dress andariki nachindi.',
  },
  {
    name: 'Shreyansh',
    text: 'Bought kids wear from here and the size was perfect. The clothes are comfortable, neat, and good for regular use.',
  },
];

export default function Testimonials() {
  return (
    <motion.section
      className="container-page py-14"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={{
        hidden: { opacity: 0, y: 26 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: 'easeOut', staggerChildren: 0.08 },
        },
      }}
    >
      <motion.h2 variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="text-center text-4xl font-semibold text-store-dark">
        Customer Reviews
      </motion.h2>
      <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((testimonial) => (
          <motion.article
            key={testimonial.name}
            variants={{
              hidden: { opacity: 0, y: 22, scale: 0.98 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            whileHover={{ y: -6 }}
            className="rounded-md border border-primary-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-soft"
          >
            <div className="flex gap-1 text-gold-500">
              {Array.from({ length: 5 }).map((_, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.75 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  viewport={{ once: true }}
                >
                  <Star size={17} fill="currentColor" />
                </motion.span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-store-dark/70">“{testimonial.text}”</p>
            <h3 className="mt-5 text-lg font-semibold text-store-dark">{testimonial.name}</h3>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}
