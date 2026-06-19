// =============================================
// INSTRUMENTOS CLÍNICOS VALIDADOS
// Baseados na SBGG e literatura científica
// =============================================

export const MEEM = {
  id: "MEEM",
  name: "Mini Exame do Estado Mental",
  shortName: "MEEM",
  description: "Avalia funções cognitivas como orientação, memória, atenção, linguagem e capacidade construtiva.",
  reference: "Folstein et al., 1975 – Adaptação brasileira Bertolucci et al., 1994",
  maxScore: 30,
  sections: [
    {
      title: "Orientação Temporal",
      instructions: "Pergunte ao paciente (1 ponto para cada resposta correta):",
      questions: [
        { id: "ot1", text: "Que dia da semana é hoje?", points: 1 },
        { id: "ot2", text: "Que dia do mês é hoje?", points: 1 },
        { id: "ot3", text: "Em que mês estamos?", points: 1 },
        { id: "ot4", text: "Em que ano estamos?", points: 1 },
        { id: "ot5", text: "Em que hora aproximada estamos?", points: 1 },
      ]
    },
    {
      title: "Orientação Espacial",
      instructions: "Pergunte ao paciente (1 ponto para cada resposta correta):",
      questions: [
        { id: "oe1", text: "Em que local nós estamos? (consultório, hospital, etc.)", points: 1 },
        { id: "oe2", text: "Que local é este aqui? (andar ou setor)", points: 1 },
        { id: "oe3", text: "Em que bairro nós estamos ou rua próxima?", points: 1 },
        { id: "oe4", text: "Em que cidade nós estamos?", points: 1 },
        { id: "oe5", text: "Em que estado nós estamos?", points: 1 },
      ]
    },
    {
      title: "Registro (Memória Imediata)",
      instructions: "Diga 3 palavras: VASO, CARRO, TIJOLO. Peça ao paciente para repetir. (1 ponto por palavra)",
      questions: [
        { id: "mi1", text: "VASO", points: 1 },
        { id: "mi2", text: "CARRO", points: 1 },
        { id: "mi3", text: "TIJOLO", points: 1 },
      ]
    },
    {
      title: "Atenção e Cálculo",
      instructions: "Peça ao paciente para subtrair 7 de 100 sucessivamente (100, 93, 86, 79, 72, 65). (1 ponto por acerto)",
      questions: [
        { id: "ac1", text: "100 - 7 = ?", points: 1 },
        { id: "ac2", text: "93 - 7 = ?", points: 1 },
        { id: "ac3", text: "86 - 7 = ?", points: 1 },
        { id: "ac4", text: "79 - 7 = ?", points: 1 },
        { id: "ac5", text: "72 - 7 = ?", points: 1 },
      ]
    },
    {
      title: "Evocação (Memória Tardia)",
      instructions: "Pergunte quais as 3 palavras ditas anteriormente. (1 ponto por palavra)",
      questions: [
        { id: "ev1", text: "Qual era a primeira palavra? (VASO)", points: 1 },
        { id: "ev2", text: "Qual era a segunda palavra? (CARRO)", points: 1 },
        { id: "ev3", text: "Qual era a terceira palavra? (TIJOLO)", points: 1 },
      ]
    },
    {
      title: "Linguagem",
      instructions: "Avalie as habilidades de linguagem:",
      questions: [
        { id: "lg1", text: "Nomeie este objeto: RELÓGIO", points: 1 },
        { id: "lg2", text: "Nomeie este objeto: CANETA", points: 1 },
        { id: "lg3", text: "Repita: 'NEM AQUI, NEM ALI, NEM LÁ'", points: 1 },
        { id: "lg4", text: "Comando 1: Pegue este papel com a mão direita", points: 1 },
        { id: "lg5", text: "Comando 2: Dobre-o ao meio", points: 1 },
        { id: "lg6", text: "Comando 3: Coloque-o no chão", points: 1 },
        { id: "lg7", text: "Leia e execute: FECHE OS OLHOS", points: 1 },
        { id: "lg8", text: "Escreva uma frase completa", points: 1 },
        { id: "lg9", text: "Copie o desenho dos pentágonos", points: 1 },
      ]
    }
  ],
  classify: (score, schooling) => {
    // Pontos de corte por escolaridade (Brucki et al., 2003)
    if (!schooling || schooling === 'analfabeto') {
      if (score >= 20) return { classification: "Normal", alert: "normal" };
      if (score >= 15) return { classification: "Déficit Leve", alert: "attention" };
      return { classification: "Déficit Significativo", alert: "critical" };
    }
    if (schooling === '1-4') {
      if (score >= 25) return { classification: "Normal", alert: "normal" };
      if (score >= 20) return { classification: "Déficit Leve", alert: "attention" };
      return { classification: "Déficit Significativo", alert: "critical" };
    }
    if (schooling === '5-8') {
      if (score >= 26) return { classification: "Normal", alert: "normal" };
      if (score >= 22) return { classification: "Déficit Leve", alert: "attention" };
      return { classification: "Déficit Significativo", alert: "critical" };
    }
    // 9+ anos
    if (score >= 28) return { classification: "Normal", alert: "normal" };
    if (score >= 24) return { classification: "Déficit Leve", alert: "attention" };
    return { classification: "Déficit Significativo", alert: "critical" };
  }
};

export const KATZ = {
  id: "Katz",
  name: "Escala de Katz",
  shortName: "Katz",
  description: "Avalia a independência funcional nas Atividades Básicas da Vida Diária (ABVDs).",
  reference: "Katz et al., 1963 – Adaptação Lino et al., 2008",
  maxScore: 6,
  sections: [
    {
      title: "Atividades Básicas da Vida Diária",
      instructions: "Para cada atividade, marque se o paciente é independente (1 ponto) ou dependente (0 pontos):",
      questions: [
        {
          id: "k1",
          text: "BANHO: Toma banho sem necessidade de ajuda, ou necessita de ajuda apenas para uma parte do corpo (costas, extremidades)?",
          points: 1,
          options: [
            { label: "Independente – Não precisa de ajuda ou só para uma parte", value: 1 },
            { label: "Dependente – Precisa de ajuda para mais de uma parte do corpo", value: 0 }
          ]
        },
        {
          id: "k2",
          text: "VESTIR-SE: Pega as roupas e se veste completamente, sem ajuda? (exceto amarrar sapatos)",
          points: 1,
          options: [
            { label: "Independente – Veste-se sem ajuda", value: 1 },
            { label: "Dependente – Precisa de ajuda para vestir-se", value: 0 }
          ]
        },
        {
          id: "k3",
          text: "HIGIENE PESSOAL: Vai ao banheiro, usa o vaso, limpa-se e se veste após sem ajuda?",
          points: 1,
          options: [
            { label: "Independente – Vai ao banheiro e se limpa sem ajuda", value: 1 },
            { label: "Dependente – Precisa de ajuda para usar o banheiro", value: 0 }
          ]
        },
        {
          id: "k4",
          text: "TRANSFERÊNCIA: Consegue deitar e levantar da cama ou sentar e levantar da cadeira sem ajuda?",
          points: 1,
          options: [
            { label: "Independente – Movimenta-se sem ajuda", value: 1 },
            { label: "Dependente – Precisa de ajuda para movimentar-se", value: 0 }
          ]
        },
        {
          id: "k5",
          text: "CONTINÊNCIA: Tem controle completo sobre a micção e evacuação?",
          points: 1,
          options: [
            { label: "Independente – Controle completo", value: 1 },
            { label: "Dependente – Incontinência parcial ou total", value: 0 }
          ]
        },
        {
          id: "k6",
          text: "ALIMENTAÇÃO: Alimenta-se sem ajuda? (cortar carne e preparar comida é permitido)",
          points: 1,
          options: [
            { label: "Independente – Alimenta-se sozinho", value: 1 },
            { label: "Dependente – Precisa de ajuda para alimentar-se", value: 0 }
          ]
        }
      ]
    }
  ],
  classify: (score) => {
    if (score === 6) return { classification: "Independente", alert: "normal" };
    if (score >= 4) return { classification: "Dependência Parcial", alert: "attention" };
    if (score >= 2) return { classification: "Dependência Importante", alert: "attention" };
    return { classification: "Dependência Total", alert: "critical" };
  }
};

export const LAWTON = {
  id: "Lawton",
  name: "Escala de Lawton-Brody",
  shortName: "Lawton",
  description: "Avalia a capacidade funcional nas Atividades Instrumentais da Vida Diária (AIVDs).",
  reference: "Lawton & Brody, 1969 – Adaptação Santos & Virtuoso Jr., 2008",
  maxScore: 27,
  sections: [
    {
      title: "Atividades Instrumentais da Vida Diária",
      instructions: "Para cada atividade, selecione a opção que melhor descreve o paciente:",
      questions: [
        {
          id: "l1",
          text: "TELEFONE: O(a) Sr.(a) consegue usar o telefone?",
          points: 3,
          options: [
            { label: "Utiliza o telefone por iniciativa própria", value: 3 },
            { label: "Disca alguns números conhecidos", value: 2 },
            { label: "Atende ao telefone mas não disca", value: 1 }
          ]
        },
        {
          id: "l2",
          text: "VIAGENS: O(a) Sr.(a) consegue ir a locais distantes usando algum transporte?",
          points: 3,
          options: [
            { label: "Viaja sozinho(a) em transporte público", value: 3 },
            { label: "Viaja quando acompanhado(a)", value: 2 },
            { label: "Não viaja", value: 1 }
          ]
        },
        {
          id: "l3",
          text: "COMPRAS: O(a) Sr.(a) consegue fazer compras?",
          points: 3,
          options: [
            { label: "Faz compras sozinho(a)", value: 3 },
            { label: "Precisa de companhia para fazer compras", value: 2 },
            { label: "Não faz compras", value: 1 }
          ]
        },
        {
          id: "l4",
          text: "PREPARO DE REFEIÇÕES: O(a) Sr.(a) consegue preparar as suas refeições?",
          points: 3,
          options: [
            { label: "Planeja e prepara refeições adequadas sozinho(a)", value: 3 },
            { label: "Prepara refeições pequenas ou quando os ingredientes são fornecidos", value: 2 },
            { label: "Não prepara refeições", value: 1 }
          ]
        },
        {
          id: "l5",
          text: "TRABALHO DOMÉSTICO: O(a) Sr.(a) consegue fazer o trabalho de casa?",
          points: 3,
          options: [
            { label: "Realiza tarefas domésticas pesadas sozinho(a)", value: 3 },
            { label: "Realiza tarefas domésticas leves", value: 2 },
            { label: "Não realiza tarefas domésticas", value: 1 }
          ]
        },
        {
          id: "l6",
          text: "MEDICAMENTOS: O(a) Sr.(a) consegue tomar seus remédios na dose e hora certas?",
          points: 3,
          options: [
            { label: "Toma medicamentos na dose e hora certas por conta própria", value: 3 },
            { label: "Toma medicamentos se preparados e separados previamente", value: 2 },
            { label: "Não toma medicamentos sozinho(a)", value: 1 }
          ]
        },
        {
          id: "l7",
          text: "DINHEIRO: O(a) Sr.(a) consegue cuidar das suas finanças?",
          points: 3,
          options: [
            { label: "Paga contas e controla finanças sem ajuda", value: 3 },
            { label: "Paga contas pequenas, mas precisa de ajuda com contas maiores", value: 2 },
            { label: "Não controla as finanças", value: 1 }
          ]
        },
        {
          id: "l8",
          text: "TRABALHOS MANUAIS: O(a) Sr.(a) consegue fazer pequenos reparos em casa?",
          points: 3,
          options: [
            { label: "Realiza reparos e trabalhos manuais sozinho(a)", value: 3 },
            { label: "Realiza reparos leves com ajuda", value: 2 },
            { label: "Não realiza reparos", value: 1 }
          ]
        },
        {
          id: "l9",
          text: "LAVAR/PASSAR ROUPA: O(a) Sr.(a) consegue lavar e passar suas roupas?",
          points: 3,
          options: [
            { label: "Lava e passa toda a roupa sozinho(a)", value: 3 },
            { label: "Lava roupas pequenas", value: 2 },
            { label: "Não lava roupas", value: 1 }
          ]
        }
      ]
    }
  ],
  classify: (score) => {
    if (score >= 25) return { classification: "Independente", alert: "normal" };
    if (score >= 17) return { classification: "Dependência Parcial", alert: "attention" };
    return { classification: "Dependência Grave", alert: "critical" };
  }
};

export const GDS = {
  id: "GDS",
  name: "Escala de Depressão Geriátrica (GDS-15)",
  shortName: "GDS-15",
  description: "Rastreamento de sintomas depressivos em idosos utilizando a versão abreviada com 15 itens.",
  reference: "Yesavage et al., 1983 – Versão brasileira Almeida & Almeida, 1999",
  maxScore: 15,
  sections: [
    {
      title: "Escala de Depressão Geriátrica – 15 itens",
      instructions: "Responda SIM ou NÃO para cada pergunta, considerando como o(a) Sr.(a) se sentiu na última semana:",
      questions: [
        { id: "g1", text: "Está satisfeito(a) com sua vida?", points: 1, depressiveAnswer: "Não" },
        { id: "g2", text: "Diminuiu a maior parte de suas atividades e interesses?", points: 1, depressiveAnswer: "Sim" },
        { id: "g3", text: "Sente que a vida está vazia?", points: 1, depressiveAnswer: "Sim" },
        { id: "g4", text: "Aborrece-se com frequência?", points: 1, depressiveAnswer: "Sim" },
        { id: "g5", text: "Sente-se de bom humor a maior parte do tempo?", points: 1, depressiveAnswer: "Não" },
        { id: "g6", text: "Tem medo que algo ruim lhe aconteça?", points: 1, depressiveAnswer: "Sim" },
        { id: "g7", text: "Sente-se feliz a maior parte do tempo?", points: 1, depressiveAnswer: "Não" },
        { id: "g8", text: "Sente-se frequentemente desamparado(a)?", points: 1, depressiveAnswer: "Sim" },
        { id: "g9", text: "Prefere ficar em casa a sair e fazer coisas novas?", points: 1, depressiveAnswer: "Sim" },
        { id: "g10", text: "Acha que tem mais problemas de memória que a maioria?", points: 1, depressiveAnswer: "Sim" },
        { id: "g11", text: "Acha que é maravilhoso estar vivo(a) agora?", points: 1, depressiveAnswer: "Não" },
        { id: "g12", text: "Sente-se inútil nas atuais circunstâncias?", points: 1, depressiveAnswer: "Sim" },
        { id: "g13", text: "Sente-se cheio(a) de energia?", points: 1, depressiveAnswer: "Não" },
        { id: "g14", text: "Acha que sua situação é sem esperança?", points: 1, depressiveAnswer: "Sim" },
        { id: "g15", text: "Acha que a maioria das pessoas está melhor que o(a) Sr.(a)?", points: 1, depressiveAnswer: "Sim" }
      ]
    }
  ],
  classify: (score) => {
    if (score <= 5) return { classification: "Normal (sem depressão)", alert: "normal" };
    if (score <= 10) return { classification: "Depressão Leve a Moderada", alert: "attention" };
    return { classification: "Depressão Grave", alert: "critical" };
  }
};

export const AGA = {
  id: "AGA",
  name: "Avaliação Geriátrica Ampla",
  shortName: "AGA",
  description: "Avaliação multidimensional que engloba cognição, humor, mobilidade, nutrição e suporte social.",
  reference: "SBGG – Sociedade Brasileira de Geriatria e Gerontologia",
  maxScore: 40,
  sections: [
    {
      title: "Cognição",
      instructions: "Avalie o estado cognitivo do paciente:",
      questions: [
        { id: "ag_cog1", text: "Orientado em tempo (dia, mês, ano)?", points: 2, options: [
          { label: "Completamente orientado", value: 2 },
          { label: "Parcialmente orientado", value: 1 },
          { label: "Desorientado", value: 0 }
        ]},
        { id: "ag_cog2", text: "Orientado em espaço (local, cidade)?", points: 2, options: [
          { label: "Completamente orientado", value: 2 },
          { label: "Parcialmente orientado", value: 1 },
          { label: "Desorientado", value: 0 }
        ]},
        { id: "ag_cog3", text: "Memória recente preservada?", points: 2, options: [
          { label: "Preservada", value: 2 },
          { label: "Levemente comprometida", value: 1 },
          { label: "Gravemente comprometida", value: 0 }
        ]},
      ]
    },
    {
      title: "Humor e Comportamento",
      instructions: "Avalie o estado emocional e comportamental:",
      questions: [
        { id: "ag_hum1", text: "Apresenta sintomas depressivos?", points: 2, options: [
          { label: "Ausentes", value: 2 },
          { label: "Leves", value: 1 },
          { label: "Moderados ou graves", value: 0 }
        ]},
        { id: "ag_hum2", text: "Apresenta ansiedade significativa?", points: 2, options: [
          { label: "Não", value: 2 },
          { label: "Leve", value: 1 },
          { label: "Sim, significativa", value: 0 }
        ]},
        { id: "ag_hum3", text: "Apresenta distúrbios de sono?", points: 2, options: [
          { label: "Não", value: 2 },
          { label: "Ocasionalmente", value: 1 },
          { label: "Com frequência", value: 0 }
        ]},
      ]
    },
    {
      title: "Mobilidade e Risco de Quedas",
      instructions: "Avalie a mobilidade e equilíbrio do paciente:",
      questions: [
        { id: "ag_mob1", text: "Deambula de forma independente?", points: 2, options: [
          { label: "Sim, sem auxílio", value: 2 },
          { label: "Com auxílio (bengala/andador)", value: 1 },
          { label: "Não deambula", value: 0 }
        ]},
        { id: "ag_mob2", text: "Equilíbrio estático e dinâmico:", points: 2, options: [
          { label: "Preservado", value: 2 },
          { label: "Levemente comprometido", value: 1 },
          { label: "Gravemente comprometido", value: 0 }
        ]},
        { id: "ag_mob3", text: "Sofreu quedas nos últimos 12 meses?", points: 2, options: [
          { label: "Não", value: 2 },
          { label: "1 queda", value: 1 },
          { label: "2 ou mais quedas", value: 0 }
        ]},
      ]
    },
    {
      title: "Nutrição",
      instructions: "Avalie o estado nutricional do paciente:",
      questions: [
        { id: "ag_nut1", text: "Estado nutricional geral:", points: 2, options: [
          { label: "Adequado (IMC 22-27)", value: 2 },
          { label: "Risco nutricional", value: 1 },
          { label: "Desnutrição ou obesidade grave", value: 0 }
        ]},
        { id: "ag_nut2", text: "Houve perda de peso involuntária recente?", points: 2, options: [
          { label: "Não", value: 2 },
          { label: "< 5% em 3 meses", value: 1 },
          { label: "≥ 5% em 3 meses", value: 0 }
        ]},
        { id: "ag_nut3", text: "Alimentação e hidratação adequadas?", points: 2, options: [
          { label: "Sim", value: 2 },
          { label: "Parcialmente", value: 1 },
          { label: "Não", value: 0 }
        ]},
      ]
    },
    {
      title: "Suporte Social e Condições de Moradia",
      instructions: "Avalie o contexto social do paciente:",
      questions: [
        { id: "ag_soc1", text: "Tem suporte familiar ou cuidador adequado?", points: 2, options: [
          { label: "Sim, suporte adequado", value: 2 },
          { label: "Suporte parcial", value: 1 },
          { label: "Sem suporte", value: 0 }
        ]},
        { id: "ag_soc2", text: "Condições de moradia:", points: 2, options: [
          { label: "Adequadas e seguras", value: 2 },
          { label: "Parcialmente adequadas", value: 1 },
          { label: "Inadequadas ou inseguras", value: 0 }
        ]},
        { id: "ag_soc3", text: "Participação social e atividades de lazer:", points: 2, options: [
          { label: "Ativo socialmente", value: 2 },
          { label: "Parcialmente ativo", value: 1 },
          { label: "Isolado socialmente", value: 0 }
        ]},
      ]
    },
    {
      title: "Saúde Sensorial e Comunicação",
      instructions: "Avalie visão, audição e comunicação:",
      questions: [
        { id: "ag_sen1", text: "Acuidade visual funcional (com ou sem correção):", points: 2, options: [
          { label: "Preservada", value: 2 },
          { label: "Levemente comprometida", value: 1 },
          { label: "Gravemente comprometida", value: 0 }
        ]},
        { id: "ag_sen2", text: "Acuidade auditiva funcional:", points: 2, options: [
          { label: "Preservada", value: 2 },
          { label: "Levemente comprometida", value: 1 },
          { label: "Gravemente comprometida", value: 0 }
        ]},
        { id: "ag_sen3", text: "Comunicação verbal e compreensão:", points: 2, options: [
          { label: "Preservada", value: 2 },
          { label: "Dificuldade leve", value: 1 },
          { label: "Dificuldade grave", value: 0 }
        ]},
      ]
    },
    {
      title: "Polifarmácia e Adesão ao Tratamento",
      instructions: "Avalie o uso de medicamentos:",
      questions: [
        { id: "ag_med1", text: "Número de medicamentos em uso contínuo:", points: 2, options: [
          { label: "Menos de 5 medicamentos", value: 2 },
          { label: "5 a 9 medicamentos", value: 1 },
          { label: "10 ou mais medicamentos", value: 0 }
        ]},
        { id: "ag_med2", text: "Adesão ao tratamento medicamentoso:", points: 2, options: [
          { label: "Boa adesão", value: 2 },
          { label: "Adesão parcial", value: 1 },
          { label: "Baixa adesão", value: 0 }
        ]},
      ]
    },
  ],
  classify: (score) => {
    const pct = (score / 40) * 100;
    if (pct >= 80) return { classification: "Condição Satisfatória", alert: "normal" };
    if (pct >= 55) return { classification: "Risco Moderado", alert: "attention" };
    return { classification: "Risco Elevado – Intervenção Necessária", alert: "critical" };
  }
};

export const ALL_TESTS = { MEEM, Katz: KATZ, Lawton: LAWTON, GDS, AGA };

export function getTestById(id) {
  return ALL_TESTS[id] || null;
}

export function getAlertColor(level) {
  switch (level) {
    case "normal": return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "attention": return "text-amber-600 bg-amber-50 border-amber-200";
    case "critical": return "text-red-600 bg-red-50 border-red-200";
    default: return "text-muted-foreground bg-muted border-border";
  }
}

export function getAlertBadgeColor(level) {
  switch (level) {
    case "normal": return "bg-emerald-100 text-emerald-700";
    case "attention": return "bg-amber-100 text-amber-700";
    case "critical": return "bg-red-100 text-red-700";
    default: return "bg-muted text-muted-foreground";
  }
}