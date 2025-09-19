const ProblemStatement = () => {
  return (
    <section className="bg-mok-green py-12 sm:py-24 px-4 sm:px-8 lg:px-32">
      <div className="flex flex-col gap-8 sm:gap-16 items-center w-full max-w-[1184px] mx-auto">
        {/* Title */}
        <div className="w-full text-center">
          <h2 className="text-[24px] sm:text-[32px] font-bold text-mok-blue leading-[1.2]">
            Sabemos como é difícil
          </h2>
        </div>

        {/* Problem Cards */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 items-stretch w-full">
          <div className="flex-1 bg-mok-blue rounded-[16px] sm:rounded-[24px] px-4 sm:px-6 py-8 sm:py-12 min-h-[140px] sm:h-[170px] flex items-center justify-center">
            <p className="text-[14px] sm:text-[16px] text-white text-center leading-[1.4]">
              Os editais pedem livros digitais acessíveis, com interatividade e inúmeros requisitos técnicos. Não basta converter PDF, é muito mais do que isso.
            </p>
          </div>

          <div className="flex-1 bg-mok-blue rounded-[16px] sm:rounded-[24px] px-4 sm:px-6 py-8 sm:py-12 min-h-[140px] sm:h-[170px] flex items-center justify-center">
            <p className="text-[14px] sm:text-[16px] text-white text-center leading-[1.4]">
              Prazos curtos, especificações confusas e muita dor de cabeça. Qualquer erro pode custar caro (e tempo é o que menos sobra).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemStatement;