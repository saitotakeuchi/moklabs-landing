import { motion } from 'framer-motion';
import { Accordion } from '../ui';

const FAQ = () => {
  const faqItems = [
    {
      question: "O que é o PNLD digital?",
      answer: "É o edital que exige versões digitais dos livros, não só impressos. Precisam ser acessíveis e seguir padrões técnicos rigorosos estabelecidos pelo MEC."
    },
    {
      question: "Quanto tempo leva para adaptar?",
      answer: "O prazo varia conforme a complexidade do material, mas em média levamos de 2 a 4 semanas para entregar um livro completamente adaptado e testado para conformidade com o PNLD."
    },
    {
      question: "E se meus arquivos não estiverem prontos?",
      answer: "Não tem problema! Trabalhamos com arquivos em diversos formatos e estágios. Podemos partir de PDFs, arquivos do InDesign, Word, ou até mesmo versões impressas que precisam ser digitalizadas."
    },
    {
      question: "O que acontece se o material não estiver conforme?",
      answer: "Garantimos que todos os materiais saiam 100% conformes com o edital. Fazemos testes rigorosos de acessibilidade e revisões técnicas. Se algo não estiver adequado, corrigimos sem custo adicional."
    },
    {
      question: "Por que confiar no Mok Labs?",
      answer: "Somos especialistas em PNLD digital há anos, conhecemos todos os requisitos técnicos e já ajudamos dezenas de editoras a aprovarem seus materiais. Oferecemos garantia total de conformidade."
    }
  ];

  return (
    <section id="faq" className="py-16 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Perguntas frequentes
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion items={faqItems} />
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-gray-600 mb-6">
            Não encontrou sua resposta?
          </p>
          <a
            href="#contato"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
          >
            Entre em contato conosco
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;