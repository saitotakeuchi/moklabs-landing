'use client';

import { motion } from 'framer-motion';
import { ContactForm } from '@/components/forms';

const Contact = () => {
  return (
    <section id="contato" className="py-12 sm:py-24 bg-[#cbff63]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-32">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
          {/* Left Content */}
          <motion.div
            className="flex-1 flex flex-col gap-4 sm:gap-6 text-[#0013ff]"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-[24px] sm:text-[32px] font-bold leading-[1.2]">
              Fale conosco
            </h2>
            <p className="text-sm sm:text-base leading-[1.4]">
              Use o formulário abaixo para pedir orçamentos, tirar dúvidas e/ou bater um papo!
            </p>
          </motion.div>

          {/* Right Content - Form */}
          <motion.div
            className="w-full lg:w-[512px] lg:shrink-0"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
