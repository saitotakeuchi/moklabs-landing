import { Whatsapp } from "iconoir-react";

interface HowWorksStep {
  title: string;
  description: string;
}

interface HowWorksPnldProps {
  content: {
    title: string;
    steps: HowWorksStep[];
    cta: {
      text: string;
      button: {
        text: string;
        url: string;
      };
    };
  };
}

const HowWorksPnld = ({ content }: HowWorksPnldProps) => {
  return (
    <>
      <section className="bg-mok-green py-12 sm:py-24">
        <div className="max-w-[1184px] mx-auto px-4 sm:px-8 flex flex-col items-center">
          <h2 className="text-mok-blue text-center text-[24px] sm:text-[32px] font-bold leading-[1.2] mb-8 sm:mb-16">
            {content.title}
          </h2>
          <div className="flex flex-col gap-6 sm:gap-10 items-center lg:flex-row lg:justify-center">
            {content.steps.map(({ title, description }) => (
              <div
                key={title}
                className="w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] rounded-full bg-white flex flex-col items-center justify-center text-center px-4 sm:px-6"
              >
                <h3 className="text-mok-blue text-[16px] sm:text-[18px] md:text-[20px] font-bold leading-[1.2]">
                  {title}
                </h3>
                <p className="text-[12px] sm:text-[14px] text-black leading-[1.4] mt-2 sm:mt-3">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-3 sm:py-4 flex">
        <div className="max-w-[1184px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center">
          <p className="text-mok-blue text-[14px] sm:text-[16px] font-bold">
            {content.cta.text}
          </p>
          <a
            href={content.cta.button.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 sm:h-8 items-center gap-2 rounded-full bg-mok-blue px-4 sm:px-6 text-white text-[14px] sm:text-[16px] font-semibold transition-colors hover:bg-mok-blue/90"
          >
            <Whatsapp className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            <span>{content.cta.button.text}</span>
          </a>
        </div>
      </section>
    </>
  );
};

export default HowWorksPnld;

