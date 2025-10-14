export const pnldContent = {
  hero: {
    title: "PNLD digital sem complicação",
    subtitle:
      "No Mok Labs transformamos seus materiais em versões digitais acessíveis e em conformidade com os editais do PNLD.",
    image: "/hero-hand.svg",
    imageAlt: "Pixelated hand illustration",
    buttons: [
      {
        text: "Vamos conversar!",
        url: "https://wa.me/5541936182622",
        variant: "primary" as const,
      },
      {
        text: "Conheça os serviços",
        url: "#servicos",
        variant: "secondary" as const,
      },
    ],
  },

  services: {
    title: "O que fazemos",
    items: [
      "LIVROS DIGITAIS",
      "PNLD DIGITAL",
      "ACESSIBILIDADE",
      "INTERATIVIDADE",
      "AUDIODESCRIÇÃO",
      "CONSULTORIA E SUPORTE",
    ],
    splashImage: "/services-splash.svg",
    splashText: "100% DE CONFORMIDADE COM O PNLD",
    decorativeImages: [
      { src: "/services-blue-star.svg", alt: "" },
      { src: "/services-half-star.svg", alt: "" },
    ],
  },

  problemStatement: {
    title: "Sabemos como é difícil",
    problems: [
      "Os editais pedem livros digitais acessíveis, com interatividade e inúmeros requisitos técnicos. Não basta converter PDF, é muito mais do que isso.",
      "Prazos curtos, especificações confusas e muita dor de cabeça. Qualquer erro pode custar caro (e tempo é o que menos sobra).",
    ],
  },

  howWorks: {
    title: "Como funciona?",
    steps: [
      {
        title: "Você envia os arquivos",
        description: "→ Só precisamos dos originais.",
      },
      {
        title: "Adaptamos ao edital ",
        description: "→ Formatação, digitalização e testes de acessibilidade.",
      },
      {
        title: "Você recebe tudo pronto",
        description: "→ Arquivos revisados e prontos para inscrição.",
      },
    ],
    cta: {
      text: "Pronto para começar?",
      button: {
        text: "Falar no WhatsApp",
        url: "https://wa.me/5541936182622",
      },
    },
  },

  ourWay: {
    title: "Nosso jeito",
    highlights: [
      {
        icon: "/our-way-01.jpg",
        title: "Não acreditamos em soluções engessadas.",
        description:
          "Cada projeto recebe um plano feito sob medida para o resultado que você precisa.",
      },
      {
        icon: "/our-way-02.jpg",
        title: "Entregamos rápido e com custos eficientes.",
        description:
          "Times enxutos, processos ágeis e comunicação clara para manter o orçamento no lugar.",
      },
      {
        icon: "/our-way-03.jpg",
        title: "Garantimos atendimento humano e ágil.",
        description:
          "Você fala com especialistas de verdade, sempre prontos para ajustar o que for preciso.",
      },
    ],
  },

  animatedPanel: {
    topText: "SOLUÇÕES DIGITAIS SOB MEDIDA.",
    bottomText: "SEM RETRABALHO. SEM STRESS.",
  },

  faq: {
    title: "Perguntas frequentes",
    items: [
      {
        question: "O que é o PNLD digital?",
        answer:
          "O PNLD Digital é a versão em formato digital dos livros didáticos distribuídos pelo Programa Nacional do Livro Didático do governo federal. Esses materiais precisam seguir especificações técnicas rigorosas estabelecidas pelo FNDE, incluindo acessibilidade, formatos de arquivo específicos (como EPUB3), recursos interativos, compatibilidade com diferentes dispositivos e conformidade com padrões de usabilidade. É essencial que os livros digitais atendam a todos esses requisitos para serem aprovados e distribuídos nas escolas públicas brasileiras.",
      },
      {
        question: "Quanto tempo leva para adaptar?",
        answer:
          "O prazo de adaptação depende da quantidade de volumes, da complexidade do conteúdo e do estado dos arquivos originais. Em média, a adaptação de uma coleção completa pode levar de 2 a 4 semanas. Trabalhamos com cronogramas otimizados para atender aos prazos do edital do PNLD, e quanto antes iniciarmos o processo, mais tempo teremos para garantir qualidade e realizar todos os testes de conformidade necessários. Recomendamos começar a adaptação assim que possível para evitar correria nos prazos finais.",
      },
      {
        question: "E se meus arquivos não estiverem prontos?",
        answer:
          "Não há problema! A MokLabs tem experiência em trabalhar com arquivos em diferentes estágios de preparação. Podemos receber PDFs, arquivos InDesign, Word ou até mesmo impressos para digitalização. Nossa equipe faz a estruturação, diagramação digital, inserção de recursos interativos e adequação aos padrões do PNLD. Também oferecemos consultoria desde o início do projeto editorial para garantir que o material seja desenvolvido já pensando nos requisitos digitais, economizando tempo e recursos no futuro.",
      },
      {
        question:
          "O que acontece se o material não estiver em conformidade com o edital?",
        answer:
          "Se o material digital não atender às especificações técnicas do PNLD, ele pode ser reprovado na avaliação do FNDE, impedindo sua distribuição nas escolas públicas. Isso significa perder o investimento feito na produção e, principalmente, ficar de fora de um dos maiores programas de aquisição de livros didáticos do país. Na MokLabs, evitamos esse risco realizando testes rigorosos de conformidade, validação de acessibilidade e verificação de todos os requisitos técnicos antes da entrega, garantindo que seu material seja aprovado já na primeira submissão.",
      },
      {
        question: "Por que confiar na Mok Labs?",
        answer:
          "A MokLabs é especializada em projetos para editoras educacionais e possui amplo conhecimento dos requisitos técnicos e pedagógicos do PNLD. Acompanhamos de perto as atualizações dos editais e mantemos nossa equipe sempre atualizada sobre as exigências do programa. Já adaptamos diversos materiais que foram aprovados pelo FNDE e entendemos as nuances técnicas, de acessibilidade e de usabilidade exigidas. Além disso, oferecemos um processo transparente com checkpoints de validação, garantindo que você acompanhe cada etapa e tenha segurança de que seu material estará em conformidade com todas as normas do programa.",
      },
    ],
  },
};
