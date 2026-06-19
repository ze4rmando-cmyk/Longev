// =============================================
// INTERPRETAÇÕES CLÍNICAS, RECOMENDAÇÕES E
// TAXONOMIAS NANDA-I, NIC e NOC
// =============================================

export const INTERPRETATIONS = {
  MEEM: {
    normal: {
      interpretation: "A pontuação está dentro dos limites esperados para a escolaridade do paciente, indicando função cognitiva preservada. Não há evidências de declínio cognitivo significativo no momento da avaliação.",
      recommendations: [
        "Manter estilo de vida ativo — atividade física aeróbica ≥150 min/semana",
        "Estimulação cognitiva: leitura, palavras cruzadas, jogos de memória",
        "Controle de fatores de risco cardiovasculares (HAS, DM, dislipidemia)",
        "Sono de qualidade (7–8h/noite)",
        "Dieta mediterrânea ou MIND",
        "Reavaliação anual ou em caso de queixas",
      ],
      nanda: [],
      nic: [],
      noc: [],
    },
    attention: {
      interpretation: "A pontuação indica déficit cognitivo leve, com comprometimento de funções como orientação, memória de trabalho ou linguagem. Pode representar Comprometimento Cognitivo Leve (CCL) — estágio intermediário com risco aumentado de progressão para demência.",
      recommendations: [
        "Encaminhar para avaliação neuropsicológica completa",
        "Rastrear causas reversíveis: hipotireoidismo, déficit de B12, anemia, depressão",
        "Programa de reabilitação cognitiva com terapeuta ocupacional",
        "Orientar família sobre estratégias compensatórias (agendas, alarmes, rotina fixa)",
        "Atividade física supervisionada (caminhada, dança, tai chi)",
        "Reavaliação em 3 a 6 meses",
      ],
      nanda: [
        { codigo: "00128", diagnostico: "Confusão crônica", relacionado: "Declínio cognitivo progressivo", evidenciado: "Alteração na interpretação e memória" },
        { codigo: "00131", diagnostico: "Memória prejudicada", relacionado: "Comprometimento neurocognitivo", evidenciado: "Incapacidade de recordar informações recentes" },
        { codigo: "00051", diagnostico: "Comunicação verbal prejudicada", relacionado: "Disfunção cognitiva", evidenciado: "Dificuldade para encontrar palavras" },
      ],
      nic: [
        { codigo: "4720", intervencao: "Estimulação Cognitiva", descricao: "Promover atividades que estimulem o pensamento, memória e orientação." },
        { codigo: "4760", intervencao: "Treinamento de Memória", descricao: "Facilitar a memória por meio de exercícios estruturados e pistas mnemônicas." },
        { codigo: "5240", intervencao: "Aconselhamento", descricao: "Orientar paciente e família sobre o processo de CCL e estratégias de enfrentamento." },
        { codigo: "6460", intervencao: "Manejo da Demência", descricao: "Reduzir o impacto do declínio cognitivo por meio de ambiente terapêutico estruturado." },
      ],
      noc: [
        { codigo: "0900", resultado: "Cognição", meta: "Manter ou melhorar orientação, memória e atenção" },
        { codigo: "0901", resultado: "Orientação Cognitiva", meta: "Reconhecer pessoas, lugares e tempo" },
        { codigo: "1401", resultado: "Autocontrole do Pensamento Distorcido", meta: "Reduzir confusão e pensamentos desorganizados" },
      ],
    },
    critical: {
      interpretation: "A pontuação indica déficit cognitivo significativo, sugestivo de síndrome demencial. Há comprometimento relevante de múltiplos domínios cognitivos que afetam a funcionalidade e a autonomia do paciente. Investigação diagnóstica urgente é necessária.",
      recommendations: [
        "Encaminhar urgentemente para neurologista ou geriatra",
        "Solicitar neuroimagem (TC ou RM de crânio) e avaliação laboratorial completa",
        "Avaliação da capacidade de tomada de decisão e tutela legal",
        "Orientar cuidadores sobre segurança no ambiente domiciliar",
        "Considerar terapia farmacológica (inibidores de colinesterase se Alzheimer confirmado)",
        "Avaliar sobrecarga do cuidador e oferecer suporte",
        "Monitoramento mensal",
      ],
      nanda: [
        { codigo: "00128", diagnostico: "Confusão crônica", relacionado: "Déficit neurocognitivo grave", evidenciado: "Desorientação, prejuízo grave de memória" },
        { codigo: "00131", diagnostico: "Memória prejudicada", relacionado: "Processo demencial", evidenciado: "Incapacidade de recordar eventos recentes e remotos" },
        { codigo: "00109", diagnostico: "Déficit no autocuidado para banho", relacionado: "Deterioração cognitiva", evidenciado: "Incapacidade de realizar higiene independentemente" },
        { codigo: "00035", diagnostico: "Risco de lesão", relacionado: "Prejuízo cognitivo com deambulação insegura", evidenciado: "Desorientação espacial" },
        { codigo: "00125", diagnostico: "Desesperança", relacionado: "Doença crônica progressiva", evidenciado: "Passividade e isolamento" },
      ],
      nic: [
        { codigo: "6460", intervencao: "Manejo da Demência", descricao: "Promover ambiente seguro, rotina previsível e estimulação adequada." },
        { codigo: "0840", intervencao: "Manejo da Pressão", descricao: "Minimizar risco de úlceras por pressão em pacientes com mobilidade reduzida." },
        { codigo: "6486", intervencao: "Manejo Ambiental: Segurança", descricao: "Remover objetos perigosos, instalar grades, sinalização e alarmes." },
        { codigo: "7040", intervencao: "Apoio ao Cuidador", descricao: "Oferecer suporte emocional, educação e recursos ao cuidador familiar." },
        { codigo: "4720", intervencao: "Estimulação Cognitiva", descricao: "Atividades estruturadas para estimulação sensorial e cognitiva." },
      ],
      noc: [
        { codigo: "0900", resultado: "Cognição", meta: "Minimizar a progressão do declínio cognitivo" },
        { codigo: "0307", resultado: "Autocuidado: atividades instrumentais da vida diária", meta: "Maximizar independência com suporte adequado" },
        { codigo: "1902", resultado: "Controle do Risco", meta: "Reduzir risco de quedas, lesões e deambulação insegura" },
        { codigo: "2600", resultado: "Enfrentamento dos Problemas pela Família", meta: "Família capaz de manejar os cuidados com segurança" },
      ],
    },
  },

  Katz: {
    normal: {
      interpretation: "O paciente é independente para todas as 6 Atividades Básicas da Vida Diária (ABVDs): banho, vestir-se, higiene, transferência, continência e alimentação. Excelente capacidade funcional.",
      recommendations: [
        "Manter programa de atividade física para preservar força e equilíbrio",
        "Prevenção de quedas: avaliação domiciliar e exercícios de equilíbrio",
        "Reavaliação anual ou após eventos agudos (internação, cirurgia, fratura)",
      ],
      nanda: [],
      nic: [],
      noc: [],
    },
    attention: {
      interpretation: "O paciente apresenta dependência em 1 a 4 atividades básicas, indicando comprometimento funcional moderado. A independência parcial requer intervenção para prevenir declínio adicional e manter a qualidade de vida.",
      recommendations: [
        "Programa de fisioterapia para fortalecimento muscular e equilíbrio",
        "Terapia ocupacional para adaptação do ambiente e uso de órteses",
        "Avaliar necessidade de cuidador domiciliar ou suporte formal",
        "Instalar adaptações: barras de apoio, assento elevado, chuveiro com banco",
        "Revisar medicamentos que afetam equilíbrio (benzodiazepínicos, anti-hipertensivos)",
        "Reavaliação em 3 meses",
      ],
      nanda: [
        { codigo: "00109", diagnostico: "Déficit no autocuidado para banho", relacionado: "Comprometimento musculoesquelético ou cognitivo", evidenciado: "Incapacidade de realizar higiene corporal" },
        { codigo: "00102", diagnostico: "Déficit no autocuidado para alimentação", relacionado: "Fraqueza ou disfagia", evidenciado: "Incapacidade de levar alimento à boca" },
        { codigo: "00108", diagnostico: "Déficit no autocuidado para higiene íntima", relacionado: "Imobilidade parcial", evidenciado: "Incapacidade de realizar higiene após eliminações" },
      ],
      nic: [
        { codigo: "1800", intervencao: "Assistência no Autocuidado", descricao: "Auxiliar nas AVDs respeitando o máximo de independência do paciente." },
        { codigo: "0221", intervencao: "Terapia de Exercícios: Deambulação", descricao: "Estimular mobilidade segura e progressiva." },
        { codigo: "6480", intervencao: "Manejo Ambiental", descricao: "Adaptar o domicílio para segurança e acessibilidade." },
      ],
      noc: [
        { codigo: "0300", resultado: "Autocuidado: atividades da vida diária", meta: "Aumentar grau de independência nas AVDs" },
        { codigo: "0200", resultado: "Deambulação", meta: "Manter ou recuperar a capacidade de deambular com segurança" },
        { codigo: "1902", resultado: "Controle do Risco", meta: "Reduzir risco de quedas e lesões" },
      ],
    },
    critical: {
      interpretation: "O paciente apresenta dependência grave (0 a 1 atividade independente), caracterizando dependência total para as ABVDs. Requer cuidados integrais e planejamento multidisciplinar urgente.",
      recommendations: [
        "Instituir cuidador formal ou familiar com capacitação",
        "Avaliação de risco de úlceras por pressão (Escala de Braden)",
        "Programa de mudança de decúbito e cuidados com pele",
        "Fisioterapia motora para manutenção de amplitude de movimento",
        "Avaliar necessidade de sonda enteral se disfagia presente",
        "Planejar possível institucionalização ou cuidados paliativos",
        "Suporte à família/cuidador: grupos de apoio e orientação",
      ],
      nanda: [
        { codigo: "00109", diagnostico: "Déficit no autocuidado para banho", relacionado: "Imobilidade total", evidenciado: "Dependência total para higiene" },
        { codigo: "00102", diagnostico: "Déficit no autocuidado para alimentação", relacionado: "Disfagia/imobilidade", evidenciado: "Dependência total para alimentação" },
        { codigo: "00085", diagnostico: "Mobilidade física prejudicada", relacionado: "Déficit neuromuscular grave", evidenciado: "Incapacidade de movimentar-se no leito" },
        { codigo: "00046", diagnostico: "Integridade tissular prejudicada", relacionado: "Imobilidade prolongada", evidenciado: "Úlcera por pressão" },
        { codigo: "00015", diagnostico: "Risco de constipação", relacionado: "Imobilidade e dieta inadequada", evidenciado: "Eliminação intestinal irregular" },
      ],
      nic: [
        { codigo: "1800", intervencao: "Assistência no Autocuidado", descricao: "Realizar cuidados integrais com técnica adequada e dignidade." },
        { codigo: "3540", intervencao: "Prevenção de Úlceras por Pressão", descricao: "Mudança de decúbito a cada 2 horas, uso de colchão especial." },
        { codigo: "1050", intervencao: "Alimentação", descricao: "Assistência total ou parcial na alimentação com consistência adequada." },
        { codigo: "7040", intervencao: "Apoio ao Cuidador", descricao: "Capacitar e apoiar o cuidador para os cuidados domiciliares." },
        { codigo: "0740", intervencao: "Cuidados com o Paciente no Leito", descricao: "Promover conforto, higiene e prevenção de complicações do imobilismo." },
      ],
      noc: [
        { codigo: "0300", resultado: "Autocuidado: AVDs", meta: "Manter dignidade e conforto mesmo com dependência total" },
        { codigo: "1101", resultado: "Integridade tissular: pele e mucosas", meta: "Ausência de úlceras por pressão" },
        { codigo: "0500", resultado: "Continência intestinal", meta: "Manter eliminação intestinal regular" },
        { codigo: "2600", resultado: "Enfrentamento dos Problemas pela Família", meta: "Cuidadores capazes de realizar cuidados com segurança" },
      ],
    },
  },

  Lawton: {
    normal: {
      interpretation: "O paciente é independente nas Atividades Instrumentais da Vida Diária (AIVDs): uso do telefone, transporte, compras, preparo de refeições, trabalho doméstico, medicamentos e finanças. Capacidade funcional instrumental preservada.",
      recommendations: [
        "Manter engajamento em atividades domésticas e sociais",
        "Estimular autonomia e tomada de decisão",
        "Reavaliação anual",
      ],
      nanda: [],
      nic: [],
      noc: [],
    },
    attention: {
      interpretation: "O paciente apresenta dificuldade em atividades instrumentais complexas, com dependência parcial. Há comprometimento da autonomia em domínios como gerenciamento financeiro, transporte ou preparo de refeições, impactando a vida independente.",
      recommendations: [
        "Terapia ocupacional para treino das AIVDs afetadas",
        "Avaliação de risco de segurança domiciliar (uso do fogão, finanças)",
        "Envolver família no suporte às atividades comprometidas",
        "Tecnologias assistivas: aplicativos de lembrete, transporte por aplicativo",
        "Reavaliação em 3 a 6 meses",
      ],
      nanda: [
        { codigo: "00098", diagnostico: "Manutenção do lar prejudicada", relacionado: "Comprometimento funcional", evidenciado: "Incapacidade de realizar tarefas domésticas" },
        { codigo: "00193", diagnostico: "Automutilação", relacionado: "Dificuldade de adaptação", evidenciado: "Isolamento e perda de papéis sociais" },
        { codigo: "00188", diagnostico: "Comportamento de saúde propenso a risco", relacionado: "Não adesão ao tratamento", evidenciado: "Dificuldade para gerenciar medicamentos" },
      ],
      nic: [
        { codigo: "7310", intervencao: "Assistência no Autocuidado: AIVDs", descricao: "Treinar e apoiar as atividades instrumentais afetadas." },
        { codigo: "2380", intervencao: "Manejo da Medicação", descricao: "Organizar medicamentos, usar caixas semanais ou alarmes." },
        { codigo: "5100", intervencao: "Socialização", descricao: "Estimular participação em grupos e atividades comunitárias." },
      ],
      noc: [
        { codigo: "0307", resultado: "Autocuidado: AIVDs", meta: "Melhorar desempenho nas atividades instrumentais" },
        { codigo: "1608", resultado: "Controle dos Sintomas", meta: "Paciente capaz de gerenciar saúde de forma mais autônoma" },
        { codigo: "1503", resultado: "Envolvimento Social", meta: "Manter participação em atividades sociais e comunitárias" },
      ],
    },
    critical: {
      interpretation: "O paciente apresenta dependência grave nas AIVDs, com incapacidade de gerenciar de forma independente atividades como finanças, medicamentos e preparo de alimentos. A segurança e a qualidade de vida estão seriamente comprometidas.",
      recommendations: [
        "Avaliação de curatela ou representação legal para finanças",
        "Implementar sistema de dose de medicamentos preparada por cuidador",
        "Suporte alimentar estruturado (serviço de refeições ou cuidador)",
        "Terapia ocupacional intensiva",
        "Avaliar necessidade de moradia assistida ou institucionalização",
        "Plano de cuidados multidisciplinar com medicina, enfermagem e serviço social",
      ],
      nanda: [
        { codigo: "00098", diagnostico: "Manutenção do lar prejudicada", relacionado: "Incapacidade funcional grave", evidenciado: "Ambiente domiciliar inseguro" },
        { codigo: "00004", diagnostico: "Risco de infecção", relacionado: "Higiene domiciliar inadequada", evidenciado: "" },
        { codigo: "00078", diagnostico: "Gerenciamento de saúde ineficaz", relacionado: "Complexidade do regime terapêutico", evidenciado: "Não adesão à medicação" },
      ],
      nic: [
        { codigo: "7310", intervencao: "Assistência no Autocuidado: AIVDs", descricao: "Suporte integral para atividades instrumentais." },
        { codigo: "2380", intervencao: "Manejo da Medicação", descricao: "Preparar e supervisionar medicamentos diariamente." },
        { codigo: "7400", intervencao: "Orientação no Sistema de Saúde", descricao: "Auxiliar o paciente e família a acessar recursos de saúde e assistência social." },
      ],
      noc: [
        { codigo: "0307", resultado: "Autocuidado: AIVDs", meta: "Manter segurança com suporte formal ou familiar" },
        { codigo: "1813", resultado: "Conhecimento: regime de tratamento", meta: "Cuidador capaz de gerenciar medicamentos e dieta" },
        { codigo: "2600", resultado: "Enfrentamento pela Família", meta: "Família organizada para suprir as necessidades do paciente" },
      ],
    },
  },

  GDS: {
    normal: {
      interpretation: "Rastreamento negativo para depressão geriátrica. O paciente não apresenta número significativo de sintomas depressivos no momento da avaliação.",
      recommendations: [
        "Manter engajamento social e atividades prazerosas",
        "Atividade física regular como protetor do humor",
        "Rastrear novamente se houver eventos estressores (luto, diagnóstico grave)",
        "Reavaliação anual",
      ],
      nanda: [],
      nic: [],
      noc: [],
    },
    attention: {
      interpretation: "Rastreamento positivo para depressão leve a moderada. O paciente apresenta entre 6 e 10 sintomas depressivos, com impacto na qualidade de vida, humor, motivação e funcionalidade. Intervenção terapêutica é indicada.",
      recommendations: [
        "Psicoterapia — Terapia Cognitivo-Comportamental (TCC) é a abordagem com maior evidência",
        "Avaliação psiquiátrica para considerar farmacoterapia (SSRIs: sertralina, escitalopram)",
        "Atividade física aeróbica com efeito antidepressivo comprovado",
        "Estimular participação em grupos de convivência e atividades de lazer",
        "Avaliar rede de suporte social e familiar",
        "Identificar e tratar causas orgânicas: hipotireoidismo, anemia, dor crônica",
        "Reavaliação em 4 semanas",
      ],
      nanda: [
        { codigo: "00124", diagnostico: "Desesperança", relacionado: "Perdas acumuladas e isolamento social", evidenciado: "Verbalização de falta de perspectiva" },
        { codigo: "00054", diagnostico: "Isolamento social", relacionado: "Humor deprimido", evidenciado: "Recolhimento e recusa de atividades sociais" },
        { codigo: "00093", diagnostico: "Fadiga", relacionado: "Alteração do humor", evidenciado: "Relato de cansaço persistente sem causa física" },
      ],
      nic: [
        { codigo: "5270", intervencao: "Suporte Emocional", descricao: "Escuta ativa, validação dos sentimentos e estímulo à expressão emocional." },
        { codigo: "5330", intervencao: "Manejo do Humor", descricao: "Identificar padrões de humor e implementar estratégias para melhora." },
        { codigo: "5100", intervencao: "Socialização", descricao: "Estimular participação em grupos, saídas e atividades coletivas." },
        { codigo: "0200", intervencao: "Promoção do Exercício", descricao: "Incentivar atividade física regular como estratégia antidepressiva." },
      ],
      noc: [
        { codigo: "1204", resultado: "Equilíbrio do Humor", meta: "Reduzir intensidade e frequência dos sintomas depressivos" },
        { codigo: "1302", resultado: "Enfrentamento", meta: "Desenvolver estratégias adaptativas para lidar com perdas e limitações" },
        { codigo: "1503", resultado: "Envolvimento Social", meta: "Retomar participação em atividades sociais" },
      ],
    },
    critical: {
      interpretation: "Rastreamento fortemente positivo para depressão grave. Com 11 ou mais pontos, há alto risco de comprometimento funcional severo, ideação suicida e deterioração clínica. Avaliação e intervenção imediatas são necessárias.",
      recommendations: [
        "Avaliação psiquiátrica URGENTE — descartar risco de suicídio",
        "Perguntar diretamente sobre pensamentos suicidas (ideação, plano, intenção)",
        "Iniciar farmacoterapia antidepressiva sem demora",
        "Considerar internação psiquiátrica se risco elevado",
        "Notificar familiar ou cuidador responsável",
        "Acompanhamento semanal nas primeiras 4 semanas de tratamento",
        "Psicoterapia intensiva em conjunto com farmacoterapia",
        "Tratar comorbidades físicas que contribuem para depressão",
      ],
      nanda: [
        { codigo: "00124", diagnostico: "Desesperança", relacionado: "Depressão grave e isolamento", evidenciado: "Verbalização de ausência de futuro" },
        { codigo: "00150", diagnostico: "Risco de suicídio", relacionado: "Depressão grave", evidenciado: "Ideação suicida verbal ou implícita" },
        { codigo: "00054", diagnostico: "Isolamento social", relacionado: "Retraimento depressivo grave", evidenciado: "Ausência de interação social" },
        { codigo: "00093", diagnostico: "Fadiga", relacionado: "Depressão grave", evidenciado: "Incapacidade de realizar atividades cotidianas" },
        { codigo: "00132", diagnostico: "Dor aguda", relacionado: "Comorbidade somática", evidenciado: "Queixas físicas sem causa orgânica definida" },
      ],
      nic: [
        { codigo: "6340", intervencao: "Prevenção do Suicídio", descricao: "Avaliar risco, remover meios letais, contratar segurança verbal, acionar suporte." },
        { codigo: "5270", intervencao: "Suporte Emocional", descricao: "Presença terapêutica, escuta ativa e validação constante." },
        { codigo: "5330", intervencao: "Manejo do Humor", descricao: "Monitorar estado de humor, estabelecer metas realistas progressivas." },
        { codigo: "2300", intervencao: "Administração de Medicamentos", descricao: "Supervisionar uso correto de antidepressivos e monitorar efeitos adversos." },
        { codigo: "7040", intervencao: "Apoio ao Cuidador", descricao: "Orientar família sobre sinais de alerta e como oferecer suporte seguro." },
      ],
      noc: [
        { codigo: "1204", resultado: "Equilíbrio do Humor", meta: "Estabilizar humor e reduzir sintomas depressivos graves" },
        { codigo: "1408", resultado: "Autocontrole do Humor Deprimido", meta: "Paciente identifica e relata piora para a equipe" },
        { codigo: "1409", resultado: "Autocontrole dos Impulsos Suicidas", meta: "Ausência de tentativas ou ideação ativa" },
        { codigo: "2600", resultado: "Enfrentamento pela Família", meta: "Família capaz de identificar sinais de crise e acionar ajuda" },
      ],
    },
  },

  AGA: {
    normal: {
      interpretation: "A Avaliação Geriátrica Ampla indica condição clínica satisfatória, com bom desempenho nos domínios de cognição, humor, mobilidade, nutrição, suporte social e adesão ao tratamento.",
      recommendations: [
        "Manter acompanhamento geriátrico semestral",
        "Continuar atividade física, engajamento social e alimentação adequada",
        "Reavaliação anual com AGA",
      ],
      nanda: [],
      nic: [],
      noc: [],
    },
    attention: {
      interpretation: "A avaliação identifica risco moderado em múltiplos domínios geriátricos. Há vulnerabilidades que, se não tratadas, podem progredir para dependência funcional e piora da qualidade de vida. Intervenção multidisciplinar precoce é recomendada.",
      recommendations: [
        "Elaborar plano de cuidados individualizado e multidisciplinar",
        "Fisioterapia para mobilidade e prevenção de quedas",
        "Nutrólogo/nutricionista para avaliação do estado nutricional",
        "Revisar polifarmácia com farmacêutico clínico",
        "Fortalecer rede de suporte social",
        "Reavaliação em 3 meses",
      ],
      nanda: [
        { codigo: "00004", diagnostico: "Risco de infecção", relacionado: "Estado nutricional comprometido", evidenciado: "" },
        { codigo: "00155", diagnostico: "Risco de quedas", relacionado: "Comprometimento do equilíbrio e mobilidade", evidenciado: "" },
        { codigo: "00078", diagnostico: "Gerenciamento de saúde ineficaz", relacionado: "Polifarmácia e adesão parcial", evidenciado: "Relato de esquecimento de medicamentos" },
      ],
      nic: [
        { codigo: "6490", intervencao: "Prevenção de Quedas", descricao: "Avaliar risco, adaptar ambiente, orientar uso de dispositivos auxiliares." },
        { codigo: "1100", intervencao: "Manejo da Nutrição", descricao: "Orientar dieta equilibrada e suplementação se necessário." },
        { codigo: "2380", intervencao: "Manejo da Medicação", descricao: "Revisar e simplificar regime medicamentoso, promover adesão." },
        { codigo: "5100", intervencao: "Socialização", descricao: "Estimular participação em atividades comunitárias e grupos de idosos." },
      ],
      noc: [
        { codigo: "1902", resultado: "Controle do Risco", meta: "Reduzir riscos identificados nos domínios comprometidos" },
        { codigo: "1004", resultado: "Estado Nutricional", meta: "Atingir e manter peso e composição corporal adequados" },
        { codigo: "0200", resultado: "Deambulação", meta: "Manter mobilidade segura e independente" },
      ],
    },
    critical: {
      interpretation: "A avaliação geriátrica revela risco elevado em múltiplos domínios, indicando síndrome de fragilidade ou condição de alta vulnerabilidade. Intervenção urgente e abrangente é necessária para evitar eventos adversos graves como quedas, internações e morte.",
      recommendations: [
        "Internação ou consulta geriátrica urgente para plano de cuidados intensivo",
        "Avaliação de fragilidade (Critérios de Fried)",
        "Reabilitação intensiva — fisioterapia, terapia ocupacional e fonoaudiologia",
        "Suporte nutricional especializado — avaliar nutrição enteral",
        "Revisão completa de medicamentos — desprescrição quando indicada",
        "Avaliação de indicação de cuidados paliativos",
        "Suporte formal de cuidadores e avaliação de institucionalização",
        "Monitoramento semanal com equipe multidisciplinar",
      ],
      nanda: [
        { codigo: "00155", diagnostico: "Risco de quedas", relacionado: "Fraqueza muscular e comprometimento do equilíbrio grave", evidenciado: "" },
        { codigo: "00085", diagnostico: "Mobilidade física prejudicada", relacionado: "Sarcopenia e fraqueza muscular", evidenciado: "Limitação grave de movimentos" },
        { codigo: "00002", diagnostico: "Nutrição desequilibrada: menos que as necessidades corporais", relacionado: "Disfagia e anorexia", evidenciado: "Perda de peso involuntária" },
        { codigo: "00078", diagnostico: "Gerenciamento de saúde ineficaz", relacionado: "Polifarmácia e comprometimento cognitivo", evidenciado: "" },
        { codigo: "00053", diagnostico: "Isolamento social", relacionado: "Limitação de mobilidade e depressão", evidenciado: "Ausência de relações sociais" },
      ],
      nic: [
        { codigo: "6490", intervencao: "Prevenção de Quedas", descricao: "Protocolo intensivo de prevenção de quedas e lesões." },
        { codigo: "0221", intervencao: "Terapia de Exercícios: Deambulação", descricao: "Programa estruturado de reabilitação motora." },
        { codigo: "1100", intervencao: "Manejo da Nutrição", descricao: "Suporte nutricional intensivo, suplementação e monitoramento de peso." },
        { codigo: "7040", intervencao: "Apoio ao Cuidador", descricao: "Capacitação intensiva do cuidador e acesso a recursos comunitários." },
        { codigo: "7400", intervencao: "Orientação no Sistema de Saúde", descricao: "Facilitar acesso a benefícios, serviços sociais e cuidados continuados." },
      ],
      noc: [
        { codigo: "1902", resultado: "Controle do Risco", meta: "Minimizar eventos adversos graves" },
        { codigo: "1004", resultado: "Estado Nutricional", meta: "Estabilizar peso e melhorar ingestão alimentar" },
        { codigo: "0204", resultado: "Consequências da Imobilidade: fisiológicas", meta: "Prevenir complicações do imobilismo" },
        { codigo: "2600", resultado: "Enfrentamento pela Família", meta: "Família e cuidadores preparados para cuidados complexos" },
      ],
    },
  },
};

export function getInterpretation(testId, alertLevel) {
  return INTERPRETATIONS[testId]?.[alertLevel] || null;
}