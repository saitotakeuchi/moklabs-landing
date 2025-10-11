interface ProblemStatementMainProps {
  content: {
    title: string;
    problems: string[];
  };
}

const ProblemStatementMain = ({ content }: ProblemStatementMainProps) => {
  return (
    <section className="bg-mok-blue py-12 sm:py-24 px-4 sm:px-8 lg:px-32">
      <div className="flex flex-col gap-8 sm:gap-16 items-center w-full max-w-[1184px] mx-auto">
        {/* Title */}
        <div className="w-full text-center">
          <h2 className="text-[24px] sm:text-[32px] font-bold text-mok-green leading-[1.2]">
            {content.title}
          </h2>
        </div>

        {/* Problem Cards */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 items-stretch w-full">
          {content.problems.map((problem, index) => (
            <div key={index} className="flex-1 bg-mok-green rounded-[16px] sm:rounded-[24px] px-4 sm:px-6 py-8 sm:py-12 min-h-[140px] sm:h-[170px] flex items-center justify-center">
              <p className="text-[14px] sm:text-[16px] text-mok-blue text-center leading-[1.4]">
                {problem}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemStatementMain;
