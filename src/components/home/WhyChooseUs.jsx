import { motion } from 'framer-motion';
import { RotateCcw, ShieldCheck, Sparkles, Truck } from 'lucide-react';

const reasons = [
  { title: 'Premium Quality', text: 'Handpicked clothing selected for comfort, fit, and finish.', icon: Sparkles },
  { title: 'Fast Delivery', text: 'Quick dispatch coordination after WhatsApp order confirmation.', icon: Truck },
  { title: 'Trusted Selection', text: "Men's and kids' essentials sourced with care for daily use.", icon: ShieldCheck },
  { title: 'Easy Returns', text: 'Clear support over WhatsApp for exchanges and returns.', icon: RotateCcw },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white py-14">
      <motion.div
        className="container-page"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.22 }}
        variants={{
          hidden: { opacity: 0, y: 24 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.55, ease: 'easeOut', staggerChildren: 0.09 },
          },
        }}
      >
        <motion.h2 variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="text-center text-4xl font-semibold text-store-dark">
          Why Choose Us
        </motion.h2>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                variants={{
                  hidden: { opacity: 0, y: 22, scale: 0.98 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                whileHover={{ y: -6 }}
                className="rounded-md border border-primary-100 bg-store-cream p-5 transition-shadow hover:shadow-soft"
              >
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700"
                  whileHover={{ rotate: -8, scale: 1.08 }}
                >
                  <Icon size={22} />
                </motion.div>
                <h3 className="mt-4 text-xl font-semibold text-store-dark">{reason.title}</h3>
                <p className="mt-2 text-sm leading-6 text-store-dark/65">{reason.text}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
