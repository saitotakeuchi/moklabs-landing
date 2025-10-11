'use client';

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();

    // If we're not on the home page, navigate to home first
    if (pathname !== '/') {
      router.push('/');
      // Use setTimeout to allow navigation to complete before scrolling
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    } else {
      // If we're on the home page, scroll to the section
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }

    // Close mobile menu after clicking
    setIsMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    router.push('/');
  };

  const handlePnldClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push('/pnld');
    setIsMenuOpen(false);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`bg-mok-blue transition-all duration-300 fixed top-0 left-0 right-0 z-50 ${
      isScrolled
        ? 'pt-2 pb-2 sm:pt-3 sm:pb-3 shadow-lg'
        : 'pt-4 pb-4 sm:pt-8 sm:pb-8'
    }`}>
      <div className="max-w-[1184px] mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center">
          <Image
            src="/logo-moklabs.svg"
            alt="Mok Labs"
            width={289}
            height={42}
            className={`cursor-pointer transition-all duration-300 ${
              isScrolled
                ? 'h-[24px] w-[165px] sm:h-[28px] sm:w-[193px] md:h-[32px] md:w-[221px]'
                : 'h-[28px] w-[193px] sm:h-[36px] sm:w-[248px] md:h-[42px] md:w-[289px]'
            }`}
            onClick={handleLogoClick}
            priority
          />

          <div className="hidden sm:flex items-center gap-2 sm:gap-4 md:gap-8">
            {/* Left Navigation */}
            <nav className="flex items-center gap-2 sm:gap-4 md:gap-6">
              <Link
                href="/#servicos"
                onClick={(e) => handleNavClick(e, "servicos")}
                className={`font-small hover:text-mok-green/80 transition-colors cursor-pointer text-sm sm:text-base ${
                  pathname === '/' ? 'text-mok-green' : 'text-mok-green/60'
                }`}
              >
                Serviços
              </Link>
              <Link
                href="/#faq"
                onClick={(e) => handleNavClick(e, "faq")}
                className={`font-small hover:text-mok-green/80 transition-colors cursor-pointer text-sm sm:text-base ${
                  pathname === '/' ? 'text-mok-green' : 'text-mok-green/60'
                }`}
              >
                FAQ
              </Link>
              <Link
                href="/#contato"
                onClick={(e) => handleNavClick(e, "contato")}
                className={`font-small hover:text-mok-green/80 transition-colors cursor-pointer text-sm sm:text-base ${
                  pathname === '/' ? 'text-mok-green' : 'text-mok-green/60'
                }`}
              >
                Contato
              </Link>
            </nav>

            {/* PNLD Button - Highlighted */}
            <Link
              href="/pnld"
              onClick={handlePnldClick}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold transition-all cursor-pointer text-sm sm:text-base ${
                pathname === '/pnld'
                  ? 'bg-white text-mok-blue ring-2 ring-mok-green'
                  : 'bg-mok-green text-mok-blue hover:bg-mok-green/90'
              }`}
            >
              PNLD
            </Link>
          </div>

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
            <div className="flex flex-col px-4 py-2">
              <Link
                href="/#servicos"
                onClick={(e) => handleNavClick(e, "servicos")}
                className={`font-medium hover:bg-black/10 transition-all cursor-pointer text-base py-3 px-2 rounded ${
                  pathname === '/' ? 'text-mok-blue' : 'text-mok-blue/60'
                }`}
              >
                Serviços
              </Link>
              <Link
                href="/#faq"
                onClick={(e) => handleNavClick(e, "faq")}
                className={`font-medium hover:bg-black/10 transition-all cursor-pointer text-base py-3 px-2 rounded ${
                  pathname === '/' ? 'text-mok-blue' : 'text-mok-blue/60'
                }`}
              >
                FAQ
              </Link>
              <Link
                href="/#contato"
                onClick={(e) => handleNavClick(e, "contato")}
                className={`font-medium hover:bg-black/10 transition-all cursor-pointer text-base py-3 px-2 rounded ${
                  pathname === '/' ? 'text-mok-blue' : 'text-mok-blue/60'
                }`}
              >
                Contato
              </Link>

              {/* PNLD Button - Highlighted for Mobile */}
              <div className="mt-2 pt-2 border-t border-mok-blue/20">
                <Link
                  href="/pnld"
                  onClick={handlePnldClick}
                  className={`font-bold transition-all cursor-pointer text-base py-3 px-4 rounded-lg block text-center ${
                    pathname === '/pnld'
                      ? 'bg-white text-mok-blue ring-2 ring-mok-blue'
                      : 'bg-mok-blue text-mok-green hover:bg-mok-blue/90'
                  }`}
                >
                  PNLD
                </Link>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
