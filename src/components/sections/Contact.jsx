import { motion } from 'framer-motion';
import { ContactForm } from '../forms';

const Contact = () => {
  return (
    <section id="contato" className="py-24 bg-[#cbff63]">
      <div className="max-w-7xl mx-auto px-32">
        <div className="flex gap-16 items-start">
          {/* Left Content */}
          <motion.div
            className="flex-1 flex flex-col gap-6 text-[#0013ff]"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-[32px] font-bold leading-[1.2]">
              Fale conosco
            </h2>
            <p className="text-base leading-[1.4]">
              Use o formulário ao lado para pedir orçamentos, tirar dúvidas e/ou bater um papo!
            </p>
          </motion.div>

          {/* Right Content - Form */}
          <motion.div
            className="w-[512px] shrink-0"
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