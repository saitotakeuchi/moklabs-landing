"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { WhatsAppLink } from "@/components/common";

interface HeroButton {
  text: string;
  variant: "primary" | "secondary";
  url?: string;
  whatsapp?: {
    message: string;
    placement: string;
  };
}

interface HeroPnldProps {
  content: {
    title: string;
    subtitle: string;
    image: string;
    imageAlt: string;
    buttons?: HeroButton[];
  };
}

const HeroPnld = ({ content }: HeroPnldProps) => {
  return (
    <section id="inicio" className="bg-mok-blue py-12 sm:py-24">
      <div className="w-full flex justify-center px-4">
        <div className="flex flex-col items-center text-center">
          {/* Text Content - Vertical Layout */}
          <div className="mb-8 sm:mb-16">
            <h1 className="text-[32px] max-w-5xl sm:text-[44px] md:text-[56px] lg:text-[64px] font-bold text-white leading-tight mb-4 sm:mb-6">
              {content.title}
            </h1>

            <p className="text-[16px] sm:text-[20px] md:text-[24px] font-bold text-mok-green leading-[1.2] max-w-xs sm:max-w-2xl md:max-w-4xl text-center mx-auto px-2">
              {content.subtitle}
            </p>
          </div>

          {/* CTA Buttons */}
          {content.buttons && content.buttons.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-8 sm:mb-16">
              {content.buttons.map((button, index) => {
                const buttonClasses = `
                  px-6 py-2 rounded-[24px] text-[16px] font-bold leading-[1.2] text-center whitespace-nowrap
                  ${
                    button.variant === "primary"
                      ? "bg-mok-green text-mok-blue"
                      : "bg-transparent text-white border-2 border-white"
                  }
                  hover:opacity-90 transition-opacity
                `;

                if (button.whatsapp) {
                  return (
                    <WhatsAppLink
                      key={index}
                      message={button.whatsapp.message}
                      placement={button.whatsapp.placement}
                      className={buttonClasses}
                    >
                      {button.text}
                    </WhatsAppLink>
                  );
                }

                const url = button.url ?? "#";
                const isExternal =
                  url.startsWith("http") || url.startsWith("mailto:");
                return isExternal ? (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses}
                  >
                    {button.text}
                  </a>
                ) : (
                  <Link key={index} href={url} className={buttonClasses}>
                    {button.text}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Animated Illustration - Below text with responsive margin */}
          <div className="flex justify-center">
            <div className="relative w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] md:w-[371px] md:h-[371px]">
              {/* Animated Dotted Border - responsive stroke */}
              <motion.div
                className="absolute inset-0 w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] md:w-[371px] md:h-[371px] rounded-full border-[6px] sm:border-[8px] md:border-[10px] border-dashed border-mok-green"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 60,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Green Circle */}
              <div className="absolute left-[18px] top-[18px] w-[214px] h-[214px] sm:left-[21px] sm:top-[21px] sm:w-[258px] sm:h-[258px] md:left-[26px] md:top-[26px] md:w-[321px] md:h-[321px] rounded-full bg-mok-green flex items-center justify-center">
                {/* Dynamic Image */}
                <Image
                  src={content.image}
                  alt={content.imageAlt}
                  width={300}
                  height={300}
                  className="w-auto h-auto max-w-[80%] max-h-[80%]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroPnld;
