import { motion } from 'framer-motion';

const Solutions = () => {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Solution Headlines */}
        <div className="space-y-16 mb-24">
          <motion.div
            className="text-left"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
              <span className="text-blue-600">SOLUÇÕES DIGITAIS</span>{' '}
              SOB MEDIDA.
            </h2>
          </motion.div>

          <motion.div
            className="text-right"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
              SEM RETRABALHO.{' '}
              <span className="text-green-600">SEM STRESS.</span>
            </h2>
          </motion.div>
        </div>

        {/* Our Approach Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-16">
            Nosso jeito
          </h3>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: "/solution-icon-1.svg",
                title: "Não acreditamos em soluções engessadas.",
                description: "Cada projeto é único e merece atenção personalizada."
              },
              {
                icon: "/solution-icon-2.svg",
                title: "Entregamos rápido e com preços que cabem no seu orçamento.",
                description: "Eficiência sem comprometer a qualidade."
              },
              {
                icon: "/solution-icon-3.svg",
                title: "Garantimos atendimento humano e com agilidade.",
                description: "Suporte dedicado em todas as etapas do processo."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                {/* Solution Icon */}
                <div className="w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="w-32 h-32"
                  />
                </div>

                <h4 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-4 leading-tight">
                  {item.title}
                </h4>

                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Solutions;