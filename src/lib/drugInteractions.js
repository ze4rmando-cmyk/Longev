// =============================================
// BANCO DE INTERAÇÕES MEDICAMENTOSAS GRAVES
// Baseado em: Micromedex, Drug Interactions Checker,
// Critérios de Beers 2023, UpToDate, ANVISA
// =============================================

// Mapeamento de palavras-chave para classes/drogas reconhecidas
export const DRUG_KEYWORDS = {
  // Anticoagulantes
  varfarina: ["varfarina", "warfarina", "coumadin"],
  heparina: ["heparina", "enoxaparina", "clexane", "fraxiparina"],
  apixabana: ["apixabana", "eliquis"],
  rivaroxabana: ["rivaroxabana", "xarelto"],
  dabigatrana: ["dabigatrana", "pradaxa"],

  // Antiagregantes
  aas: ["ácido acetilsalicílico", "aas", "aspirina", "asp "],
  clopidogrel: ["clopidogrel", "plavix"],

  // Anti-hipertensivos
  ieca: ["enalapril", "captopril", "ramipril", "lisinopril", "perindopril"],
  bra: ["losartana", "valsartana", "olmesartana", "candesartana", "telmisartana", "irbesartana"],
  betabloqueador: ["atenolol", "metoprolol", "carvedilol", "propranolol", "bisoprolol", "nebivolol"],
  bloqueador_calcio: ["anlodipino", "amlodipino", "nifedipina", "verapamil", "diltiazem"],
  tiazidico: ["hidroclorotiazida", "clortalidona", "indapamida"],
  espironolactona: ["espironolactona", "aldactone"],

  // Diuréticos
  furosemida: ["furosemida", "lasix"],

  // Antidiabéticos
  insulina: ["insulina", "humulin", "novolin", "lantus", "glargina"],
  sulfonilureia: ["glibenclamida", "glipizida", "gliclazida", "glimepirida"],
  metformina: ["metformina", "glifage"],
  sglt2: ["dapagliflozina", "empagliflozina", "canagliflozina"],

  // Hipolipemiantes
  estatina: ["sinvastatina", "atorvastatina", "rosuvastatina", "pravastatina", "lovastatina"],
  fibrato: ["fenofibrato", "genfibrozila", "bezafibrato"],

  // Antidepressivos
  isrs: ["sertralina", "fluoxetina", "paroxetina", "escitalopram", "citalopram", "fluvoxamina"],
  imao: ["fenelzina", "tranilcipromina", "selegilina"],
  tricíclico: ["amitriptilina", "nortriptilina", "imipramina", "clomipramina", "desipramina"],
  venlafaxina: ["venlafaxina", "effexor"],
  mirtazapina: ["mirtazapina", "remeron"],

  // Antipsicóticos
  antipsicótico: ["haloperidol", "risperidona", "quetiapina", "olanzapina", "clozapina", "ziprasidona", "aripiprazol"],
  fenotiazina: ["clorpromazina", "levomepromazina", "tioridazina"],

  // Benzodiazepínicos
  benzodiazepínico: ["diazepam", "clonazepam", "lorazepam", "alprazolam", "midazolam", "bromazepam", "nitrazepam"],

  // Opióides
  opioide: ["morfina", "oxicodona", "fentanil", "codeína", "tramadol", "meperidina", "metadona", "buprenorfina"],

  // Antibióticos
  quinolona: ["ciprofloxacino", "levofloxacino", "moxifloxacino", "norfloxacino"],
  macrolídeo: ["azitromicina", "claritromicina", "eritromicina"],
  aminoglicosídeo: ["gentamicina", "amicacina", "tobramicina"],
  metronidazol: ["metronidazol", "flagyl"],
  fluconazol: ["fluconazol", "diflucan"],

  // Antiarrítmicos
  amiodarona: ["amiodarona", "cordarone"],
  digoxina: ["digoxina", "lanoxin"],
  quinidina: ["quinidina"],

  // Anticonvulsivantes
  carbamazepina: ["carbamazepina", "tegretol"],
  fenitoína: ["fenitoína", "hidantal"],
  fenobarbital: ["fenobarbital", "gardenal"],
  ácido_valproico: ["ácido valproico", "valproato", "depakote", "depakene"],
  lamotrigina: ["lamotrigina", "lamictal"],

  // AINEs
  aine: ["ibuprofeno", "diclofenaco", "naproxeno", "cetoprofeno", "meloxicam", "nimesulida", "indometacina", "piroxicam"],

  // Corticoides
  corticoide: ["prednisona", "prednisolona", "dexametasona", "hidrocortisona", "betametasona", "triancinolona"],

  // Tireoid
  levotiroxina: ["levotiroxina", "euthyrox", "puran"],

  // IBP
  ibp: ["omeprazol", "pantoprazol", "esomeprazol", "lansoprazol", "rabeprazol"],

  // Antimicóticos
  cetoconazol: ["cetoconazol"],
  itraconazol: ["itraconazol"],

  // Imunossupressores
  metotrexato: ["metotrexato", "methotrexate"],
  ciclosporina: ["ciclosporina", "sandimmun"],
  tacrolimus: ["tacrolimus", "prograf"],

  // Outros
  lítio: ["lítio", "carbolitium", "lithium"],
  teofilina: ["teofilina", "aminofilina"],
  tramadol: ["tramadol", "tramal"],
  sildenafila: ["sildenafila", "viagra", "cialis", "tadalafila"],
  cálcio: ["carbonato de cálcio", "cálcio", "calciovit"],
  ferro: ["sulfato ferroso", "ferro", "noripurum"],
  anticolinérgico: ["oxibutinina", "biperideno", "tri-hexifenidil", "escopolamina", "prometazina"],
};

// =============================================
// BANCO DE INTERAÇÕES — severity: critical | major | moderate
// =============================================
export const INTERACTIONS = [
  // ── ANTICOAGULANTES ──
  {
    drugs: ["varfarina", "aas"],
    severity: "critical",
    title: "Varfarina + AAS",
    description: "Risco muito elevado de sangramento grave (gastrointestinal, intracraniano). A combinação potencializa o efeito anticoagulante e inibe a agregação plaquetária simultaneamente.",
    recommendation: "Evitar combinação. Se inevitável, monitorar INR com frequência máxima e usar protetor gástrico (IBP). Risco de sangramento fatal.",
    mechanism: "Sinergismo anticoagulante + antiagregante plaquetário.",
  },
  {
    drugs: ["varfarina", "aine"],
    severity: "critical",
    title: "Varfarina + AINE",
    description: "AINEs aumentam o INR e causam erosão da mucosa gástrica, elevando drasticamente o risco de sangramento digestivo alto.",
    recommendation: "Contraindicado. Substituir AINE por paracetamol para analgesia. Monitorar INR.",
    mechanism: "Inibição plaquetária + lesão mucosa gástrica + possível deslocamento proteico da varfarina.",
  },
  {
    drugs: ["varfarina", "amiodarona"],
    severity: "critical",
    title: "Varfarina + Amiodarona",
    description: "Amiodarona inibe o metabolismo hepático da varfarina (CYP2C9), podendo dobrar ou triplicar o INR e causar sangramentos graves.",
    recommendation: "Reduzir dose de varfarina em 30–50%. Monitorar INR semanalmente até estabilização.",
    mechanism: "Inibição de CYP2C9 e CYP3A4 pelo metabolismo da amiodarona.",
  },
  {
    drugs: ["varfarina", "fluconazol"],
    severity: "critical",
    title: "Varfarina + Fluconazol",
    description: "Fluconazol inibe fortemente CYP2C9, aumentando drasticamente os níveis de varfarina e o risco de sangramento.",
    recommendation: "Monitorar INR a cada 2–3 dias durante o tratamento. Reduzir dose da varfarina antecipadamente.",
    mechanism: "Inibição potente de CYP2C9.",
  },
  {
    drugs: ["varfarina", "metronidazol"],
    severity: "critical",
    title: "Varfarina + Metronidazol",
    description: "Metronidazol inibe o metabolismo da varfarina e altera flora intestinal (reduz vitamina K bacteriana), elevando INR de forma expressiva.",
    recommendation: "Monitorar INR a cada 2–3 dias. Reduzir dose de varfarina. Preferir outro antibiótico se possível.",
    mechanism: "Inibição CYP2C9 e redução de vitamina K produzida pela flora intestinal.",
  },
  {
    drugs: ["varfarina", "macrolídeo"],
    severity: "major",
    title: "Varfarina + Macrolídeo (Azitromicina/Claritromicina)",
    description: "Macrolídeos inibem metabolismo da varfarina e reduzem vitamina K intestinal, podendo elevar significativamente o INR.",
    recommendation: "Monitorar INR durante e após antibioticoterapia. Pode ser necessário ajustar dose.",
    mechanism: "Inibição CYP3A4 e redução de flora intestinal produtora de vitamina K.",
  },
  {
    drugs: ["varfarina", "metotrexato"],
    severity: "major",
    title: "Varfarina + Metotrexato",
    description: "Aumenta o efeito anticoagulante e pode potencializar toxicidade do metotrexato.",
    recommendation: "Monitorar INR e sinais de toxicidade do metotrexato frequentemente.",
    mechanism: "Competição por ligação proteica e redução do metabolismo.",
  },

  // ── OPIÓIDES ──
  {
    drugs: ["opioide", "benzodiazepínico"],
    severity: "critical",
    title: "Opioide + Benzodiazepínico",
    description: "⚠ RISCO DE MORTE. Combinação aumenta exponencialmente o risco de depressão respiratória grave e parada respiratória.",
    recommendation: "CONTRAINDICADO. Black Box Warning FDA. Se uso concomitante inevitável, monitorizar continuamente SpO₂ e nível de consciência. Ter naloxona disponível.",
    mechanism: "Depressão sinérgica do centro respiratório no SNC.",
  },
  {
    drugs: ["opioide", "tricíclico"],
    severity: "critical",
    title: "Opioide + Antidepressivo Tricíclico",
    description: "Risco elevado de depressão respiratória, sedação excessiva e síndrome serotoninérgica.",
    recommendation: "Evitar combinação. Se necessário, usar doses mínimas e monitorar rigorosamente.",
    mechanism: "Somação de efeitos sedativos e sobre o sistema serotoninérgico.",
  },
  {
    drugs: ["tramadol", "isrs"],
    severity: "critical",
    title: "Tramadol + ISRS",
    description: "Alto risco de síndrome serotoninérgica (febre, agitação, tremores, rigidez, taquicardia) potencialmente fatal. Tramadol também reduz limiar convulsivo.",
    recommendation: "Contraindicado. Substituir tramadol por outro analgésico (paracetamol, dipirona). Monitorar sinais de síndrome serotoninérgica.",
    mechanism: "Tramadol inibe recaptação de serotonina, somando-se ao efeito do ISRS.",
  },
  {
    drugs: ["tramadol", "imao"],
    severity: "critical",
    title: "Tramadol + IMAO",
    description: "Risco extremamente elevado de síndrome serotoninérgica grave e convulsões.",
    recommendation: "CONTRAINDICADO. Aguardar 14 dias após suspensão do IMAO antes de usar tramadol.",
    mechanism: "Potencialização do sistema serotoninérgico central.",
  },
  {
    drugs: ["opioide", "imao"],
    severity: "critical",
    title: "Opioide + IMAO",
    description: "Risco de síndrome serotoninérgica e depressão do SNC grave.",
    recommendation: "CONTRAINDICADO. Aguardar 14 dias após IMAO.",
    mechanism: "Inibição do metabolismo de monoaminas + sinergismo opioide.",
  },

  // ── ANTIDEPRESSIVOS ──
  {
    drugs: ["isrs", "imao"],
    severity: "critical",
    title: "ISRS + IMAO",
    description: "Risco de síndrome serotoninérgica potencialmente fatal: hipertermia, agitação, convulsões, colapso cardiovascular.",
    recommendation: "CONTRAINDICADO. Aguardar 14 dias após suspensão do IMAO (ou 5 semanas se fluoxetina) antes de iniciar ISRS.",
    mechanism: "Somação dos efeitos serotoninérgicos centrais.",
  },
  {
    drugs: ["tricíclico", "imao"],
    severity: "critical",
    title: "Tricíclico + IMAO",
    description: "Risco extremamente elevado de síndrome serotoninérgica e crise hipertensiva.",
    recommendation: "CONTRAINDICADO absolutamente.",
    mechanism: "Potencialização serotoninérgica e noradrenérgica intensa.",
  },
  {
    drugs: ["isrs", "aas"],
    severity: "major",
    title: "ISRS + AAS",
    description: "ISRSs inibem a recaptação de serotonina plaquetária, reduzindo agregação plaquetária. Combinação com AAS aumenta significativamente o risco de sangramento digestivo.",
    recommendation: "Se uso concomitante necessário, associar IBP para proteção gástrica. Monitorar sinais de sangramento.",
    mechanism: "Depleção de serotonina plaquetária + inibição de COX-1.",
  },
  {
    drugs: ["isrs", "aine"],
    severity: "major",
    title: "ISRS + AINE",
    description: "Aumenta o risco de sangramento gastrointestinal alto. AINEs potencializam o efeito antiagregante dos ISRSs.",
    recommendation: "Associar IBP. Preferir paracetamol como analgésico. Monitorar sinais de sangramento.",
    mechanism: "Depleção de serotonina plaquetária + inibição COX.",
  },

  // ── ANTIARRÍTMICOS ──
  {
    drugs: ["amiodarona", "digoxina"],
    severity: "critical",
    title: "Amiodarona + Digoxina",
    description: "Amiodarona aumenta os níveis séricos de digoxina em até 70–100%, causando toxicidade digitálica grave: bradicardia, bloqueio AV, arritmias ventriculares.",
    recommendation: "Reduzir dose de digoxina em 50% ao iniciar amiodarona. Monitorar ECG e nível sérico de digoxina.",
    mechanism: "Inibição da P-glicoproteína e redução da eliminação renal da digoxina.",
  },
  {
    drugs: ["amiodarona", "antipsicótico"],
    severity: "critical",
    title: "Amiodarona + Antipsicótico",
    description: "Ambos prolongam o intervalo QTc, com risco de taquicardia ventricular do tipo Torsades de Pointes, que pode evoluir para fibrilação ventricular.",
    recommendation: "Contraindicado na maioria dos casos. Monitorar ECG (QTc) se uso inevitável.",
    mechanism: "Bloqueio aditivo de canais de potássio cardíacos (IKr).",
  },
  {
    drugs: ["amiodarona", "quinolona"],
    severity: "critical",
    title: "Amiodarona + Quinolona",
    description: "Ambos prolongam QTc com risco de Torsades de Pointes.",
    recommendation: "Evitar. Usar antibiótico de classe diferente se possível.",
    mechanism: "Bloqueio aditivo do canal hERG (IKr) cardíaco.",
  },
  {
    drugs: ["amiodarona", "macrolídeo"],
    severity: "major",
    title: "Amiodarona + Macrolídeo",
    description: "Risco de prolongamento do QTc e Torsades de Pointes.",
    recommendation: "Monitorar ECG. Usar azitromicina com cautela, preferir outros antibióticos.",
    mechanism: "Prolongamento aditivo do QTc.",
  },
  {
    drugs: ["amiodarona", "estatina"],
    severity: "major",
    title: "Amiodarona + Estatina (Sinvastatina/Atorvastatina)",
    description: "Amiodarona inibe CYP3A4, aumentando os níveis de estatinas e o risco de miopatia e rabdomiólise.",
    recommendation: "Limitar sinvastatina a 20mg/dia. Preferir rosuvastatina ou pravastatina (menos dependentes de CYP3A4).",
    mechanism: "Inibição de CYP3A4 e CYP2C9 eleva nível sérico das estatinas.",
  },
  {
    drugs: ["digoxina", "furosemida"],
    severity: "major",
    title: "Digoxina + Furosemida",
    description: "Furosemida causa hipocalemia, que potencializa a toxicidade da digoxina: náuseas, vômitos, arritmias.",
    recommendation: "Monitorar potássio sérico rigorosamente. Suplementar potássio se necessário. Monitorar nível de digoxina.",
    mechanism: "Hipocalemia aumenta a ligação da digoxina à Na+/K+-ATPase cardíaca.",
  },
  {
    drugs: ["digoxina", "betabloqueador"],
    severity: "major",
    title: "Digoxina + Betabloqueador",
    description: "Combinação pode causar bradicardia grave e bloqueio AV.",
    recommendation: "Monitorar FC e ECG periodicamente. Titular doses com cuidado.",
    mechanism: "Somação de efeitos cronotrópicos negativos no nódulo sinusal e AV.",
  },
  {
    drugs: ["digoxina", "bloqueador_calcio"],
    severity: "major",
    title: "Digoxina + Verapamil/Diltiazem",
    description: "Verapamil e diltiazem aumentam os níveis séricos de digoxina e somam efeito bradicardizante.",
    recommendation: "Monitorar FC e nível sérico de digoxina. Preferir anlodipino (diidropiridínico) se necessário bloqueador de cálcio.",
    mechanism: "Inibição de P-glicoproteína e bloqueio aditivo do nódulo AV.",
  },

  // ── BETABLOQUEADOR ──
  {
    drugs: ["betabloqueador", "bloqueador_calcio"],
    severity: "major",
    title: "Betabloqueador + Verapamil/Diltiazem",
    description: "Combinação pode causar bradicardia grave, bloqueio AV completo e insuficiência cardíaca aguda.",
    recommendation: "Contraindicado usar verapamil ou diltiazem com betabloqueador. Preferir anlodipino.",
    mechanism: "Bloqueio aditivo do nódulo AV e depressão da contratilidade miocárdica.",
  },

  // ── DIURÉTICOS / ELETRÓLITOS ──
  {
    drugs: ["ieca", "bra"],
    severity: "critical",
    title: "IECA + BRA (Duplo Bloqueio do SRAA)",
    description: "Combinação não oferece benefício adicional e aumenta muito o risco de hipercalemia grave, hipotensão e insuficiência renal aguda.",
    recommendation: "CONTRAINDICADO (exceto casos muito específicos sob supervisão especializada). Preferir monoterapia.",
    mechanism: "Duplo bloqueio do Sistema Renina-Angiotensina-Aldosterona.",
  },
  {
    drugs: ["ieca", "espironolactona"],
    severity: "major",
    title: "IECA + Espironolactona",
    description: "Ambos elevam potássio. Hipercalemia grave pode causar arritmias cardíacas fatais, especialmente em idosos com insuficiência renal.",
    recommendation: "Monitorar potássio sérico a cada 1–3 meses. Manter potássio < 5,5 mEq/L. Evitar em pacientes com TFG < 30.",
    mechanism: "IECA reduz aldosterona; espironolactona bloqueia seu receptor — ambos retêm potássio.",
  },
  {
    drugs: ["bra", "espironolactona"],
    severity: "major",
    title: "BRA + Espironolactona",
    description: "Alto risco de hipercalemia, especialmente em idosos com disfunção renal.",
    recommendation: "Monitorar potássio e creatinina frequentemente. Evitar se K > 5,0 mEq/L.",
    mechanism: "Bloqueio do SRAA + antagonismo da aldosterona — somação da retenção de potássio.",
  },
  {
    drugs: ["furosemida", "aminoglicosídeo"],
    severity: "critical",
    title: "Furosemida + Aminoglicosídeo",
    description: "Potencialização grave de ototoxicidade (surdez irreversível) e nefrotoxicidade.",
    recommendation: "Evitar combinação. Se inevitável, monitorar audiometria e função renal continuamente.",
    mechanism: "Somação dos efeitos tóxicos na orelha interna e nos túbulos renais.",
  },

  // ── AINE ──
  {
    drugs: ["aine", "ieca"],
    severity: "major",
    title: "AINE + IECA",
    description: "AINEs antagonizam o efeito anti-hipertensivo do IECA e podem precipitar insuficiência renal aguda, especialmente em idosos desidratados.",
    recommendation: "Evitar uso crônico. Se dor necessária, preferir paracetamol. Monitorar PA e função renal.",
    mechanism: "Inibição de prostaglandinas renais vasodilatadoras, reduzindo o efeito nefroprotetor do IECA.",
  },
  {
    drugs: ["aine", "bra"],
    severity: "major",
    title: "AINE + BRA",
    description: "AINEs reduzem eficácia anti-hipertensiva e aumentam risco de nefrotoxicidade com BRAs.",
    recommendation: "Evitar uso crônico. Monitorar PA e função renal.",
    mechanism: "Mesma causa que AINE + IECA.",
  },
  {
    drugs: ["aine", "corticoide"],
    severity: "major",
    title: "AINE + Corticoide",
    description: "Risco muito elevado de úlcera péptica e sangramento gastrointestinal alto.",
    recommendation: "Evitar combinação. Se necessário, associar IBP obrigatoriamente.",
    mechanism: "Lesão sinérgica da mucosa gástrica (inibição de prostaglandinas + redução do muco gástrico).",
  },
  {
    drugs: ["aine", "metotrexato"],
    severity: "critical",
    title: "AINE + Metotrexato",
    description: "AINEs reduzem a eliminação renal do metotrexato, causando toxicidade grave: mielossupressão, mucosite, nefrotoxicidade.",
    recommendation: "Contraindicado com metotrexato em doses antineoplásicas. Em baixas doses (artrite), monitorar rigorosamente.",
    mechanism: "Competição pela secreção tubular renal do metotrexato.",
  },
  {
    drugs: ["aine", "lítio"],
    severity: "major",
    title: "AINE + Lítio",
    description: "AINEs reduzem excreção renal do lítio, podendo elevar os níveis séricos para a faixa tóxica (tremores, confusão, arritmias).",
    recommendation: "Monitorar litemia a cada 5–7 dias ao iniciar AINE. Preferir paracetamol.",
    mechanism: "Redução da filtração glomerular e da excreção tubular de lítio.",
  },

  // ── ESTATINAS ──
  {
    drugs: ["estatina", "fibrato"],
    severity: "major",
    title: "Estatina + Fibrato",
    description: "Combinação aumenta significativamente o risco de miopatia e rabdomiólise (destruição muscular grave com insuficiência renal).",
    recommendation: "Evitar combinação, especialmente genfibrozila + estatina. Se necessário, usar fenofibrato + rosuvastatina com monitoramento de CPK.",
    mechanism: "Inibição do metabolismo das estatinas pelo fibrato + efeito direto no músculo.",
  },
  {
    drugs: ["estatina", "fluconazol"],
    severity: "major",
    title: "Estatina + Fluconazol",
    description: "Fluconazol inibe CYP3A4, aumentando níveis de estatinas e risco de miopatia.",
    recommendation: "Suspender temporariamente a estatina durante tratamento com fluconazol, ou usar pravastatina (não metabolizada por CYP).",
    mechanism: "Inibição de CYP3A4 e CYP2C9.",
  },
  {
    drugs: ["estatina", "macrolídeo"],
    severity: "moderate",
    title: "Estatina + Claritromicina/Eritromicina",
    description: "Macrolídeos inibem CYP3A4, podendo elevar níveis de sinvastatina/atorvastatina e risco de miopatia.",
    recommendation: "Suspender temporariamente a estatina durante o antibiótico (curto prazo) ou usar azitromicina.",
    mechanism: "Inibição de CYP3A4.",
  },
  {
    drugs: ["estatina", "ciclosporina"],
    severity: "critical",
    title: "Estatina + Ciclosporina",
    description: "Ciclosporina aumenta drasticamente os níveis de estatinas, com alto risco de rabdomiólise.",
    recommendation: "Contraindicado com a maioria das estatinas. Pravastatina em baixa dose é a opção mais segura.",
    mechanism: "Inibição de OATP1B1 e CYP3A4.",
  },

  // ── ANTIDIABÉTICOS ──
  {
    drugs: ["insulina", "betabloqueador"],
    severity: "major",
    title: "Insulina + Betabloqueador",
    description: "Betabloqueadores mascaram os sintomas adrenérgicos de hipoglicemia (tremor, taquicardia) e podem prolongar a hipoglicemia.",
    recommendation: "Monitorar glicemia com maior frequência. Orientar sobre sintomas residuais da hipoglicemia (sudorese é preservada). Preferir betabloqueadores cardioseletivos.",
    mechanism: "Bloqueio dos receptores beta-2 adrenérgicos que mediam sinais de alerta da hipoglicemia.",
  },
  {
    drugs: ["insulina", "isrs"],
    severity: "moderate",
    title: "Insulina/Hipoglicemiante + ISRS",
    description: "ISRSs podem alterar a sensibilidade à insulina e aumentar risco de hipoglicemia.",
    recommendation: "Monitorar glicemia nos primeiros 15–30 dias ao adicionar ISRS. Ajustar dose se necessário.",
    mechanism: "Alteração da sensibilidade insulínica e do metabolismo da glicose.",
  },
  {
    drugs: ["metformina", "contraste"],
    severity: "major",
    title: "Metformina + Contraste Iodado",
    description: "Risco de acidose lática pelo acúmulo de metformina quando contraste causa insuficiência renal aguda.",
    recommendation: "Suspender metformina 24–48h antes e 48h após uso de contraste iodado IV. Reintroduzir somente após confirmar função renal estável.",
    mechanism: "Insuficiência renal induzida por contraste reduz eliminação da metformina → acúmulo → acidose lática.",
  },

  // ── BENZODIAZEPÍNICOS ──
  {
    drugs: ["benzodiazepínico", "antipsicótico"],
    severity: "major",
    title: "Benzodiazepínico + Antipsicótico",
    description: "Risco elevado de sedação excessiva, hipotensão, depressão respiratória e quedas — especialmente graves em idosos.",
    recommendation: "Usar doses mínimas, monitorar nível de consciência e função respiratória. Planejar retirada gradual do benzodiazepínico.",
    mechanism: "Somação de efeitos depressores do SNC.",
  },
  {
    drugs: ["benzodiazepínico", "tricíclico"],
    severity: "moderate",
    title: "Benzodiazepínico + Antidepressivo Tricíclico",
    description: "Somação de efeitos sedativos e anticolinérgicos — risco elevado de quedas, confusão e retenção urinária em idosos.",
    recommendation: "Evitar combinação em idosos. Se necessário, usar doses mínimas com monitoramento constante.",
    mechanism: "Depressão sinérgica do SNC + efeitos anticolinérgicos somados.",
  },

  // ── ANTICONVULSIVANTES ──
  {
    drugs: ["carbamazepina", "isrs"],
    severity: "major",
    title: "Carbamazepina + ISRS",
    description: "Carbamazepina induz CYP3A4 e reduz os níveis dos ISRSs. Combinação com alguns ISRSs (fluoxetina) também aumenta toxicidade da carbamazepina.",
    recommendation: "Monitorar eficácia do antidepressivo. Monitorar sinais de toxicidade por carbamazepina (diplopia, ataxia, tontura).",
    mechanism: "Indução e inibição recíproca do metabolismo por CYP.",
  },
  {
    drugs: ["carbamazepina", "varfarina"],
    severity: "major",
    title: "Carbamazepina + Varfarina",
    description: "Carbamazepina induz fortemente o metabolismo da varfarina, reduzindo drasticamente o INR e o efeito anticoagulante.",
    recommendation: "Monitorar INR com maior frequência ao iniciar ou suspender carbamazepina. Ajustar dose da varfarina.",
    mechanism: "Indução de CYP2C9 e CYP3A4.",
  },
  {
    drugs: ["ácido_valproico", "carbamazepina"],
    severity: "major",
    title: "Valproato + Carbamazepina",
    description: "Interação bidirecional: valproato inibe o metabolismo da carbamazepina (toxicidade) e a carbamazepina reduz os níveis do valproato.",
    recommendation: "Monitorar níveis séricos de ambos. Ajuste de doses frequente.",
    mechanism: "Inibição/indução enzimática recíproca.",
  },

  // ── LÍTIO ──
  {
    drugs: ["lítio", "ieca"],
    severity: "major",
    title: "Lítio + IECA",
    description: "IECAs reduzem a excreção renal do lítio, elevando os níveis séricos para a faixa tóxica (confusão, tremores, arritmias).",
    recommendation: "Monitorar litemia a cada 5–7 dias ao iniciar IECA. Reduzir dose de lítio se necessário.",
    mechanism: "Redução do sódio circulante pelos IECAs aumenta a reabsorção tubular de lítio.",
  },
  {
    drugs: ["lítio", "bra"],
    severity: "major",
    title: "Lítio + BRA",
    description: "BRAs reduzem eliminação renal do lítio com risco de toxicidade.",
    recommendation: "Monitorar litemia frequentemente ao iniciar, ajustar ou suspender BRA.",
    mechanism: "Mesma causa que lítio + IECA.",
  },
  {
    drugs: ["lítio", "tiazidico"],
    severity: "major",
    title: "Lítio + Tiazídico",
    description: "Tiazídicos causam depleção de sódio, levando a maior reabsorção de lítio nos túbulos renais e risco de toxicidade.",
    recommendation: "Monitorar litemia após início do tiazídico. Ajustar dose de lítio. Manter hidratação adequada.",
    mechanism: "Depleção sódica → aumento da reabsorção tubular de lítio.",
  },

  // ── CORTICOIDES ──
  {
    drugs: ["corticoide", "insulina"],
    severity: "major",
    title: "Corticoide + Insulina/Hipoglicemiante",
    description: "Corticoides causam hiperglicemia por resistência insulínica, podendo descompensar o diabetes e exigir aumento da insulina.",
    recommendation: "Monitorar glicemia com maior frequência durante corticoterapia. Ajustar dose de insulina/hipoglicemiante.",
    mechanism: "Ação glicocorticoide: estimula gliconeogênese hepática e induz resistência periférica à insulina.",
  },

  // ── ANTICOLINÉRGICOS ──
  {
    drugs: ["anticolinérgico", "anticolinérgico"],
    severity: "major",
    title: "Polifarmácia Anticolinérgica",
    description: "Múltiplos medicamentos com efeito anticolinérgico (oxibutinina, prometazina, biperideno, tricíclicos, anti-histamínicos) somam efeitos: confusão mental, retenção urinária, constipação, queda, visão turva.",
    recommendation: "Aplicar a Carga Anticolinérgica (Anticholinergic Burden Score). Minimizar número de anticolinérgicos. Evitar em idosos (Critérios de Beers).",
    mechanism: "Bloqueio aditivo de receptores muscarínicos M1, M2 e M3 no SNC e periferia.",
  },
  {
    drugs: ["anticolinérgico", "donepezila"],
    severity: "major",
    title: "Anticolinérgico + Donepezila/Anticolinesterásico",
    description: "Medicamentos anticolinérgicos antagonizam diretamente o efeito da donepezila, tornando-a ineficaz.",
    recommendation: "Revisar e eliminar medicamentos anticolinérgicos em pacientes usando donepezila ou rivastigmina.",
    mechanism: "Antagonismo farmacológico direto no receptor muscarínico.",
  },
];

// ============================================================
// FUNÇÃO: Detectar medicamentos no texto livre do paciente
// ============================================================
export function detectDrugs(medicationsText) {
  if (!medicationsText) return [];
  const text = medicationsText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const detected = new Set();

  for (const [drugKey, keywords] of Object.entries(DRUG_KEYWORDS)) {
    for (const keyword of keywords) {
      const normalizedKw = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (text.includes(normalizedKw)) {
        detected.add(drugKey);
        break;
      }
    }
  }

  return [...detected];
}

// ============================================================
// FUNÇÃO: Checar interações entre os medicamentos detectados
// ============================================================
export function checkInteractions(detectedDrugs) {
  const alerts = [];

  for (const interaction of INTERACTIONS) {
    const [drugA, drugB] = interaction.drugs;
    const hasA = detectedDrugs.includes(drugA);
    const hasB = detectedDrugs.includes(drugB);

    // Handle same-class interaction (e.g., anticolinérgico + anticolinérgico)
    if (drugA === drugB) {
      const count = detectedDrugs.filter(d => d === drugA).length;
      if (count >= 2 || (detectedDrugs.includes(drugA) && countOccurrences(detectedDrugs, drugA) >= 1)) {
        // Skip duplicate class check — just check if class is present twice via different entries
      }
      continue;
    }

    if (hasA && hasB) {
      // Avoid duplicate alerts
      const alreadyAdded = alerts.some(a => a.title === interaction.title);
      if (!alreadyAdded) {
        alerts.push(interaction);
      }
    }
  }

  // Sort by severity
  const order = { critical: 0, major: 1, moderate: 2 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
}

function countOccurrences(arr, val) {
  return arr.filter(x => x === val).length;
}

export const SEVERITY_CONFIG = {
  critical: {
    label: "Interação Crítica",
    color: "bg-red-50 border-red-300",
    textColor: "text-red-800",
    badgeColor: "bg-red-600 text-white",
    icon: "🚨",
  },
  major: {
    label: "Interação Grave",
    color: "bg-orange-50 border-orange-300",
    textColor: "text-orange-800",
    badgeColor: "bg-orange-500 text-white",
    icon: "⚠️",
  },
  moderate: {
    label: "Interação Moderada",
    color: "bg-amber-50 border-amber-200",
    textColor: "text-amber-800",
    badgeColor: "bg-amber-400 text-white",
    icon: "⚡",
  },
};