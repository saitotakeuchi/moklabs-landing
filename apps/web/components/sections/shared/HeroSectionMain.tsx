"use client";

import Link from "next/link";
import Image from "next/image";
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

interface HeroMainProps {
  content: {
    title: string;
    subtitle?: string;
    buttons?: HeroButton[];
    image: string;
    imageAlt: string;
  };
}

const HeroMain = ({ content }: HeroMainProps) => {
  return (
    <section
      id="inicio"
      className="pt-12 md:pt-24 px-4 relative overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(to right, #EAFF8F 1px, transparent 1px),
          linear-gradient(to bottom, #EAFF8F 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      <div className="max-w-[1184px] mx-auto">
        {/* Title - full width row */}
        <h1 className="text-[32px] sm:text-[44px] md:text-[56px] lg:text-[64px] font-bold text-mok-blue leading-[1.1] mb-8 md:mb-16 max-w-[1040px]">
          {content.title}
        </h1>

        {/* Subtitle + CTAs | Illustration - even split below the title */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-end">
          <div className="flex-1 flex flex-col gap-6 md:gap-8 items-start pb-12 md:pb-24">
            {content.subtitle && (
              <p className="text-lg sm:text-xl md:text-2xl text-mok-blue/80 leading-[1.4] max-w-xl">
                {content.subtitle}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full sm:w-auto">
              {content.buttons?.map((button, index) => {
                const buttonClasses = `
                  px-6 py-2 rounded-[24px] text-[16px] font-bold leading-[1.2] text-center whitespace-nowrap
                  ${
                    button.variant === "primary"
                      ? "bg-mok-blue text-white"
                      : "bg-white text-mok-blue border-2 border-mok-blue"
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
          </div>

          {/* Illustration - Right Side - Bottom Aligned */}
          <div className="flex-1 flex justify-center md:justify-end relative">
            <Image
              src={content.image}
              alt={content.imageAlt}
              width={500}
              height={500}
              className="relative w-[280px] sm:w-[350px] md:w-[420px] lg:w-[500px] h-auto object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroMain;
