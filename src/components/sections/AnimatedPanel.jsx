import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const topText = "SOLU\u00C7\u00D5ES DIGITAIS SOB MEDIDA.";
const bottomText = "SEM RETRABALHO. SEM STRESS.";

const AnimatedPanel = () => {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  const topX = useTransform(scrollYProgress, [0, 1], ["-120%", "0%"]);
  const bottomX = useTransform(scrollYProgress, [0, 1], ["120%", "0%"]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden w-full h-[120px] bg-mok-blue flex flex-col justify-center"
    >
      <div className="flex h-1/2 items-center justify-center overflow-hidden">
        <motion.span
          className="font-sans text-[24px] font-bold leading-[1.2] text-white"
          style={{ x: topX }}
        >
          {topText}
        </motion.span>
      </div>
      <div className="flex h-1/2 items-center justify-center overflow-hidden">
        <motion.span
          className="font-sans text-[24px] font-bold leading-[1.2] text-white"
          style={{ x: bottomX }}
        >
          {bottomText}
        </motion.span>
      </div>
    </section>
  );
};

export default AnimatedPanel;
