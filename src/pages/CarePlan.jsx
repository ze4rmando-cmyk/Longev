import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Sparkles, Printer, RefreshCw, AlertTriangle, Shield,
  ShieldAlert, ShieldOff, Dumbbell, Apple, Brain, Heart, UserCheck,
  Stethoscope, ChevronDown, ChevronUp, Info, Clock, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const RISK_CONFIG = {
  baixo: { label: "Risco Baixo", color: "bg-emerald-50 border-emerald-300 text-emerald-800", badge: "bg-emerald-100 text-emerald-700", icon: Shield },
  moderado: { label: "Risco Moderado", color: "bg-amber-50 border-amber-300 text-amber-800", badge: "bg-amber-100 text-amber-700", icon: ShieldAlert },
  alto: { label: "Risco Alto", color: "bg-red-50 border-red-300 text-red-800", badge: "bg-red-100 text-red-700", icon: ShieldOff },
};

const SECTION_CONFIG = [
  { key: "exercicios", label: "Exercícios Físicos", icon: Dumbbell, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { key: "nutricao", label: "Plano Nutricional", icon: Apple, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { key: "cognitivo", label: "Estímulo Cognitivo", icon: Brain, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { key: "saude_mental", label: "Saúde Mental e Social", icon: Heart, color: "text-rose-600 bg-rose-50 border-rose-200" },
  { key: "prevencao", label: "Prevenção de Riscos", icon: AlertTriangle, color: "text-orange-600 bg-orange-50 border-orange-200" },
  { key: "encaminhamentos", label: "Encaminhamentos Profissionais", icon: UserCheck, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
];

function buildPrompt(patient, assessments) {
  const testSummary = assessments.map(a =>
    `- ${a.test_type}: Score ${a.score}/${a.max_score || "?"}, Classificação: ${a.classification}, Alerta: ${a.alert_level}`
  ).join("\n");

  const latestByType = {};
  assessments.forEach(a => { if (!latestByType[a.test_type]) latestByType[a.test_type] = a; });

  const meemScore = latestByType["MEEM"]?.score;
  const meemMax = latestByType["MEEM"]?.max_score || 30;
  const katzScore = latestByType["Katz"]?.score;
  const lawtonScore = latestByType["Lawton"]?.score;
  const gdsScore = latestByType["GDS"]?.score;
  const agaAlert = latestByType["AGA"]?.alert_level;

  const criticals = assessments.filter(a => a.alert_level === "critical").map(a => a.test_type);
  const attentions = assessments.filter(a => a.alert_level === "attention").map(a => a.test_type);

  return `Você é um sistema especialista em saúde do idoso, baseado nas diretrizes do Ministério da Saúde do Brasil (Cadernos de Atenção Básica nº 19 — Envelhecimento e Saúde da Pessoa Idosa), COFEN, CFM, COFITO, Classificação Internacional de Funcionalidade (CIF) e protocolos atualizados da SBGG (Sociedade Brasileira de Geriatria e Gerontologia).

Gere um PLANO DE CUIDADOS PERSONALIZADO estruturado em JSON para a pessoa idosa descrita abaixo. Seja específico, clínico e aplicável na prática. Baseie-se em evidências científicas atualizadas (2020-2024).

DADOS DO PACIENTE:
- Código: ${patient.anonymous_code}
- Idade: ${patient.age} anos
- Sexo: ${patient.sex}
- Condições de saúde: ${patient.health_conditions || "Não informado"}
- Medicamentos em uso: ${patient.medications || "Não informado"}
- Observações: ${patient.notes || "Nenhuma"}

AVALIAÇÕES CLÍNICAS REALIZADAS:
${testSummary || "Nenhuma avaliação registrada"}

ALERTAS CRÍTICOS: ${criticals.length > 0 ? criticals.join(", ") : "Nenhum"}
ALERTAS DE ATENÇÃO: ${attentions.length > 0 ? attentions.join(", ") : "Nenhum"}

MEEM: ${meemScore !== undefined ? `${meemScore}/${meemMax}` : "Não avaliado"}
Katz: ${katzScore !== undefined ? katzScore : "Não avaliado"}
Lawton: ${lawtonScore !== undefined ? lawtonScore : "Não avaliado"}
GDS-15: ${gdsScore !== undefined ? gdsScore : "Não avaliado"}

Responda EXCLUSIVAMENTE neste formato JSON, sem texto adicional fora do JSON:

{
  "risco_geral": "baixo" | "moderado" | "alto",
  "justificativa_risco": "Parágrafo explicando a classificação de risco com base nos dados clínicos e funcionais",
  "resumo_clinico": "Parágrafo sintético do perfil clínico, funcional, cognitivo e emocional do paciente",
  
  "exercicios": {
    "introducao": "Contextualização baseada na CIF e capacidade funcional atual",
    "recomendacoes": [
      {
        "tipo": "Força Muscular | Equilíbrio | Mobilidade | Aeróbico",
        "exemplos": "Ex: Sentar e levantar da cadeira, subir degraus; caminhada de 20 min",
        "frequencia": "X vezes por semana",
        "intensidade": "Leve / Moderada / Alta — escala de Borg",
        "duracao": "X minutos por sessão",
        "seguranca": "Orientações de segurança específicas"
      }
    ],
    "contraindicacoes": "Situações a evitar com base nas condições do paciente",
    "meta_cif": "Meta segundo a CIF (ex: melhora do componente Atividade e Participação)"
  },

  "nutricao": {
    "introducao": "Avaliação do estado nutricional atual",
    "risco_nutricional": "Baixo | Moderado | Alto",
    "calorias_estimadas": "Ex: 1800-2000 kcal/dia",
    "proteinas": "Ex: 1,2-1,5g/kg/dia (baseado em ESPEN 2023)",
    "hidratacao": "Ex: 30-35 mL/kg/dia",
    "orientacoes": ["orientação 1", "orientação 2", "orientação 3"],
    "alimentos_priorizar": ["alimento 1", "alimento 2"],
    "alimentos_restringir": ["alimento 1", "alimento 2"],
    "suplementacao": "Recomendações de suplementação se aplicável"
  },

  "cognitivo": {
    "introducao": "Análise baseada no MEEM e perfil cognitivo",
    "nivel_comprometimento": "Sem comprometimento | Leve | Moderado | Grave",
    "atividades": [
      {
        "categoria": "Memória | Atenção | Raciocínio | Linguagem | Função Executiva",
        "exemplos": "Atividades específicas",
        "frequencia": "X vezes por semana",
        "duracao": "X minutos",
        "progressao": "Como progredir a atividade ao longo do tempo"
      }
    ],
    "estimulacao_digital": "Recomendações sobre uso de tecnologia e aplicativos de estimulação cognitiva",
    "alertas": "Sinais de alerta para monitorar"
  },

  "saude_mental": {
    "introducao": "Análise do estado emocional com base no GDS e histórico clínico",
    "nivel_risco_depressao": "Sem risco | Leve | Moderado | Grave",
    "intervencoes": ["intervenção 1", "intervenção 2", "intervenção 3"],
    "socializacao": ["estratégia de socialização 1", "estratégia 2"],
    "bem_estar": ["estratégia de bem-estar 1", "estratégia 2"],
    "tecnicas_relaxamento": ["técnica 1", "técnica 2"],
    "alertas": "Sinais de alerta para crise depressiva ou suicídio"
  },

  "prevencao": {
    "risco_quedas": "Baixo | Moderado | Alto",
    "medidas_quedas": ["medida 1", "medida 2", "medida 3"],
    "risco_fragilidade": "Pré-Frágil | Frágil | Robusto",
    "medidas_fragilidade": ["medida 1", "medida 2"],
    "risco_polifarmacia": "Sim | Não | Investigar",
    "medidas_polifarmacia": ["medida 1", "medida 2"],
    "risco_isolamento": "Baixo | Moderado | Alto",
    "medidas_isolamento": ["medida 1", "medida 2"],
    "monitoramento": "Frequência e indicadores de monitoramento recomendados"
  },

  "encaminhamentos": [
    {
      "profissional": "Enfermagem | Medicina | Fisioterapia | Nutrição | Psicologia | Terapia Ocupacional | Fonoaudiologia | Serviço Social",
      "urgencia": "Imediata | Eletiva | Preventiva",
      "justificativa": "Razão clínica baseada nos dados avaliados",
      "objetivo": "O que se espera alcançar com o encaminhamento"
    }
  ],

  "metas_gerais": ["meta 1", "meta 2", "meta 3"],
  "revisao_recomendada": "Ex: Em 30 dias para reavaliação do plano",
  "aviso_legal": "Este plano foi gerado por sistema de apoio à decisão clínica. Não substitui avaliação médica, diagnóstico ou prescrição profissional. Deve ser validado pela equipe multiprofissional responsável pelo cuidado."
}`;
}

export default function CarePlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [assessments, setAssessments] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [openSections, setOpenSections] = useState({
    exercicios: true, nutricao: true, cognitivo: true,
    saude_mental: true, prevencao: true, encaminhamentos: true,
  });

  useEffect(() => {
    async function load() {
      const [patients, allAssessments] = await Promise.all([
        base44.entities.Elderly.filter({ id }),
        base44.entities.Assessment.filter({ elderly_id: id }, "-created_date", 100),
      ]);
      setPatient(patients[0] || null);
      setAssessments(allAssessments);
      setLoading(false);
    }
    load();
  }, [id]);

  const generatePlan = async () => {
    setGenerating(true);
    setError(null);
    const prompt = buildPrompt(patient, assessments);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "claude_sonnet_4_6",
      response_json_schema: null,
    });
    // Parse JSON from string
    let parsed;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result);
    } catch (e) {
      setError("Não foi possível interpretar o plano gerado. Tente novamente.");
      setGenerating(false);
      return;
    }
    setPlan(parsed);
    setGeneratedAt(new Date());
    setGenerating(false);
  };

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!patient) return <div className="text-center py-20 text-muted-foreground">Paciente não encontrado.</div>;

  const riskCfg = plan ? (RISK_CONFIG[plan.risco_geral] || RISK_CONFIG.moderado) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${id}`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold font-dm">Plano de Cuidados Personalizado</h1>
            <p className="text-sm text-muted-foreground">{patient.anonymous_code} · {patient.age} anos · {patient.sex}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {plan && (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </Button>
          )}
          <Button
            size="sm"
            className="gap-2"
            onClick={generatePlan}
            disabled={generating}
          >
            {generating ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Gerando...</>
            ) : plan ? (
              <><RefreshCw className="w-3.5 h-3.5" /> Regenerar</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5" /> Gerar Plano com IA</>
            )}
          </Button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block border-b pb-4">
        <h1 className="text-2xl font-bold">GeriCare Research — Plano de Cuidados Personalizado</h1>
        <p className="text-sm mt-1">{patient.anonymous_code} · {patient.age} anos · {patient.sex}</p>
        {generatedAt && <p className="text-xs text-gray-500 mt-1">Gerado em {format(generatedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>}
      </div>

      {/* Initial state — no plan yet */}
      {!plan && !generating && !error && (
        <div className="bg-card rounded-xl border border-border p-10 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-dm">Plano de Cuidados com IA</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              O sistema irá analisar todos os dados clínicos, funcionais, cognitivos e emocionais do paciente e gerar um plano de cuidados personalizado baseado em diretrizes do Ministério da Saúde, COFEN, SBGG e CIF.
            </p>
          </div>

          {/* Assessment summary */}
          {assessments.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
              {["MEEM", "Katz", "Lawton", "GDS"].map(type => {
                const a = assessments.find(x => x.test_type === type);
                return (
                  <div key={type} className={cn(
                    "rounded-xl border p-3 text-center text-xs",
                    a?.alert_level === "critical" ? "bg-red-50 border-red-200" :
                    a?.alert_level === "attention" ? "bg-amber-50 border-amber-200" :
                    a ? "bg-emerald-50 border-emerald-200" : "bg-secondary border-border"
                  )}>
                    <p className="font-bold">{type}</p>
                    <p className="text-muted-foreground">{a ? `${a.score}/${a.max_score}` : "—"}</p>
                  </div>
                );
              })}
            </div>
          )}

          {assessments.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 max-w-sm mx-auto">
              <AlertTriangle className="w-4 h-4 inline mr-1.5" />
              Recomendado realizar avaliações clínicas antes de gerar o plano para resultados mais precisos.
            </div>
          )}

          <Button className="gap-2 mx-auto" onClick={generatePlan}>
            <Sparkles className="w-4 h-4" /> Gerar Plano de Cuidados
          </Button>

          <p className="text-xs text-muted-foreground">
            ⚡ Utiliza modelo avançado de IA. Pode levar 15–30 segundos.
          </p>
        </div>
      )}

      {/* Generating state */}
      {generating && (
        <div className="bg-card rounded-xl border border-border p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <p className="font-semibold font-dm">Analisando dados clínicos...</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            O sistema está integrando os dados de avaliações, condições de saúde e medicamentos para gerar recomendações personalizadas baseadas em evidências.
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">{error}</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={generatePlan}>Tentar novamente</Button>
          </div>
        </div>
      )}

      {/* Plan content */}
      {plan && !generating && (
        <div className="space-y-5">
          {/* Risk banner + summary */}
          <div className={cn("rounded-xl border p-5", riskCfg.color)}>
            <div className="flex items-start gap-3">
              <riskCfg.icon className="w-6 h-6 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={cn("text-xs font-bold uppercase px-2.5 py-1 rounded-full", riskCfg.badge)}>
                    {riskCfg.label}
                  </span>
                  {generatedAt && (
                    <span className="text-xs opacity-70 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Gerado em {format(generatedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium">{plan.justificativa_risco}</p>
              </div>
            </div>
          </div>

          {/* Clinical summary */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="w-4 h-4 text-primary" />
              <h2 className="font-semibold font-dm">Resumo Clínico Integrado</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{plan.resumo_clinico}</p>
          </div>

          {/* Sections */}
          {SECTION_CONFIG.map(({ key, label, icon: Icon, color }) => {
            const data = plan[key];
            if (!data) return null;
            const isOpen = openSections[key];

            return (
              <div key={key} className="bg-card rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border", color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold font-dm">{label}</span>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                    {/* EXERCÍCIOS */}
                    {key === "exercicios" && (
                      <>
                        <p className="text-sm text-muted-foreground">{data.introducao}</p>
                        <div className="space-y-3">
                          {data.recomendacoes?.map((r, i) => (
                            <div key={i} className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{r.tipo}</span>
                              </div>
                              <p className="text-sm"><strong>Exemplos:</strong> {r.exemplos}</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                                <InfoChip label="Frequência" value={r.frequencia} />
                                <InfoChip label="Intensidade" value={r.intensidade} />
                                <InfoChip label="Duração" value={r.duracao} />
                              </div>
                              {r.seguranca && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2 text-xs text-amber-800">
                                  <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                                  <span><strong>Segurança:</strong> {r.seguranca}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {data.contraindicacoes && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                            <strong>Contraindicações:</strong> {data.contraindicacoes}
                          </div>
                        )}
                        {data.meta_cif && (
                          <div className="bg-secondary rounded-lg p-3 text-xs text-muted-foreground">
                            <strong>Meta CIF:</strong> {data.meta_cif}
                          </div>
                        )}
                      </>
                    )}

                    {/* NUTRIÇÃO */}
                    {key === "nutricao" && (
                      <>
                        <p className="text-sm text-muted-foreground">{data.introducao}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <NutriChip label="Risco Nutricional" value={data.risco_nutricional} />
                          <NutriChip label="Calorias" value={data.calorias_estimadas} />
                          <NutriChip label="Proteínas" value={data.proteinas} />
                          <NutriChip label="Hidratação" value={data.hidratacao} />
                        </div>
                        {data.orientacoes?.length > 0 && <BulletList title="Orientações Alimentares" items={data.orientacoes} color="text-emerald-600" />}
                        <div className="grid sm:grid-cols-2 gap-3">
                          {data.alimentos_priorizar?.length > 0 && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                              <p className="text-xs font-bold text-emerald-700 mb-2">✅ Priorizar</p>
                              <ul className="space-y-1">{data.alimentos_priorizar.map((a, i) => <li key={i} className="text-sm text-emerald-800">• {a}</li>)}</ul>
                            </div>
                          )}
                          {data.alimentos_restringir?.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                              <p className="text-xs font-bold text-red-700 mb-2">⚠ Restringir</p>
                              <ul className="space-y-1">{data.alimentos_restringir.map((a, i) => <li key={i} className="text-sm text-red-800">• {a}</li>)}</ul>
                            </div>
                          )}
                        </div>
                        {data.suplementacao && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
                            <strong>Suplementação:</strong> {data.suplementacao}
                          </div>
                        )}
                      </>
                    )}

                    {/* COGNITIVO */}
                    {key === "cognitivo" && (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground flex-1">{data.introducao}</p>
                          {data.nivel_comprometimento && (
                            <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded-full shrink-0">{data.nivel_comprometimento}</span>
                          )}
                        </div>
                        <div className="space-y-3">
                          {data.atividades?.map((a, i) => (
                            <div key={i} className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-2">
                              <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">{a.categoria}</span>
                              <p className="text-sm"><strong>Atividades:</strong> {a.exemplos}</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                                <InfoChip label="Frequência" value={a.frequencia} />
                                <InfoChip label="Duração" value={a.duracao} />
                                <InfoChip label="Progressão" value={a.progressao} />
                              </div>
                            </div>
                          ))}
                        </div>
                        {data.estimulacao_digital && (
                          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-800">
                            <strong>Estimulação Digital:</strong> {data.estimulacao_digital}
                          </div>
                        )}
                        {data.alertas && <AlertBox text={data.alertas} />}
                      </>
                    )}

                    {/* SAÚDE MENTAL */}
                    {key === "saude_mental" && (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground flex-1">{data.introducao}</p>
                          {data.nivel_risco_depressao && (
                            <span className={cn(
                              "text-xs font-bold px-2 py-1 rounded-full shrink-0",
                              data.nivel_risco_depressao === "Grave" ? "bg-red-100 text-red-700" :
                              data.nivel_risco_depressao === "Moderado" ? "bg-amber-100 text-amber-700" :
                              data.nivel_risco_depressao === "Leve" ? "bg-yellow-100 text-yellow-700" :
                              "bg-emerald-100 text-emerald-700"
                            )}>{data.nivel_risco_depressao}</span>
                          )}
                        </div>
                        {data.intervencoes?.length > 0 && <BulletList title="Intervenções" items={data.intervencoes} color="text-rose-600" />}
                        {data.socializacao?.length > 0 && <BulletList title="Estratégias de Socialização" items={data.socializacao} color="text-pink-600" />}
                        {data.bem_estar?.length > 0 && <BulletList title="Promoção de Bem-Estar" items={data.bem_estar} color="text-purple-600" />}
                        {data.tecnicas_relaxamento?.length > 0 && <BulletList title="Técnicas de Relaxamento" items={data.tecnicas_relaxamento} color="text-indigo-600" />}
                        {data.alertas && <AlertBox text={data.alertas} />}
                      </>
                    )}

                    {/* PREVENÇÃO */}
                    {key === "prevencao" && (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <RiskChip label="Quedas" value={data.risco_quedas} />
                          <RiskChip label="Fragilidade" value={data.risco_fragilidade} />
                          <RiskChip label="Polifarmácia" value={data.risco_polifarmacia} />
                          <RiskChip label="Isolamento" value={data.risco_isolamento} />
                        </div>
                        {data.medidas_quedas?.length > 0 && <BulletList title="Prevenção de Quedas" items={data.medidas_quedas} color="text-orange-600" />}
                        {data.medidas_fragilidade?.length > 0 && <BulletList title="Prevenção de Fragilidade" items={data.medidas_fragilidade} color="text-amber-600" />}
                        {data.medidas_polifarmacia?.length > 0 && <BulletList title="Gestão de Polifarmácia" items={data.medidas_polifarmacia} color="text-red-600" />}
                        {data.medidas_isolamento?.length > 0 && <BulletList title="Combate ao Isolamento Social" items={data.medidas_isolamento} color="text-blue-600" />}
                        {data.monitoramento && (
                          <div className="bg-secondary rounded-lg p-3 text-sm text-muted-foreground">
                            <strong>Monitoramento:</strong> {data.monitoramento}
                          </div>
                        )}
                      </>
                    )}

                    {/* ENCAMINHAMENTOS */}
                    {key === "encaminhamentos" && Array.isArray(data) && (
                      <div className="space-y-3">
                        {data.map((enc, i) => (
                          <div key={i} className={cn(
                            "rounded-xl border p-4",
                            enc.urgencia === "Imediata" ? "bg-red-50 border-red-200" :
                            enc.urgencia === "Eletiva" ? "bg-amber-50 border-amber-200" :
                            "bg-blue-50 border-blue-100"
                          )}>
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className="font-semibold text-sm">{enc.profissional}</span>
                              <span className={cn(
                                "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                                enc.urgencia === "Imediata" ? "bg-red-600 text-white" :
                                enc.urgencia === "Eletiva" ? "bg-amber-500 text-white" :
                                "bg-blue-500 text-white"
                              )}>{enc.urgencia}</span>
                            </div>
                            <p className="text-xs text-muted-foreground"><strong>Justificativa:</strong> {enc.justificativa}</p>
                            {enc.objetivo && <p className="text-xs text-muted-foreground mt-1"><strong>Objetivo:</strong> {enc.objetivo}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Goals + Revision */}
          {plan.metas_gerais?.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <h2 className="font-semibold font-dm">Metas Gerais do Plano</h2>
              </div>
              <ul className="space-y-2">
                {plan.metas_gerais.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                    {m}
                  </li>
                ))}
              </ul>
              {plan.revisao_recomendada && (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2">
                  <Clock className="w-3.5 h-3.5" />
                  <strong>Revisão recomendada:</strong> {plan.revisao_recomendada}
                </div>
              )}
            </div>
          )}

          {/* Legal disclaimer */}
          {plan.aviso_legal && (
            <div className="bg-secondary border border-border rounded-xl p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">{plan.aviso_legal}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Micro-components ─────────────────────────────────────────────────────────

function InfoChip({ label, value }) {
  if (!value) return null;
  return (
    <div className="bg-white/70 border border-white rounded-lg p-2">
      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
      <p className="text-xs font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function NutriChip({ label, value }) {
  if (!value) return null;
  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
      <p className="text-[10px] text-emerald-600 font-medium">{label}</p>
      <p className="text-xs font-bold text-emerald-800 mt-0.5">{value}</p>
    </div>
  );
}

function RiskChip({ label, value }) {
  if (!value) return null;
  const isHigh = /alto|grave|frágil|sim/i.test(value);
  const isMed = /moderado|pré/i.test(value);
  return (
    <div className={cn(
      "rounded-xl border p-3 text-center",
      isHigh ? "bg-red-50 border-red-200" : isMed ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
    )}>
      <p className={cn("text-[10px] font-medium", isHigh ? "text-red-600" : isMed ? "text-amber-600" : "text-emerald-600")}>{label}</p>
      <p className={cn("text-xs font-bold mt-0.5", isHigh ? "text-red-800" : isMed ? "text-amber-800" : "text-emerald-800")}>{value}</p>
    </div>
  );
}

function BulletList({ title, items, color }) {
  return (
    <div>
      <p className={cn("text-xs font-bold uppercase tracking-wide mb-2", color)}>{title}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0 opacity-60" style={{ color: "inherit" }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AlertBox({ text }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-800">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
      <span><strong>Alertas:</strong> {text}</span>
    </div>
  );
}