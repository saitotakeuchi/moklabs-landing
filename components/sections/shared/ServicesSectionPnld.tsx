"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface DecorativeImage {
  src: string;
  alt: string;
}

interface ServicesPnldProps {
  content: {
    title: string;
    items: string[];
    splashImage: string;
    splashText: string;
    decorativeImages: DecorativeImage[];
  };
}

const ServicesPnld = ({ content }: ServicesPnldProps) => {
  const splashRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: splashRef,
    offset: ["start end", "center center"],
  });

  const splashRotate = useTransform(scrollYProgress, [0, 1], [-90, 20]);

  return (
    <section
      id="servicos"
      className="py-6 md:py-24 px-0 relative bg-white"
      style={{
        backgroundImage: `
          linear-gradient(to right, #EAFF8F 1px, transparent 1px),
          linear-gradient(to bottom, #EAFF8F 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      <div className="hidden md:block absolute right-[16px] top-[32px]">
        <div className="w-[100px] h-[100px]">
          <img
            src={content.decorativeImages[0].src}
            alt={content.decorativeImages[0].alt}
            className="w-full h-full"
          />
        </div>
      </div>

      <div className="hidden md:block absolute right-[0] top-[196px]">
        <div className="w-[200px] h-[200px]">
          <img
            src={content.decorativeImages[1].src}
            alt={content.decorativeImages[1].alt}
            className="w-full h-full"
          />
        </div>
      </div>

      <div className="max-w-[1184px] mx-auto px-8 relative">
        {/* Desktop Layout */}
        <div className="hidden md:flex flex-col gap-16 items-center justify-center">
          {/* Title */}
          <div className="w-full text-center">
            <h2 className="text-[32px] font-bold text-mok-blue leading-[1.2]">
              {content.title}
            </h2>
          </div>

          {/* Services List */}
          <div className="flex flex-col gap-10 items-center w-full">
            {content.items.map((item, index) => (
              <div
                key={index}
                className="text-[24px] font-bold text-mok-blue text-center leading-[1.2]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col gap-6 sm:gap-8 items-center px-4">
          {/* Mobile Conformidade Badge - At top */}
          <motion.div
            ref={splashRef}
            className="w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] relative"
            style={{ rotate: splashRotate }}
          >
            <img src={content.splashImage} alt="" className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-[10px] sm:text-[14px] font-bold text-center leading-[1.2] max-w-[90px] sm:max-w-[120px]">
                {content.splashText}
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <div className="w-full text-center">
            <h2 className="text-[24px] sm:text-[32px] font-bold text-mok-blue leading-[1.2]">
              {content.title}
            </h2>
          </div>

          {/* Services List */}
          <div className="flex flex-col gap-6 sm:gap-10 items-center w-full">
            {content.items.map((item, index) => (
              <div
                key={index}
                className="text-[18px] sm:text-[24px] font-bold text-mok-blue text-center leading-[1.2]"
              >
                {item}
              </div>
            ))}
          </div>

          {/* Mobile Before/After Comparison - At bottom */}
          <div className="flex gap-3 sm:gap-4 items-center">
            {/* Sem Mok Labs */}
            <div className="flex flex-col gap-1 sm:gap-2 items-center w-[50px] sm:w-[60px]">
              <div className="w-[32px] h-[32px] sm:w-[40px] sm:h-[40px] relative">
                <img
                  src="/sem-mok.svg"
                  alt="Sem Mok Labs"
                  className="w-full h-full"
                />
              </div>
              <div className="text-[8px] sm:text-[10px] text-black text-center leading-[1.4]">
                Sem Mok Labs
              </div>
            </div>

            {/* Arrow */}
            <div className="w-[20px] h-[15px] sm:w-[24px] sm:h-[18px] relative">
              <svg
                width="100%"
                height="100%"
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
            <div className="flex flex-col gap-1 sm:gap-2 items-center w-[50px] sm:w-[60px]">
              <div className="w-[32px] h-[32px] sm:w-[40px] sm:h-[40px] relative">
                <img
                  src="/com-mok.svg"
                  alt="Com Mok Labs"
                  className="w-full h-full"
                />
              </div>
              <div className="text-[8px] sm:text-[10px] text-black text-center leading-[1.4]">
                Com Mok Labs
              </div>
            </div>
          </div>
        </div>

        {/* 100% Conformidade Badge - Desktop only */}
        <div className="hidden md:block absolute left-[70px] top-[50px] z-10">
          <motion.div
            className="w-[180px] h-[180px] lg:w-[240px] lg:h-[240px] relative"
            style={{ rotate: splashRotate }}
          >
            <img src={content.splashImage} alt="" className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-[18px] lg:text-[24px] font-bold text-center leading-[1.2] max-w-[140px] lg:max-w-[191px]">
                {content.splashText}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative Stars - Full page width */}
        <div className="hidden md:block absolute left-[30px] top-[40px] z-0">
          <div className="w-[111px] h-[111px] transform rotate-[15deg]">
            <img
              src="/services-green-star.svg"
              alt=""
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Before/After Comparison - Desktop only */}
        <div className="hidden md:block absolute right-[35px] bottom-[6px]">
          <div className="flex gap-3 lg:gap-4 items-center">
            {/* Sem Mok Labs */}
            <div className="flex flex-col gap-1 lg:gap-2 items-center w-[60px] lg:w-[80px]">
              <div className="w-[42px] h-[42px] lg:w-[57px] lg:h-[57px] relative">
                <img
                  src="/sem-mok.svg"
                  alt="Sem Mok Labs"
                  className="w-full h-full"
                />
              </div>
              <div className="text-[10px] lg:text-[12px] text-black text-center leading-[1.4]">
                Sem Mok Labs
              </div>
            </div>

            {/* Arrow */}
            <div className="w-[24px] h-[18px] lg:w-[30px] lg:h-[22px] relative">
              <svg
                width="100%"
                height="100%"
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
            <div className="flex flex-col gap-1 lg:gap-2 items-center w-[60px] lg:w-[80px]">
              <div className="w-[42px] h-[42px] lg:w-[57px] lg:h-[57px] relative">
                <img
                  src="/com-mok.svg"
                  alt="Com Mok Labs"
                  className="w-full h-full"
                />
              </div>
              <div className="text-[10px] lg:text-[12px] text-black text-center leading-[1.4]">
                Com Mok Labs
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesPnld;
