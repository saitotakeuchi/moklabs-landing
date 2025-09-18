import { motion } from "framer-motion";
import { Accordion } from "../ui";

const faqItems = [
  {
    question: "O que é o PNLD digital?",
    answer:
      "É o edital que exige versões digitais dos livros, não só impressos. Precisam ser acessíveis e seguir padrões técnicos rigorosos estabelecidos pelo MEC.",
  },
  {
    question: "Quanto tempo leva para adaptar?",
    answer:
      "O prazo varia conforme a complexidade do material, mas em média levamos de 2 a 4 semanas para entregar um livro completamente adaptado e testado para conformidade com o PNLD.",
  },
  {
    question: "E se meus arquivos não estiverem prontos?",
    answer:
      "Não tem problema! Trabalhamos com arquivos em diversos formatos e estágios. Podemos partir de PDFs, arquivos do InDesign, Word ou até mesmo versões impressas que precisam ser digitalizadas.",
  },
  {
    question: "O que acontece se o material não estiver conforme?",
    answer:
      "Garantimos que todos os materiais saiam 100% conformes com o edital. Fazemos testes rigorosos de acessibilidade e revisões técnicas. Se algo não estiver adequado, corrigimos sem custo adicional.",
  },
  {
    question: "Por que confiar na Mok Labs?",
    answer:
      "Somos especialistas em PNLD digital há anos, conhecemos todos os requisitos técnicos e já ajudamos dezenas de editoras a aprovarem seus materiais. Oferecemos garantia total de conformidade.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="bg-white py-24">
      <div className="max-w-[1184px] mx-auto px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-mok-blue text-center text-[32px] font-bold leading-[1.2]">
            Perguntas frequentes
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Accordion items={faqItems} />
        </motion.div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-mok-blue text-[16px] mb-4">
            Não encontrou sua resposta?
          </p>
          <a
            href="#contato"
            className="inline-flex items-center justify-center gap-2 text-mok-blue text-[16px] font-semibold transition-colors hover:text-mok-blue/80"
          >
            Entre em contato conosco
            <svg
              className="w-4 h-4"
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
