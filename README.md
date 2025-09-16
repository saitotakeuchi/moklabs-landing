# Mok Labs Landing Page

Landing page para a Mok Labs - especialista em transformação de materiais educacionais para PNLD digital.

## 🚀 Tecnologias

- **React 19** - Framework frontend
- **Vite** - Build tool e dev server
- **Tailwind CSS 4** - Framework CSS
- **Framer Motion** - Animações
- **React Router** - Roteamento
- **Resend** - Envio de emails
- **Express** - API backend
- **Vercel** - Deploy e hosting

## 🏗️ Arquitetura

### Organização de Componentes

```
src/
├── components/
│   ├── common/      # Componentes reutilizáveis
│   ├── sections/    # Seções específicas da página
│   ├── ui/          # Elementos básicos de UI
│   └── forms/       # Componentes de formulário
├── pages/           # Páginas da aplicação
├── hooks/           # Custom hooks
├── utils/           # Funções utilitárias
└── context/         # Contextos React
```

### Funcionalidades

- ✅ Design responsivo
- ✅ Animações suaves com Framer Motion
- ✅ Formulário de contato com validação
- ✅ Integração com Resend para envio de emails
- ✅ SEO otimizado com meta tags e structured data
- ✅ Accordion para FAQ
- ✅ Performance otimizada com lazy loading

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd moklabs-landing

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

### Configuração

1. Crie uma conta no [Resend](https://resend.com)
2. Obtenha sua API key
3. Configure o arquivo `.env`:

```env
RESEND_API_KEY=your_resend_api_key_here
PORT=3001
```

### Scripts Disponíveis

```bash
# Desenvolvimento - apenas frontend
npm run dev

# Desenvolvimento - apenas API
npm run dev:server

# Desenvolvimento - frontend + API
npm run dev:full

# Build para produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint

# Produção (servidor)
npm start
```

## 🚀 Deploy

### Vercel (Recomendado)

1. **Conecte o repositório ao Vercel**
   ```bash
   vercel
   ```

2. **Configure as variáveis de ambiente no Vercel**:
   - `RESEND_API_KEY`: Sua chave da API do Resend

3. **Deploy automático**:
   - Cada push para `main` fará deploy automático
   - Pull requests geram preview deployments

### Configuração do Domínio

1. No dashboard do Vercel, vá em Project Settings
2. Na aba Domains, adicione seu domínio customizado
3. Configure os DNS conforme instruções do Vercel

## 📧 Configuração de Email

### Resend Setup

1. Verifique seu domínio no Resend
2. Configure os registros DNS necessários
3. Atualize o campo `from` no `server.js`:

```javascript
from: 'Mok Labs <contato@seudominio.com.br>',
```

### Templates de Email

O sistema envia 2 emails:
- **Notificação**: Para a equipe com os dados do contato
- **Confirmação**: Para o usuário confirmando o recebimento

## 🎨 Customização

### Cores e Tema

As cores principais estão definidas no Tailwind CSS:
- **Primária**: Blue (600, 700)
- **Secundária**: Gray (50, 100, 600, 900)
- **Accent**: Green (400, 600), Red (500, 600)

### Conteúdo

Todo o conteúdo pode ser editado nos componentes das seções:
- `src/components/sections/Hero.jsx` - Seção principal
- `src/components/sections/FAQ.jsx` - Perguntas frequentes
- `src/components/sections/Contact.jsx` - Informações de contato

### Imagens e Assets

Coloque os assets na pasta `public/`:
- Logo: `/logo-moklabs.svg`
- Logo white: `/logo-moklabs-white.svg`
- OG Image: `/og-image.jpg`

## 🔧 Monitoramento

### Analytics

Para adicionar Google Analytics:

1. Adicione o script no `index.html`
2. Configure tracking nos componentes principais

### Error Tracking

Para Sentry ou similar:

```bash
npm install @sentry/react
```

## 📱 PWA (Opcional)

Para transformar em PWA:

```bash
npm install vite-plugin-pwa
```

Configure no `vite.config.js`.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Contato

- **Website**: [moklabs.com.br](https://moklabs.com.br)
- **Email**: contato@moklabs.com.br
- **WhatsApp**: +55 (41) 99999-9999
- **Instagram**: [@moklabs](https://instagram.com/moklabs)
