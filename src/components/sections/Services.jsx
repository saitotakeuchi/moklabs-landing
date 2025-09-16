const Services = () => {
  return (
    <section
      className="py-24 px-0 relative bg-white"
      style={{
        backgroundImage: `
          linear-gradient(to right, #EAFF8F 1px, transparent 1px),
          linear-gradient(to bottom, #EAFF8F 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      <div className="max-w-[1184px] mx-auto px-8 relative">
        {/* Main Content Container */}
        <div className="flex flex-col gap-16 items-center justify-center">
          {/* Title */}
          <div className="w-full text-center">
            <h2 className="text-[32px] font-bold text-[#0013FF] leading-[1.2]">
              O que fazemos
            </h2>
          </div>

          {/* Services List */}
          <div className="flex flex-col gap-10 items-center w-full">
            <div className="text-[24px] font-bold text-[#0013FF] text-center leading-[1.2]">
              LIVROS DIGITAIS
            </div>
            <div className="text-[24px] font-bold text-[#0013FF] text-center leading-[1.2]">
              PNLD DIGITAL
            </div>
            <div className="text-[24px] font-bold text-[#0013FF] text-center leading-[1.2]">
              ACESSIBILIDADE
            </div>
            <div className="text-[24px] font-bold text-[#0013FF] text-center leading-[1.2]">
              INTERATIVIDADE
            </div>
            <div className="text-[24px] font-bold text-[#0013FF] text-center leading-[1.2]">
              AUDIODESCRIÇÃO
            </div>
            <div className="text-[24px] font-bold text-[#0013FF] text-center leading-[1.2]">
              CONSULTORIA E SUPORTE
            </div>
          </div>
        </div>

        {/* Decorative Stars */}
        <div className="absolute left-[41px] top-[154px]">
          <div className="w-[111px] h-[111px] transform rotate-[15deg]">
            <img
              src="/services-green-star.svg"
              alt=""
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="absolute right-[-57px] top-[-74px]">
          <div className="w-[129px] h-[129px] transform rotate-[15deg]">
            <img
              src="/services-blue-star.svg"
              alt=""
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="absolute right-[-153px] top-[187px]">
          <div className="w-[240px] h-[240px] transform rotate-[15deg]">
            <img
              src="/services-half-star.svg"
              alt=""
              className="w-full h-full"
            />
          </div>
        </div>

        {/* 100% Conformidade Badge */}
        <div className="absolute left-[101px] top-[50px]">
          <div className="w-[240px] h-[240px] transform rotate-[-15deg] relative">
            <img src="/services-splash.svg" alt="" className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-[24px] font-bold text-center leading-[1.2] max-w-[191px]">
                100% DE CONFORMIDADE COM O PNLD
              </div>
            </div>
          </div>
        </div>

        {/* Before/After Comparison */}
        <div className="absolute right-[95px] bottom-[6px]">
          <div className="flex gap-4 items-center">
            {/* Sem Mok Labs */}
            <div className="flex flex-col gap-2 items-center w-[80px]">
              <div className="w-[57px] h-[57px] relative">
                <img
                  src="/sem-mok.svg"
                  alt="Sem Mok Labs"
                  className="w-full h-full"
                />
              </div>
              <div className="text-[12px] text-black text-center leading-[1.4]">
                Sem Mok Labs
              </div>
            </div>

            {/* Arrow */}
            <div className="w-[30px] h-[22px] relative">
              <svg
                width="30"
                height="22"
                viewBox="0 0 30 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 11H28M28 11L18 1M28 11L18 21"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Com Mok Labs */}
            <div className="flex flex-col gap-2 items-center w-[80px]">
              <div className="w-[57px] h-[57px] relative">
                <img
                  src="/com-mok.svg"
                  alt="Com Mok Labs"
                  className="w-full h-full"
                />
              </div>
              <div className="text-[12px] text-black text-center leading-[1.4]">
                Com Mok Labs
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
