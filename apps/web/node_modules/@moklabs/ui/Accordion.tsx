"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AccordionItemProps {
  number: number;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem = ({
  number,
  question,
  answer,
  isOpen,
  onToggle,
}: AccordionItemProps) => {
  const panelId = `accordion-panel-${number}`;
  const headingId = `accordion-heading-${number}`;

  return (
    <div className="w-full border-b border-mok-blue">
      <button
        type="button"
        id={headingId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-6 text-left py-4"
      >
        <span className="flex-1 text-mok-blue text-[16px] font-bold leading-[1.4] flex">
          <span className="mr-3">{number}.</span>
          <span className="flex-1">{question}</span>
        </span>
        <motion.span
          aria-hidden="true"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="mt-1 text-mok-blue"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            id={panelId}
            role="region"
            aria-labelledby={headingId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pl-6 pb-6 text-mok-blue text-[16px] leading-[1.6]">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface AccordionProps {
  items: Array<{
    question: string;
    answer: string;
  }>;
  allowMultiple?: boolean;
}

const Accordion = ({ items, allowMultiple = false }: AccordionProps) => {
  const [openItems, setOpenItems] = useState(new Set([0]));

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);

    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      if (!allowMultiple) {
        newOpenItems.clear();
      }
      newOpenItems.add(index);
    }

    setOpenItems(newOpenItems);
  };

  return (
    <div className="flex flex-col gap-6">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          number={index + 1}
          question={item.question}
          answer={item.answer}
          isOpen={openItems.has(index)}
          onToggle={() => toggleItem(index)}
        />
      ))}
    </div>
  );
};

export default Accordion;
