interface CTASectionProps {
  text: string;
  buttonText: string;
  buttonUrl: string;
}

const CTASection = ({ text, buttonText, buttonUrl }: CTASectionProps) => {
  return (
    <section className="bg-mok-green py-8">
      <div className="max-w-[1184px] mx-auto px-8 flex flex-col sm:flex-row gap-6 sm:gap-16 items-center justify-center">
        <p className="text-mok-blue text-center sm:text-left text-[16px] font-bold leading-[1.2]">
          {text}
        </p>
        <a
          href={buttonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center justify-center gap-2 rounded-full bg-mok-blue px-6 text-white text-[16px] font-semibold transition-colors hover:bg-mok-blue/90 whitespace-nowrap"
        >
          {buttonText}
        </a>
      </div>
    </section>
  );
};

export default CTASection;
