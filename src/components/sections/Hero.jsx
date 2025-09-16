import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section id="inicio" className="bg-[#0013FF] py-24">
      <div className="w-full flex justify-center">
        <div className="flex flex-col items-center text-center">
          {/* Text Content - Vertical Layout */}
          <div className="mb-16">
            <h1 className="text-[98px] font-bold text-white leading-tight mb-6">
              PNLD digital sem complicação
            </h1>

            <p className="text-[24px] font-bold text-[#CBFF63] leading-[1.2] max-w-4xl text-center mx-auto">
              No Mok Labs transformamos seus materiais em versões digitais
              acessíveis e em conformidade com os editais do PNLD.
            </p>
          </div>

          {/* Animated Illustration - Below text with 64px margin */}
          <div className="flex justify-center">
            <div className="relative w-[371px] h-[371px]">
              {/* Animated Dotted Border - 10px stroke */}
              <motion.div
                className="absolute inset-0 w-[371px] h-[371px] rounded-full border-[10px] border-dashed border-[#CBFF63]"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 60,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Green Circle */}
              <div className="absolute left-[26px] top-[26px] w-[321px] h-[321px] rounded-full bg-[#CBFF63] flex items-center justify-center">
                {/* Pixelated Hand */}
                <div className="relative"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
