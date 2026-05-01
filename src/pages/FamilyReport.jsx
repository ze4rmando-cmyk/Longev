import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import {
  Heart, ArrowLeft, Send, MessageCircle, Mail, User, Calendar,
  Shield, Home, AlertTriangle, Sparkles, Copy, CheckCircle,
  Download, Clock, Pill, Activity, Phone, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const FALL_PREVENTION_TIPS = [
  "Remova tapetes soltos e objetos no chão que possam causar tropeços",
  "Instale corrimões nos dois lados das escadas e barras de apoio no banheiro",
  "Use calçados fechados, antiderrapantes e com salto baixo dentro e fora de casa",
  "Garanta boa iluminação em todos os cômodos, especialmente no corredor e banheiro à noite",
  "Levante-se devagar das cadeiras e camas para evitar tontura (hipotensão ortostática)",
  "Pratique exercícios de equilíbrio e fortalecimento muscular regularmente",
  "Revise periodicamente os medicamentos com o médico — alguns aumentam o risco de queda",
  "Mantenha os óculos limpos e atualizados — a visão prejudicada aumenta o risco",
  "Evite andar descalço ou de meia em superfícies lisas",
  "Organize a casa deixando itens frequentemente usados ao alcance sem necessidade de escadas ou bancos",
];

export default function FamilyReport() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [carePlan, setCarePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [copied, setCopied] = useState(false);

  // Form
  const [familyName, setFamilyName] = useState("");
  const [familyEmail, setFamilyEmail] = useState("");
  const [familyPhone, setFamilyPhone] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [expandedSection, setExpandedSection] = useState("all");

  useEffect(() => {
    base44.entities.Elderly.list("-created_date", 200).then(p => {
      setPatients(p.filter(x => x.status === "Ativo"));
      setLoading(false);
    });
  }, []);

  const handleSelectPatient = async (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient);
    setReport(null);

    const [allAssessments, allAppointments, allNotes] = await Promise.all([
      base44.entities.Assessment.filter({ elderly_id: patientId }, "-created_date", 20),
      base44.entities.Appointment.filter({ elderly_id: patientId }, "-date", 10),
      base44.entities.ClinicalNote.filter({ elderly_id: patientId, private: false }, "-created_date", 5),
    ]);
    setAssessments(allAssessments);
    setAppointments(allAppointments);
    setNotes(allNotes);
  };

  const generateReport = async () => {
    if (!selectedPatient) return;
    setGenerating(true);

    const upcomingApps = appointments.filter(a => a.date >= format(new Date(), "yyyy-MM-dd") && a.status !== "Cancelado");
    const latestAssessments = {};
    assessments.forEach(a => { if (!latestAssessments[a.test_type]) latestAssessments[a.test_type] = a; });

    const prompt = `Você é um profissional de saúde geriátrica. Gere um relatório de progresso SIMPLIFICADO, CALOROSO e ACESSÍVEL para a FAMÍLIA de um idoso. 
Use linguagem simples, sem termos técnicos complexos. Seja encorajador e empático.

DADOS DO PACIENTE:
- Código: ${selectedPatient.anonymous_code}
- Idade: ${selectedPatient.age} anos | Sexo: ${selectedPatient.sex}
- Condições de saúde: ${selectedPatient.health_conditions || "não informado"}
- Medicamentos: ${selectedPatient.medications || "não informado"}

AVALIAÇÕES RECENTES:
${Object.entries(latestAssessments).map(([type, a]) => `- ${type}: ${a.classification} (pontuação ${a.score}/${a.max_score})`).join("\n") || "Nenhuma avaliação recente"}

PRÓXIMAS CONSULTAS:
${upcomingApps.slice(0, 3).map(a => `- ${a.date} às ${a.time}: ${a.type} - ${a.specialty || a.reason || "consulta"}`).join("\n") || "Nenhuma consulta agendada"}

Gere um relatório com estas seções exatas em JSON:
{
  "saudacao": "Saudação calorosa para a família",
  "resumo_geral": "Parágrafo de 3-4 frases sobre o estado geral do idoso em linguagem familiar",
  "pontos_positivos": ["lista de 3-4 pontos positivos/avanços"],
  "pontos_atencao": ["lista de 2-3 pontos que precisam de atenção em casa"],
  "proximas_consultas": ["lista formatada das próximas consultas"],
  "orientacoes_cuidado": ["lista de 4-5 orientações práticas de cuidado em casa específicas para este paciente"],
  "prevencao_quedas": ["lista de 4-5 dicas de prevenção de quedas adaptadas ao perfil"],
  "mensagem_final": "Mensagem final encorajadora de 2-3 frases para a família"
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          saudacao: { type: "string" },
          resumo_geral: { type: "string" },
          pontos_positivos: { type: "array", items: { type: "string" } },
          pontos_atencao: { type: "array", items: { type: "string" } },
          proximas_consultas: { type: "array", items: { type: "string" } },
          orientacoes_cuidado: { type: "array", items: { type: "string" } },
          prevencao_quedas: { type: "array", items: { type: "string" } },
          mensagem_final: { type: "string" },
        }
      }
    });
    setReport(result);
    setGenerating(false);
  };

  const buildTextReport = () => {
    if (!report) return "";
    const upcomingApps = appointments.filter(a => a.date >= format(new Date(), "yyyy-MM-dd") && a.status !== "Cancelado");
    return `🏥 *RELATÓRIO DE PROGRESSO — GERICARE RESEARCH*
📅 ${format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
${familyName ? `\nOlá, ${familyName}!` : ""}

${report.saudacao}

📊 *SITUAÇÃO GERAL*
${report.resumo_geral}

✅ *PONTOS POSITIVOS*
${report.pontos_positivos?.map(p => `• ${p}`).join("\n")}

⚠️ *PONTOS DE ATENÇÃO*
${report.pontos_atencao?.map(p => `• ${p}`).join("\n")}

📅 *PRÓXIMAS CONSULTAS*
${upcomingApps.length > 0 ? upcomingApps.slice(0, 3).map(a => `• ${a.date} às ${a.time} — ${a.type}${a.specialty ? ` (${a.specialty})` : ""}`).join("\n") : "• Consulte a equipe para agendar retorno"}

🏠 *ORIENTAÇÕES EM CASA*
${report.orientacoes_cuidado?.map(o => `• ${o}`).join("\n")}

🦺 *PREVENÇÃO DE QUEDAS*
${report.prevencao_quedas?.map(t => `• ${t}`).join("\n")}

💙 ${report.mensagem_final}

_GeriCare Research · Relatório gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}_`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildTextReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(buildTextReport());
    const phone = familyPhone.replace(/\D/g, "");
    const url = phone ? `https://wa.me/55${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  const handleEmail = async () => {
    if (!familyEmail || !report) return;
    setSendingEmail(true);
    const upcomingApps = appointments.filter(a => a.date >= format(new Date(), "yyyy-MM-dd") && a.status !== "Cancelado");
    const emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background: #0d9488; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 20px;">💚 Relatório de Progresso</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">GeriCare Research · ${format(new Date(), "dd/MM/yyyy", { locale: ptBR })}</p>
  </div>
  <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    ${familyName ? `<p style="color: #6b7280; font-size: 14px;">Olá, <strong>${familyName}</strong>!</p>` : ""}
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">${report.saudacao}</p>
    
    <h2 style="color: #0d9488; font-size: 16px; margin-top: 20px;">📊 Situação Geral</h2>
    <p style="color: #374151; font-size: 14px; line-height: 1.6;">${report.resumo_geral}</p>
    
    <h2 style="color: #059669; font-size: 16px; margin-top: 20px;">✅ Pontos Positivos</h2>
    <ul style="color: #374151; font-size: 14px; line-height: 1.8;">
      ${report.pontos_positivos?.map(p => `<li>${p}</li>`).join("")}
    </ul>
    
    <h2 style="color: #d97706; font-size: 16px; margin-top: 20px;">⚠️ Pontos de Atenção</h2>
    <ul style="color: #374151; font-size: 14px; line-height: 1.8;">
      ${report.pontos_atencao?.map(p => `<li>${p}</li>`).join("")}
    </ul>
    
    <h2 style="color: #0d9488; font-size: 16px; margin-top: 20px;">📅 Próximas Consultas</h2>
    ${upcomingApps.length > 0
      ? `<ul style="color: #374151; font-size: 14px; line-height: 1.8;">${upcomingApps.slice(0,3).map(a => `<li><strong>${a.date} às ${a.time}</strong> — ${a.type}${a.specialty ? ` (${a.specialty})` : ""}</li>`).join("")}</ul>`
      : `<p style="color: #6b7280; font-size: 14px;">Consulte a equipe para agendar retorno.</p>`}
    
    <h2 style="color: #0d9488; font-size: 16px; margin-top: 20px;">🏠 Orientações em Casa</h2>
    <ul style="color: #374151; font-size: 14px; line-height: 1.8;">
      ${report.orientacoes_cuidado?.map(o => `<li>${o}</li>`).join("")}
    </ul>
    
    <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-top: 20px;">
      <h2 style="color: #92400e; font-size: 15px; margin: 0 0 8px;">🦺 Prevenção de Quedas</h2>
      <ul style="color: #78350f; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
        ${report.prevencao_quedas?.map(t => `<li>${t}</li>`).join("")}
      </ul>
    </div>
    
    <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin-top: 20px; text-align: center;">
      <p style="color: #166534; font-size: 14px; margin: 0;">💙 ${report.mensagem_final}</p>
    </div>
    
    <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
      GeriCare Research · Relatório gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
    </p>
  </div>
</div>`;

    await base44.integrations.Core.SendEmail({
      to: familyEmail,
      subject: `Relatório de Progresso — ${selectedPatient.anonymous_code} · GeriCare Research`,
      body: emailBody,
    });
    setEmailSent(true);
    setSendingEmail(false);
    setTimeout(() => setEmailSent(false), 4000);
  };

  const handleDownload = () => {
    const blob = new Blob([buildTextReport()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_familiar_${selectedPatient?.anonymous_code}_${format(new Date(), "yyyyMMdd")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-dm flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" /> Relatório para Familiares
          </h1>
          <p className="text-sm text-muted-foreground">Gere resumos simplificados com orientações e envie para a família</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Config */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Selecionar Paciente
            </h3>
            <Select onValueChange={handleSelectPatient}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {patients.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="font-mono">{p.anonymous_code}</span> — {p.age}a
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedPatient && (
              <>
                <div className="bg-secondary/50 rounded-lg p-3 text-xs space-y-1">
                  <p><span className="text-muted-foreground">Idade:</span> <strong>{selectedPatient.age} anos</strong></p>
                  <p><span className="text-muted-foreground">Sexo:</span> <strong>{selectedPatient.sex}</strong></p>
                  <p><span className="text-muted-foreground">Avaliações:</span> <strong>{assessments.length}</strong></p>
                  <p><span className="text-muted-foreground">Próximas consultas:</span> <strong>{appointments.filter(a => a.date >= format(new Date(), "yyyy-MM-dd")).length}</strong></p>
                </div>
                <Button className="w-full gap-2" onClick={generateReport} disabled={generating}>
                  <Sparkles className="w-4 h-4" />
                  {generating ? "Gerando relatório..." : "Gerar Relatório com IA"}
                </Button>
              </>
            )}
          </div>

          {/* Dados da família */}
          {report && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" /> Enviar para
              </h3>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Nome do familiar</Label>
                <Input value={familyName} onChange={e => setFamilyName(e.target.value)} placeholder="Ex: Maria (filha)" className="text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">WhatsApp</Label>
                <div className="flex gap-2">
                  <Input value={familyPhone} onChange={e => setFamilyPhone(e.target.value)} placeholder="(11) 99999-9999" className="text-sm" />
                  <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 shrink-0" onClick={handleWhatsApp}>
                    <MessageCircle className="w-3.5 h-3.5" />
                    Enviar
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">E-mail</Label>
                <div className="flex gap-2">
                  <Input type="email" value={familyEmail} onChange={e => setFamilyEmail(e.target.value)} placeholder="familiar@email.com" className="text-sm" />
                  <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={handleEmail} disabled={sendingEmail || !familyEmail}>
                    {emailSent ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Mail className="w-3.5 h-3.5" />}
                    {sendingEmail ? "..." : emailSent ? "Enviado!" : "Enviar"}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={handleCopy}>
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copiado!" : "Copiar texto"}
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={handleDownload}>
                  <Download className="w-3.5 h-3.5" /> Baixar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Relatório gerado */}
        <div className="md:col-span-2">
          {!selectedPatient ? (
            <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Selecione um paciente</p>
              <p className="text-sm mt-1">O relatório será gerado com IA automaticamente</p>
            </div>
          ) : generating ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="font-medium">Gerando relatório personalizado...</p>
              <p className="text-sm text-muted-foreground mt-1">A IA está analisando os dados clínicos do paciente</p>
            </div>
          ) : !report ? (
            <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Clique em "Gerar Relatório com IA"</p>
              <p className="text-sm mt-1">O sistema irá criar um resumo personalizado para a família</p>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
              {/* Header do relatório */}
              <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold font-dm">Relatório de Progresso</h2>
                    <p className="text-white/70 text-xs">
                      {selectedPatient.anonymous_code} · {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                {familyName && (
                  <p className="text-white/80 text-sm mt-3">Olá, <strong className="text-white">{familyName}</strong>!</p>
                )}
              </div>

              <div className="p-5 space-y-4">
                {/* Saudação e resumo */}
                <div className="bg-primary/5 rounded-xl p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground italic">{report.saudacao}</p>
                  <p className="text-sm leading-relaxed mt-2">{report.resumo_geral}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pontos positivos */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-semibold text-sm text-emerald-800">Pontos Positivos</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {report.pontos_positivos?.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-emerald-900">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pontos de atenção */}
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <h3 className="font-semibold text-sm text-amber-800">Pontos de Atenção</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {report.pontos_atencao?.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-amber-900">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Próximas consultas */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-sm text-blue-800">Próximas Consultas</h3>
                  </div>
                  {appointments.filter(a => a.date >= format(new Date(), "yyyy-MM-dd") && a.status !== "Cancelado").length === 0 ? (
                    <p className="text-xs text-blue-700">Nenhuma consulta agendada. Consulte a equipe para agendar.</p>
                  ) : (
                    <div className="space-y-2">
                      {appointments.filter(a => a.date >= format(new Date(), "yyyy-MM-dd") && a.status !== "Cancelado").slice(0, 3).map(a => (
                        <div key={a.id} className="flex items-center gap-2 text-xs">
                          <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="font-medium text-blue-900">{a.date} às {a.time}</span>
                          <span className="text-blue-700">— {a.type}{a.specialty ? ` (${a.specialty})` : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Orientações em casa */}
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">Orientações para o Cuidado em Casa</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {report.orientacoes_cuidado?.map((o, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prevenção de quedas */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-orange-600" />
                    <h3 className="font-semibold text-sm text-orange-800">🦺 Prevenção de Quedas</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {report.prevencao_quedas?.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-orange-900">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mensagem final */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 text-center">
                  <Heart className="w-5 h-5 text-rose-500 mx-auto mb-2" />
                  <p className="text-sm text-foreground leading-relaxed">{report.mensagem_final}</p>
                </div>

                {/* Rodapé */}
                <p className="text-[10px] text-muted-foreground text-center">
                  GeriCare Research · Relatório gerado automaticamente em {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}