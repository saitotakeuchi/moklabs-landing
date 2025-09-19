import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    // Close mobile menu after clicking
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-mok-blue pt-4 pb-4 sm:pt-8 sm:pb-8 relative">
      <div className="max-w-[1184px] mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center">
          <img
            src="/logo-moklabs.svg"
            alt="Mok Labs"
            className="h-[28px] w-[193px] sm:h-[36px] sm:w-[248px] md:h-[42px] md:w-[289px]"
          />

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-2 sm:gap-4 md:gap-8">
            <a
              href="#servicos"
              onClick={(e) => handleNavClick(e, "servicos")}
              className="text-mok-green font-small hover:text-mok-green/80 transition-colors cursor-pointer text-sm sm:text-base"
            >
              Serviços
            </a>
            <a
              href="#faq"
              onClick={(e) => handleNavClick(e, "faq")}
              className="text-mok-green font-small hover:text-mok-green/80 transition-colors cursor-pointer text-sm sm:text-base"
            >
              FAQ
            </a>
            <a
              href="#contato"
              onClick={(e) => handleNavClick(e, "contato")}
              className="text-mok-green font-small hover:text-mok-green/80 transition-colors cursor-pointer text-sm sm:text-base"
            >
              Contato
            </a>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="sm:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
            aria-label="Toggle navigation menu"
          >
            <span
              className={`w-6 h-0.5 bg-mok-green transition-all duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-mok-green transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-mok-green transition-all duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <nav className="sm:hidden absolute top-full left-0 right-0 bg-mok-green border-t border-mok-green/20 z-50">
            <div className="flex flex-col">
              <a
                href="#servicos"
                onClick={(e) => handleNavClick(e, "servicos")}
                className="text-mok-blue font-medium hover:bg-black/10 transition-all cursor-pointer text-base py-3 px-2 rounded"
              >
                Serviços
              </a>
              <a
                href="#faq"
                onClick={(e) => handleNavClick(e, "faq")}
                className="text-mok-blue font-medium hover:bg-black/10 transition-all cursor-pointer text-base py-3 px-2 rounded"
              >
                FAQ
              </a>
              <a
                href="#contato"
                onClick={(e) => handleNavClick(e, "contato")}
                className="text-mok-blue font-medium hover:bg-black/10 transition-all cursor-pointer text-base py-3 px-2 rounded"
              >
                Contato
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
