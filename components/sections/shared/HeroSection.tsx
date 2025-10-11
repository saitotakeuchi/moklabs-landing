'use client';

import Link from "next/link";
import { motion } from "framer-motion";

interface HeroButton {
  text: string;
  url: string;
  variant: 'primary' | 'secondary';
}

interface HeroProps {
  content: {
    title: string;
    buttons?: HeroButton[];
    image: string;
    imageAlt: string;
  };
}

const Hero = ({ content }: HeroProps) => {
  return (
    <section
      id="inicio"
      className="py-12 md:py-24 px-4 relative"
      style={{
        backgroundImage: `
          linear-gradient(to right, #EAFF8F 1px, transparent 1px),
          linear-gradient(to bottom, #EAFF8F 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      <div className="max-w-[1184px] mx-auto">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
          {/* Text Content - Left Side */}
          <div className="flex-1 flex flex-col gap-6 md:gap-16 items-start">
            {/* Title and Subtitle */}
            <div className="flex flex-col gap-6">
              <h1 className="text-[32px] sm:text-[48px] md:text-[60px] lg:text-[72px] font-bold text-mok-blue leading-[1.2] text-left">
                {content.title}
              </h1>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full sm:w-auto">
              {content.buttons?.map((button, index) => {
                const isExternal = button.url.startsWith('http') || button.url.startsWith('mailto:');
                const buttonClasses = `
                  px-6 py-2 rounded-[24px] text-[16px] font-bold leading-[1.2] text-center whitespace-nowrap
                  ${
                    button.variant === "primary"
                      ? "bg-mok-blue text-white"
                      : "bg-white text-mok-blue border-2 border-mok-blue"
                  }
                  hover:opacity-90 transition-opacity
                `;

                return isExternal ? (
                  <a
                    key={index}
                    href={button.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses}
                  >
                    {button.text}
                  </a>
                ) : (
                  <Link
                    key={index}
                    href={button.url}
                    className={buttonClasses}
                  >
                    {button.text}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Illustration - Right Side */}
          <div className="flex-1 flex justify-center md:justify-end">
            <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[639px] lg:h-[639px]">
              {/* Green circular backdrop */}
              <div className="absolute left-[7%] top-[7%] w-[86%] h-[86%] rounded-full bg-mok-green" />

              {/* Dotted border animation */}
              <motion.div
                className="absolute inset-0 rounded-full border-[8px] sm:border-[10px] md:border-[12px] border-dashed border-mok-green"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 60,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Character Illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={content.image}
                  alt={content.imageAlt}
                  className="w-auto h-auto max-w-[90%] max-h-[90%] object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
