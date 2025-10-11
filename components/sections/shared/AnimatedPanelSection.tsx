'use client';

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface AnimatedPanelProps {
  content: {
    topText: string;
    bottomText: string;
  };
}

const AnimatedPanelMain = ({ content }: AnimatedPanelProps) => {
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
      className="relative overflow-hidden w-full h-[80px] sm:h-[120px] bg-mok-green flex flex-col justify-center"
    >
      <div className="flex h-1/2 items-center justify-center overflow-hidden">
        <motion.span
          className="text-[18px] sm:text-[24px] font-bold leading-[1.2] text-mok-blue"
          style={{ x: topX }}
        >
          {content.topText}
        </motion.span>
      </div>
      <div className="flex h-1/2 items-center justify-center overflow-hidden">
        <motion.span
          className="text-[18px] sm:text-[24px] font-bold leading-[1.2] text-mok-blue"
          style={{ x: bottomX }}
        >
          {content.bottomText}
        </motion.span>
      </div>
    </section>
  );
};

export default AnimatedPanelMain;
