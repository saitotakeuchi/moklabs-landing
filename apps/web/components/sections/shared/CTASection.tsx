import { WhatsAppLink } from "@/components/common";

interface CTASectionProps {
  text: string;
  buttonText: string;
  whatsapp: {
    message: string;
    placement: string;
  };
}

const CTASection = ({ text, buttonText, whatsapp }: CTASectionProps) => {
  return (
    <section className="bg-mok-green py-8">
      <div className="max-w-[1184px] mx-auto px-8 flex flex-col sm:flex-row gap-6 sm:gap-16 items-center justify-center">
        <p className="text-mok-blue text-center sm:text-left text-[16px] font-bold leading-[1.2]">
          {text}
        </p>
        <WhatsAppLink
          message={whatsapp.message}
          placement={whatsapp.placement}
          className="inline-flex h-8 items-center justify-center gap-2 rounded-full bg-mok-blue px-6 text-white text-[16px] font-semibold transition-colors hover:bg-mok-blue/90 whitespace-nowrap"
        >
          {buttonText}
        </WhatsAppLink>
      </div>
    </section>
  );
};

export default CTASection;
