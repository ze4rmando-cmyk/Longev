import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import {
  FileText, Download, Settings2, ArrowLeft, Filter, Users, Brain,
  Activity, HeartPulse, ClipboardList, Calendar, BarChart2,
  AlertTriangle, Shield, ShieldOff, ShieldAlert, Printer, CheckSquare,
  Square, User, Pill, Heart, TrendingUp, Zap, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import AlertBadge from "@/components/AlertBadge";
import { cn } from "@/lib/utils";
import { generatePDF, generateCSV } from "@/lib/reportGenerator";

// ── Config ─────────────────────────────────────────────────────────────────
const DOMAINS = [
  { id: "cognitive",   label: "Cognitivo",       icon: Brain,       tests: ["MEEM"],           color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "functional",  label: "Funcional",        icon: Activity,    tests: ["Katz","Lawton"],  color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "mood",        label: "Humor/Depressão",  icon: HeartPulse,  tests: ["GDS"],            color: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "global",      label: "Avaliação Global", icon: ClipboardList,tests: ["AGA"],           color: "bg-amber-50 text-amber-700 border-amber-200" },
];

const TIME_RANGES = [
  { label: "Últimos 7 dias",   days: 7 },
  { label: "Últimos 30 dias",  days: 30 },
  { label: "Últimos 90 dias",  days: 90 },
  { label: "Últimos 6 meses",  days: 180 },
  { label: "Último ano",       days: 365 },
  { label: "Todos os registros", days: 9999 },
];

export default function CustomReport() {
  const navigate = useNavigate();

  // Data
  const [elderly, setElderly] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Config
  const [selectedPatient, setSelectedPatient] = useState("all");
  const [timeRange, setTimeRange] = useState(90);
  const [selectedDomains, setSelectedDomains] = useState(["cognitive","functional","mood","global"]);
  const [includeSections, setIncludeSections] = useState({
    identification: true,
    alerts: true,
    assessments: true,
    vitals: true,
    appointments: true,
    medications: true,
    notes: true,
    statistics: true,
  });
  const [reportTitle, setReportTitle] = useState("Relatório Clínico Geriátrico");
  const [professional, setProfessional] = useState("");
  const [institution, setInstitution] = useState("GeriCare Research");
  const [observations, setObservations] = useState("");
  const [alertFilter, setAlertFilter] = useState("all");
  const [fragilityFilter, setFragilityFilter] = useState("all");
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    async function load() {
      const [e, a, v, app, n] = await Promise.all([
        base44.entities.Elderly.list("-created_date", 200),
        base44.entities.Assessment.list("-created_date", 1000),
        base44.entities.VitalSign.list("-created_date", 500),
        base44.entities.Appointment.list("-date", 500),
        base44.entities.ClinicalNote.list("-created_date", 500),
      ]);
      setElderly(e); setAssessments(a); setVitals(v);
      setAppointments(app); setNotes(n);
      setLoading(false);
    }
    load();
  }, []);

  // Filtered data
  const cutoffDate = subDays(new Date(), timeRange).toISOString();
  const filteredAssessments = assessments.filter(a => {
    if (a.created_date < cutoffDate) return false;
    if (selectedPatient !== "all" && a.elderly_id !== selectedPatient) return false;
    const activeDomainTests = selectedDomains.flatMap(d => DOMAINS.find(x => x.id === d)?.tests || []);
    if (activeDomainTests.length > 0 && !activeDomainTests.includes(a.test_type)) return false;
    if (alertFilter !== "all" && a.alert_level !== alertFilter) return false;
    return true;
  });

  const filteredPatients = elderly.filter(p => {
    if (selectedPatient !== "all" && p.id !== selectedPatient) return false;
    if (fragilityFilter !== "all") {
      const patAssessments = assessments.filter(a => a.elderly_id === p.id);
      const fragility = getFragility(patAssessments);
      if (fragility !== fragilityFilter) return false;
    }
    return true;
  });

  const filteredVitals = vitals.filter(v => {
    if (v.created_date < cutoffDate) return false;
    if (selectedPatient !== "all" && v.elderly_id !== selectedPatient) return false;
    return true;
  });

  const filteredAppointments = appointments.filter(a => {
    if (selectedPatient !== "all" && a.elderly_id !== selectedPatient) return false;
    return true;
  });

  const filteredNotes = notes.filter(n => {
    if (n.created_date < cutoffDate) return false;
    if (selectedPatient !== "all" && n.elderly_id !== selectedPatient) return false;
    return true;
  });

  // Statistics
  const stats = computeStats(filteredPatients, filteredAssessments, filteredVitals, filteredAppointments);

  function toggleDomain(id) {
    setSelectedDomains(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleSection(key) {
    setIncludeSections(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    const patient = selectedPatient !== "all" ? elderly.find(e => e.id === selectedPatient) : { anonymous_code: "TODOS", age: "-", sex: "-" };
    generateCSV(patient, filteredAssessments);
  };

  const handleExportPDF = () => {
    const patient = selectedPatient !== "all" ? elderly.find(e => e.id === selectedPatient) : { anonymous_code: "TODOS", age: "-", sex: "-" };
    generatePDF(patient, filteredAssessments);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 print:hidden">
        <Button variant="ghost" size="icon" onClick={() => navigate("/reports")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-dm flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-primary" /> Relatório Personalizado
          </h1>
          <p className="text-sm text-muted-foreground">Configure, visualize e exporte relatórios clínicos detalhados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5" /> Imprimir
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
          <Button size="sm" className="gap-2" onClick={handleExportPDF}>
            <Download className="w-3.5 h-3.5" /> PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── PAINEL DE CONFIGURAÇÃO ───────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4 print:hidden">

          {/* Identificação do relatório */}
          <ConfigCard title="Identificação" icon={FileText}>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Título</Label>
                <Input value={reportTitle} onChange={e => setReportTitle(e.target.value)} className="text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Profissional Responsável</Label>
                <Input value={professional} onChange={e => setProfessional(e.target.value)} placeholder="Nome e CRM/COREN..." className="text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Instituição</Label>
                <Input value={institution} onChange={e => setInstitution(e.target.value)} className="text-sm" />
              </div>
            </div>
          </ConfigCard>

          {/* Filtros */}
          <ConfigCard title="Filtros de Dados" icon={Filter}>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Paciente</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os pacientes</SelectItem>
                    {elderly.map(e => <SelectItem key={e.id} value={e.id}>{e.anonymous_code}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Período</Label>
                <Select value={String(timeRange)} onValueChange={v => setTimeRange(Number(v))}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIME_RANGES.map(t => <SelectItem key={t.days} value={String(t.days)}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Nível de Alerta</Label>
                <Select value={alertFilter} onValueChange={setAlertFilter}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                    <SelectItem value="attention">Atenção</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Fragilidade</Label>
                <Select value={fragilityFilter} onValueChange={setFragilityFilter}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="fragil">Frágil</SelectItem>
                    <SelectItem value="pre-fragil">Pré-Frágil</SelectItem>
                    <SelectItem value="robusto">Robusto</SelectItem>
                    <SelectItem value="sem-avaliacao">Sem Avaliação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ConfigCard>

          {/* Domínios */}
          <ConfigCard title="Domínios Clínicos" icon={Brain}>
            <div className="space-y-2">
              {DOMAINS.map(d => (
                <button key={d.id} onClick={() => toggleDomain(d.id)}
                  className={cn("w-full flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left",
                    selectedDomains.includes(d.id) ? d.color : "bg-secondary/30 border-border text-muted-foreground")}>
                  {selectedDomains.includes(d.id) ? <CheckSquare className="w-4 h-4 shrink-0" /> : <Square className="w-4 h-4 shrink-0" />}
                  <d.icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-sm font-medium">{d.label}</span>
                  <span className="ml-auto text-xs opacity-70">({filteredAssessments.filter(a => DOMAINS.find(x => x.id === d.id)?.tests.includes(a.test_type)).length})</span>
                </button>
              ))}
            </div>
          </ConfigCard>

          {/* Seções do relatório */}
          <ConfigCard title="Seções a Incluir" icon={ClipboardList}>
            <div className="space-y-2">
              {[
                { key: "identification", label: "Identificação" },
                { key: "alerts", label: "Alertas Clínicos" },
                { key: "statistics", label: "Estatísticas Gerais" },
                { key: "assessments", label: "Avaliações Clínicas" },
                { key: "vitals", label: "Sinais Vitais" },
                { key: "appointments", label: "Agendamentos" },
                { key: "medications", label: "Medicamentos" },
                { key: "notes", label: "Registros Clínicos" },
              ].map(s => (
                <button key={s.key} onClick={() => toggleSection(s.key)}
                  className="w-full flex items-center gap-2 text-left text-sm">
                  {includeSections[s.key] ? <CheckSquare className="w-4 h-4 text-primary shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <span className={includeSections[s.key] ? "text-foreground" : "text-muted-foreground"}>{s.label}</span>
                </button>
              ))}
            </div>
          </ConfigCard>

          {/* Observações */}
          <ConfigCard title="Observações Finais" icon={FileText}>
            <textarea className="w-full text-sm rounded-md border border-input bg-transparent px-3 py-2 resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" rows={4}
              value={observations} onChange={e => setObservations(e.target.value)}
              placeholder="Observações do profissional responsável..." />
          </ConfigCard>
        </div>

        {/* ── PRÉVIA DO RELATÓRIO ──────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm print:shadow-none print:border-none">

            {/* Cabeçalho */}
            <div className="bg-primary px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-5 h-5 text-white/80" />
                    <span className="text-white/70 text-xs font-medium">{institution}</span>
                  </div>
                  <h1 className="text-white font-bold text-xl font-dm">{reportTitle}</h1>
                  {professional && <p className="text-white/70 text-xs mt-0.5">Responsável: {professional}</p>}
                </div>
                <div className="text-right text-white/70 text-xs space-y-0.5">
                  <p>Emissão: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                  <p>Período: {TIME_RANGES.find(t => t.days === timeRange)?.label}</p>
                  <p>{filteredPatients.length} paciente{filteredPatients.length !== 1 ? "s" : ""} · {filteredAssessments.length} avaliações</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-border">

              {/* 1. Identificação / Resumo */}
              {includeSections.identification && (
                <ReportSection title="Escopo do Relatório" icon={User}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MetricCard label="Pacientes" value={filteredPatients.length} />
                    <MetricCard label="Avaliações" value={filteredAssessments.length} />
                    <MetricCard label="Sinais Vitais" value={filteredVitals.length} />
                    <MetricCard label="Registros Clínicos" value={filteredNotes.length} />
                  </div>
                  {selectedPatient !== "all" && (() => {
                    const p = elderly.find(e => e.id === selectedPatient);
                    if (!p) return null;
                    return (
                      <div className="mt-3 p-3 bg-secondary/50 rounded-xl text-sm grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div><p className="text-[10px] text-muted-foreground uppercase">Código</p><p className="font-mono font-bold">{p.anonymous_code}</p></div>
                        <div><p className="text-[10px] text-muted-foreground uppercase">Idade</p><p className="font-medium">{p.age} anos</p></div>
                        <div><p className="text-[10px] text-muted-foreground uppercase">Sexo</p><p className="font-medium">{p.sex}</p></div>
                        <div><p className="text-[10px] text-muted-foreground uppercase">Status</p><p className="font-medium">{p.status}</p></div>
                        {p.health_conditions && <div className="col-span-2 sm:col-span-4"><p className="text-[10px] text-muted-foreground uppercase">Condições</p><p className="text-xs">{p.health_conditions}</p></div>}
                        {p.medications && <div className="col-span-2 sm:col-span-4"><p className="text-[10px] text-muted-foreground uppercase">Medicamentos</p><p className="text-xs">{p.medications}</p></div>}
                      </div>
                    );
                  })()}
                </ReportSection>
              )}

              {/* 2. Alertas */}
              {includeSections.alerts && (
                <ReportSection title="Alertas Clínicos" icon={AlertTriangle}>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { level: "critical", label: "Críticos", color: "bg-red-50 border-red-200 text-red-700", icon: ShieldOff },
                      { level: "attention", label: "Atenção", color: "bg-amber-50 border-amber-200 text-amber-700", icon: ShieldAlert },
                      { level: "normal", label: "Normal", color: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: Shield },
                    ].map(({ level, label, color, icon: Icon }) => {
                      const count = filteredAssessments.filter(a => a.alert_level === level).length;
                      const pct = filteredAssessments.length > 0 ? Math.round(count / filteredAssessments.length * 100) : 0;
                      return (
                        <div key={level} className={cn("rounded-xl border p-3 text-center", color)}>
                          <Icon className="w-5 h-5 mx-auto mb-1" />
                          <p className="text-xl font-bold font-dm">{count}</p>
                          <p className="text-[10px] font-semibold uppercase">{label}</p>
                          <p className="text-[10px] opacity-70 mt-0.5">{pct}%</p>
                        </div>
                      );
                    })}
                  </div>
                  {filteredAssessments.filter(a => a.alert_level === "critical").length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Avaliações Críticas</p>
                      {filteredAssessments.filter(a => a.alert_level === "critical").map(a => (
                        <div key={a.id} className="flex items-center gap-3 text-xs bg-red-50 rounded-lg px-3 py-1.5">
                          <span className="font-mono font-bold text-red-700">{a.elderly_code}</span>
                          <span className="font-medium">{a.test_type}</span>
                          <span className="text-muted-foreground">Score: {a.score}/{a.max_score}</span>
                          <span className="text-muted-foreground ml-auto">{format(new Date(a.created_date), "dd/MM/yy")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </ReportSection>
              )}

              {/* 3. Estatísticas */}
              {includeSections.statistics && (
                <ReportSection title="Estatísticas e Distribuições" icon={BarChart2}>
                  {/* Fragilidade */}
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Distribuição de Fragilidade</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {[
                      { key: "fragil", label: "Frágil", color: "bg-red-50 border-red-200 text-red-700" },
                      { key: "pre-fragil", label: "Pré-Frágil", color: "bg-orange-50 border-orange-200 text-orange-700" },
                      { key: "robusto", label: "Robusto", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                      { key: "sem-avaliacao", label: "Sem Avaliação", color: "bg-secondary border-border text-muted-foreground" },
                    ].map(({ key, label, color }) => {
                      const count = stats.fragility[key] || 0;
                      const pct = filteredPatients.length > 0 ? Math.round(count / filteredPatients.length * 100) : 0;
                      return (
                        <div key={key} className={cn("rounded-xl border p-3 text-center", color)}>
                          <p className="text-2xl font-bold font-dm">{count}</p>
                          <p className="text-[10px] font-semibold uppercase">{label}</p>
                          <p className="text-[10px] opacity-70">{pct}%</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Por domínio */}
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Avaliações por Domínio</p>
                  <div className="space-y-2">
                    {DOMAINS.filter(d => selectedDomains.includes(d.id)).map(d => {
                      const domainApps = filteredAssessments.filter(a => d.tests.includes(a.test_type));
                      const alertCount = domainApps.filter(a => a.alert_level !== "normal").length;
                      const pct = domainApps.length > 0 ? Math.round(alertCount / domainApps.length * 100) : 0;
                      const avgScore = domainApps.length > 0
                        ? Math.round(domainApps.reduce((s, a) => s + (a.max_score ? a.score / a.max_score * 100 : 0), 0) / domainApps.length)
                        : null;
                      return (
                        <div key={d.id} className="flex items-center gap-3 text-sm bg-secondary/30 rounded-xl p-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", d.color)}>
                            <d.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{d.label}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground shrink-0">{alertCount}/{domainApps.length} com alerta</span>
                            </div>
                          </div>
                          {avgScore !== null && (
                            <div className="text-right shrink-0">
                              <p className="text-lg font-bold font-dm">{avgScore}%</p>
                              <p className="text-[10px] text-muted-foreground">média</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ReportSection>
              )}

              {/* 4. Avaliações */}
              {includeSections.assessments && filteredAssessments.length > 0 && (
                <ReportSection title="Histórico de Avaliações Clínicas" icon={ClipboardList}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-secondary/50">
                          {["Paciente","Teste","Score","Classificação","Alerta","Data","Obs"].map(h => (
                            <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssessments.map(a => (
                          <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                            <td className="px-3 py-2 font-mono font-bold text-[11px]">{a.elderly_code}</td>
                            <td className="px-3 py-2 font-medium">{a.test_type}</td>
                            <td className="px-3 py-2">{a.score}{a.max_score ? `/${a.max_score}` : ""}</td>
                            <td className="px-3 py-2">{a.classification}</td>
                            <td className="px-3 py-2"><AlertBadge level={a.alert_level} /></td>
                            <td className="px-3 py-2 text-muted-foreground">{format(new Date(a.created_date), "dd/MM/yy")}</td>
                            <td className="px-3 py-2 text-muted-foreground max-w-[120px] truncate">{a.notes || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ReportSection>
              )}

              {/* 5. Sinais Vitais */}
              {includeSections.vitals && filteredVitals.length > 0 && (
                <ReportSection title="Sinais Vitais" icon={Activity}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-secondary/50">
                          {["Paciente","Data","PA","FC","Glicemia","Peso","SpO₂"].map(h => (
                            <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVitals.slice(0, 50).map(v => (
                          <tr key={v.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                            <td className="px-3 py-2 font-mono text-[11px] font-bold">{v.elderly_code}</td>
                            <td className="px-3 py-2 text-muted-foreground">{format(new Date(v.created_date), "dd/MM/yy HH:mm")}</td>
                            <td className={cn("px-3 py-2", v.systolic > 140 ? "text-red-600 font-medium" : "")}>
                              {v.systolic && v.diastolic ? `${v.systolic}/${v.diastolic}` : "—"}
                            </td>
                            <td className={cn("px-3 py-2", (v.heart_rate > 100 || v.heart_rate < 60) ? "text-red-600 font-medium" : "")}>{v.heart_rate ?? "—"}</td>
                            <td className={cn("px-3 py-2", (v.blood_glucose > 180 || v.blood_glucose < 70) ? "text-amber-600 font-medium" : "")}>{v.blood_glucose ?? "—"}</td>
                            <td className="px-3 py-2">{v.weight ?? "—"}</td>
                            <td className={cn("px-3 py-2", v.oxygen_saturation < 95 ? "text-red-600 font-medium" : "")}>{v.oxygen_saturation ? `${v.oxygen_saturation}%` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredVitals.length > 50 && <p className="text-xs text-muted-foreground text-center pt-2">Exibindo 50 de {filteredVitals.length} registros</p>}
                  </div>
                </ReportSection>
              )}

              {/* 6. Agendamentos */}
              {includeSections.appointments && filteredAppointments.length > 0 && (
                <ReportSection title="Consultas Agendadas" icon={Calendar}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-secondary/50">
                          {["Paciente","Data","Hora","Tipo","Especialidade","Motivo","Status","Prioridade"].map(h => (
                            <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments.slice(0, 50).map(a => (
                          <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                            <td className="px-3 py-2 font-mono text-[11px] font-bold">{a.elderly_code}</td>
                            <td className="px-3 py-2 text-muted-foreground">{a.date}</td>
                            <td className="px-3 py-2">{a.time}</td>
                            <td className="px-3 py-2">{a.type}</td>
                            <td className="px-3 py-2">{a.specialty || "—"}</td>
                            <td className="px-3 py-2 max-w-[100px] truncate">{a.reason || "—"}</td>
                            <td className="px-3 py-2">{a.status}</td>
                            <td className={cn("px-3 py-2 font-medium", a.clinical_priority === "Urgente" ? "text-red-600" : "")}>
                              {a.clinical_priority}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ReportSection>
              )}

              {/* 7. Medicamentos */}
              {includeSections.medications && filteredPatients.some(p => p.medications) && (
                <ReportSection title="Medicamentos em Uso" icon={Pill}>
                  <div className="space-y-2">
                    {filteredPatients.filter(p => p.medications).map(p => (
                      <div key={p.id} className="flex items-start gap-3 text-sm bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <span className="font-mono font-bold text-amber-700 shrink-0">{p.anonymous_code}</span>
                        <p className="text-xs text-amber-900">{p.medications}</p>
                      </div>
                    ))}
                  </div>
                </ReportSection>
              )}

              {/* 8. Registros Clínicos */}
              {includeSections.notes && filteredNotes.length > 0 && (
                <ReportSection title="Registros Clínicos" icon={FileText}>
                  <div className="space-y-2">
                    {filteredNotes.slice(0, 30).map(n => (
                      <div key={n.id} className="text-xs bg-secondary/30 rounded-xl p-3">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono font-bold">{n.elderly_code}</span>
                          <span className="bg-secondary border border-border px-2 py-0.5 rounded-full font-medium">{n.note_type}</span>
                          {n.cid_codes && <span className="font-mono text-muted-foreground">{n.cid_codes}</span>}
                          <span className="text-muted-foreground ml-auto">{format(new Date(n.created_date), "dd/MM/yy HH:mm")}</span>
                        </div>
                        <p className="text-xs leading-relaxed line-clamp-3">{n.content}</p>
                        {n.professional_name && <p className="text-muted-foreground mt-1">{n.professional_name} · {n.professional_role}</p>}
                      </div>
                    ))}
                    {filteredNotes.length > 30 && <p className="text-xs text-muted-foreground text-center">Exibindo 30 de {filteredNotes.length} registros</p>}
                  </div>
                </ReportSection>
              )}

              {/* Observações */}
              {observations && (
                <ReportSection title="Observações do Profissional" icon={FileText}>
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{observations}</p>
                    {professional && <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">{professional} — {format(new Date(), "dd/MM/yyyy")}</p>}
                  </div>
                </ReportSection>
              )}

              {/* Rodapé */}
              <div className="px-6 py-4 bg-secondary/30">
                <p className="text-xs text-muted-foreground text-center">
                  {institution} · Relatório gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} · Documento para fins de pesquisa científica
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 1.5cm; size: A4; }
          .print\\:hidden { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function getFragility(patAssessments) {
  if (patAssessments.some(a => a.alert_level === "critical")) return "fragil";
  if (patAssessments.some(a => a.alert_level === "attention")) return "pre-fragil";
  if (patAssessments.length > 0) return "robusto";
  return "sem-avaliacao";
}

function computeStats(patients, assessments, vitals, appointments) {
  const allAssessmentsByPatient = {};
  assessments.forEach(a => { if (!allAssessmentsByPatient[a.elderly_id]) allAssessmentsByPatient[a.elderly_id] = []; allAssessmentsByPatient[a.elderly_id].push(a); });

  const fragility = { fragil: 0, "pre-fragil": 0, robusto: 0, "sem-avaliacao": 0 };
  patients.forEach(p => { fragility[getFragility(allAssessmentsByPatient[p.id] || [])]++; });
  return { fragility };
}

// ── Sub-components ─────────────────────────────────────────────────────────
function ConfigCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ReportSection({ title, icon: Icon, children }) {
  return (
    <div className="px-6 py-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <h2 className="font-bold font-dm text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="bg-secondary/50 rounded-xl p-3 text-center">
      <p className="text-2xl font-bold font-dm">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}