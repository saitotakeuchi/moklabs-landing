const ProblemStatement = () => {
  return (
    <section className="bg-[#CBFF63] py-24 px-32">
      <div className="flex flex-col gap-16 items-center w-full">
        {/* Title */}
        <div className="w-full text-center">
          <h2 className="text-[32px] font-bold text-[#0013FF] leading-[1.2]">
            Sabemos como é difícil
          </h2>
        </div>

        {/* Problem Cards */}
        <div className="flex gap-12 items-center justify-start w-full">
          <div className="flex-1 bg-[#0013FF] rounded-[24px] px-6 py-12 h-[170px] flex items-center justify-center">
            <p className="text-[16px] text-white text-center leading-[1.4]">
              Os editais pedem livros digitais acessíveis, com interatividade e inúmeros requisitos técnicos. Não basta converter PDF, é muito mais do que isso.
            </p>
          </div>

          <div className="flex-1 bg-[#0013FF] rounded-[24px] px-6 py-12 h-[170px] flex items-center justify-center">
            <p className="text-[16px] text-white text-center leading-[1.4]">
              Prazos curtos, especificações confusas e muita dor de cabeça. Qualquer erro pode custar caro (e tempo é o que menos sobra).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemStatement;