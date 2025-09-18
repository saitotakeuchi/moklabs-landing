import { Whatsapp } from "iconoir-react";

const HowWorks = () => {
  const steps = [
    {
      title: "Você envia os arquivos",
      description: "→ Só precisamos dos originais.",
    },
    {
      title: "Adaptamos ao edital ",
      description: "→ Formatação, digitalização e testes de acessibilidade.",
    },
    {
      title: "Você recebe tudo pronto",
      description: "→ Arquivos revisados e prontos para inscrição.",
    },
  ];

  return (
    <>
      <section className="bg-mok-green py-24">
        <div className="max-w-[1184px] mx-auto px-8 flex flex-col items-center">
          <h2 className="text-mok-blue text-center text-[32px] font-bold leading-[1.2] mb-16">
            Como funciona?
          </h2>
          <div className="flex flex-col gap-10 items-center md:flex-row md:justify-center">
            {steps.map(({ title, description }) => (
              <div
                key={title}
                className="w-[320px] h-[320px] rounded-full bg-white flex flex-col items-center justify-center text-center px-6"
              >
                <h3 className="text-mok-blue text-[20px] font-bold leading-[1.2]">
                  {title}
                </h3>
                <p className="text-[14px] text-black leading-[1.4] mt-3">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-4 flex">
        <div className="max-w-[1184px] mx-auto px-8 flex flex-row items-center gap-6 text-center">
          <p className="text-mok-blue text-[16px] font-bold">
            Pronto para comecar?
          </p>
          <a
            href="https://wa.me/5541992694663"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-2 rounded-full bg-mok-blue px-6 text-white text-[16px] font-semibold transition-colors hover:bg-mok-blue/90"
          >
            <Whatsapp className="h-5 w-5" aria-hidden="true" />
            <span>Vamos conversar!</span>
          </a>
        </div>
      </section>
    </>
  );
};

export default HowWorks;
