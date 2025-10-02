const OurWay = ({ content }) => {
  return (
    <section className="bg-mok-blue py-24">
      <div className="max-w-[1184px] mx-auto px-8">
        <h2 className="text-white text-center text-[32px] font-bold leading-[1.2] mb-16">
          {content.title}
        </h2>

        <div className="grid gap-12 md:grid-cols-3 md:items-start">
          {content.highlights.map(({ icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center gap-6"
            >
              <img
                src={icon}
                alt={title}
                className="w-[168px] h-[168px] object-contain rounded-full"
              />
              <div className="flex flex-col gap-3">
                <h3 className="text-white text-[20px] font-bold leading-[1.3]">
                  {title}
                </h3>
                <p className="text-white/80 text-[14px] leading-[1.6]">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurWay;
