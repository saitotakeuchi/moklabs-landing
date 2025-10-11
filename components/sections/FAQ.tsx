"use client";

import { motion } from "framer-motion";
import { Accordion } from "@/components/ui";

interface FAQContent {
  title: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
}

interface FAQProps {
  content: FAQContent;
}

const FAQ = ({ content }: FAQProps) => {
  return (
    <section id="faq" className="bg-white py-12 sm:py-24">
      <div className="max-w-[1184px] mx-auto px-4 sm:px-8">
        <motion.div
          className="text-center mb-8 sm:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-mok-blue text-center text-[24px] sm:text-[32px] font-bold leading-[1.2]">
            {content.title}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Accordion items={content.items} />
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
