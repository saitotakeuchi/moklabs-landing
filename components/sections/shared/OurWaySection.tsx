interface Highlight {
  icon: string;
  title: string;
  description: string;
}

interface OurWayProps {
  content: {
    title: string;
    highlights: Highlight[];
  };
}

const OurWay = ({ content }: OurWayProps) => {
  return (
    <section className="bg-mok-blue py-24">
      <div className="max-w-[1184px] mx-auto px-8">
        <h2 className="text-white text-center text-[32px] font-bold leading-[1.2] mb-16">
          {content.title}
        </h2>

        <div className="grid gap-12 md:grid-cols-3 md:items-start">
          {content.highlights.map(({ icon, title, description }, index) => {
            const baseName = icon.replace('.jpg', '').replace('/', '');
            const isLazyLoaded = index === 2; // Third image (our-way-03)

            return (
              <div
                key={title}
                className="flex flex-col items-center text-center gap-6"
              >
                <picture>
                  <source
                    type="image/webp"
                    srcSet={`
                      /optimized/${baseName}-252w.webp 252w,
                      /optimized/${baseName}-504w.webp 504w,
                      /optimized/${baseName}-756w.webp 756w
                    `}
                    sizes="(max-width: 768px) 168px, 168px"
                  />
                  <img
                    src={icon}
                    alt={title}
                    className="w-[168px] h-[168px] object-contain rounded-full"
                    loading={isLazyLoaded ? "lazy" : undefined}
                  />
                </picture>
                <div className="flex flex-col gap-3">
                  <h3 className="text-white text-[20px] font-bold leading-[1.3]">
                    {title}
                  </h3>
                  <p className="text-white/80 text-[14px] leading-[1.6]">
                    {description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OurWay;
