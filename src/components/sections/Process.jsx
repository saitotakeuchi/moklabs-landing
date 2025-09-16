import { motion } from 'framer-motion';

const Process = () => {
  const steps = [
    {
      title: "Você envia os arquivos",
      description: "Só precisamos dos originais.",
      icon: "📄"
    },
    {
      title: "Adaptamos ao edital",
      description: "Formatação, digitalização e testes de acessibilidade.",
      icon: "⚙️"
    },
    {
      title: "Você recebe tudo pronto",
      description: "Arquivos revisados e prontos para submissão.",
      icon: "✅"
    }
  ];

  return (
    <section id="processo" className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Como funciona?
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Step number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
                {index + 1}
              </div>

              {/* Card */}
              <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-sm border border-gray-100 h-full">
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
                  <span className="text-3xl">{step.icon}</span>
                </div>

                <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-4 text-center leading-tight">
                  {step.title}
                </h3>

                <p className="text-gray-600 text-center leading-relaxed">
                  → {step.description}
                </p>
              </div>

              {/* Connector arrow */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-0">
                  <svg
                    className="w-12 h-6 text-blue-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <span className="text-lg text-gray-600">Pronto para começar?</span>
            <a
              href="#contato"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Vamos conversar!
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Process;