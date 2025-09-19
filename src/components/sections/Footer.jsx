import { Phone, Mail, Instagram } from "iconoir-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-mok-blue text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <img
              src="/logo-moklabs.svg"
              alt="Mok Labs"
              className="h-8 w-auto mb-4"
            />
            <p className="text-white leading-relaxed mb-4">
              Transformamos seus materiais em versões digitais acessíveis e em
              conformidade com os editais do PNLD.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-400" />
                <a
                  href="https://wa.me/5541992694663"
                  className="text-white hover:text-gray-300 transition-colors duration-200 text-sm"
                >
                  +55 (41) 99269 4663
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <a
                  href="mailto:contato@moklabs.com.br"
                  className="text-white hover:text-gray-300 transition-colors duration-200 text-sm"
                >
                  contato@moklabs.com.br
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <Instagram className="w-5 h-5 text-purple-400" />
                <a
                  href="https://instagram.com/moklabs"
                  className="text-white hover:text-gray-300 transition-colors duration-200 text-sm"
                >
                  @moklabs
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white text-sm">
              © {currentYear} Mok Labs. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                to="/politica-de-privacidade"
                className="text-white hover:text-gray-300 text-sm transition-colors duration-200"
              >
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
