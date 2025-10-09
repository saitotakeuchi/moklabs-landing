import { motion } from "framer-motion";

const HeroPnld = ({ content }) => {
  return (
    <section id="inicio" className="bg-mok-blue py-12 sm:py-24">
      <div className="w-full flex justify-center px-4">
        <div className="flex flex-col items-center text-center">
          {/* Text Content - Vertical Layout */}
          <div className="mb-8 sm:mb-16">
            <h1 className="text-[32px] max-w-5xl sm:text-[60px] md:text-[80px] lg:text-[98px] font-bold text-white leading-tight mb-4 sm:mb-6">
              {content.title}
            </h1>

            <p className="text-[16px] sm:text-[20px] md:text-[24px] font-bold text-mok-green leading-[1.2] max-w-xs sm:max-w-2xl md:max-w-4xl text-center mx-auto px-2">
              {content.subtitle}
            </p>
          </div>

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
                <img
                  src={content.image}
                  alt={content.imageAlt}
                  className="w-auto h-auto max-w-[80%] max-h-[80%]"
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
