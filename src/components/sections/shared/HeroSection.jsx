import { motion } from "framer-motion";

const HeroMain = ({ content }) => {
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
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-end">
          {/* Text Content - Left Side */}
          <div className="flex-1 flex flex-col gap-6 md:gap-16 items-start pb-12 md:pb-24">
            <h1 className="text-[32px] sm:text-[40px] md:text-[52px] lg:text-[60px] font-bold text-mok-blue leading-[1.2] text-left">
              {content.title}
            </h1>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full sm:w-auto">
              {content.buttons?.map((button, index) => (
                <a
                  key={index}
                  href={button.url}
                  className={`
                    px-6 py-2 rounded-[24px] text-[16px] font-bold leading-[1.2] text-center whitespace-nowrap
                    ${
                      button.variant === "primary"
                        ? "bg-mok-blue text-white"
                        : "bg-white text-mok-blue border-2 border-mok-blue"
                    }
                    hover:opacity-90 transition-opacity
                  `}
                >
                  {button.text}
                </a>
              ))}
            </div>
          </div>

          {/* Illustration - Right Side - Bottom Aligned */}
          <div className="flex-1 flex justify-center md:justify-end relative">
            {/* Character Illustration - Bottom aligned, no wrapper height constraint */}
            <img
              src={content.image}
              alt={content.imageAlt}
              className="relative w-[280px] sm:w-[350px] md:w-[420px] lg:w-[500px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroMain;
