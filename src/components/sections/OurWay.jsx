const highlights = [
  {
    icon: "/our-way-01.jpg",
    title: "Não acreditamos em soluções engessadas.",
    description:
      "Cada projeto recebe um plano feito sob medida para o resultado que você precisa.",
  },
  {
    icon: "/our-way-02.jpg",
    title: "Entregamos rápido e com custos eficientes.",
    description:
      "Times enxutos, processos ágeis e comunicação clara para manter o orçamento no lugar.",
  },
  {
    icon: "/our-way-03.jpg",
    title: "Garantimos atendimento humano e ágil.",
    description:
      "Você fala com especialistas de verdade, sempre prontos para ajustar o que for preciso.",
  },
];

const OurWay = () => {
  return (
    <section className="bg-mok-blue py-24">
      <div className="max-w-[1184px] mx-auto px-8">
        <h2 className="text-white text-center text-[32px] font-bold leading-[1.2] mb-16">
          Nosso jeito
        </h2>

        <div className="grid gap-12 md:grid-cols-3 md:items-start">
          {highlights.map(({ icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center gap-6"
            >
              <img
                src={icon}
                alt={title}
                className="w-[168px] h-[168px] object-contain rounded-full"
              />
              <div className="flex flex-col gap-3">
                <h3 className="text-white text-[20px] font-bold leading-[1.3]">
                  {title}
                </h3>
                <p className="text-white/80 text-[14px] leading-[1.6]">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurWay;
