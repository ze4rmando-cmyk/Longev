import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  FileText, Download, Filter, Settings2, BarChart2, Users, Brain,
  Activity, HeartPulse, AlertTriangle, Calendar, Pill, Heart,
  TrendingUp, Shield, ShieldOff, ShieldAlert, Clock, CheckCircle,
  Printer, Search, ChevronDown, ChevronUp, Home, Zap, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import AlertBadge from "@/components/AlertBadge";
import EmptyState from "@/components/EmptyState";
import { generatePDF, generateCSV } from "@/lib/reportGenerator";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from "recharts";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getFragility(patAssessments) {
  if (patAssessments.some(a => a.alert_level === "critical")) return "fragil";
  if (patAssessments.some(a => a.alert_level === "attention")) return "pre-fragil";
  if (patAssessments.length > 0) return "robusto";
  return "sem-avaliacao";
}

function normalizeScore(score, maxScore) {
  if (!maxScore) return 0;
  return Math.round((score / maxScore) * 100);
}

const PIE_COLORS = ["#ef4444", "#f97316", "#10b981", "#94a3b8"];
const CHART_COLORS = { MEEM: "#8b5cf6", Katz: "#3b82f6", Lawton: "#06b6d4", GDS: "#f43f5e", AGA: "#f59e0b" };

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Reports() {
  const [elderly, setElderly] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterTest, setFilterTest] = useState("all");
  const [filterPatient, setFilterPatient] = useState("all");
  const [filterAlert, setFilterAlert] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("90");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

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

  const cutoffDate = subDays(new Date(), Number(filterPeriod)).toISOString();

  const filtered = useMemo(() => assessments.filter(a => {
    if (filterTest !== "all" && a.test_type !== filterTest) return false;
    if (filterPatient !== "all" && a.elderly_id !== filterPatient) return false;
    if (filterAlert !== "all" && a.alert_level !== filterAlert) return false;
    if (a.created_date < cutoffDate) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!a.elderly_code?.toLowerCase().includes(q) && !a.classification?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [assessments, filterTest, filterPatient, filterAlert, cutoffDate, search]);

  // ── Computed analytics ──────────────────────────────────────────────────────
  const analytics = useMemo(() => {
    const byPatient = {};
    elderly.forEach(p => { byPatient[p.id] = []; });
    assessments.forEach(a => { if (byPatient[a.elderly_id]) byPatient[a.elderly_id].push(a); });

    const fragility = { fragil: 0, "pre-fragil": 0, robusto: 0, "sem-avaliacao": 0 };
    elderly.forEach(p => { fragility[getFragility(byPatient[p.id] || [])]++; });

    const byType = {};
    filtered.forEach(a => {
      if (!byType[a.test_type]) byType[a.test_type] = { total: 0, critical: 0, attention: 0, normal: 0, scoreSum: 0, maxScoreSum: 0 };
      byType[a.test_type].total++;
      byType[a.test_type][a.alert_level]++;
      byType[a.test_type].scoreSum += a.score;
      byType[a.test_type].maxScoreSum += (a.max_score || 0);
    });

    // Timeline: assessments per month
    const timeline = {};
    filtered.forEach(a => {
      const month = a.created_date?.substring(0, 7);
      if (month) { if (!timeline[month]) timeline[month] = 0; timeline[month]++; }
    });
    const timelineData = Object.entries(timeline).sort().map(([m, count]) => ({
      month: m.substring(5) + "/" + m.substring(2, 4), count
    }));

    // Avg scores per test
    const avgScores = Object.entries(byType).map(([type, data]) => ({
      name: type,
      media: data.maxScoreSum > 0 ? Math.round(data.scoreSum / data.maxScoreSum * 100) : 0,
      criticos: data.critical,
      atencao: data.attention,
      normais: data.normal,
    }));

    // Frailty pie
    const fragilityPie = [
      { name: "Frágil", value: fragility.fragil },
      { name: "Pré-Frágil", value: fragility["pre-fragil"] },
      { name: "Robusto", value: fragility.robusto },
      { name: "Sem Aval.", value: fragility["sem-avaliacao"] },
    ].filter(x => x.value > 0);

    // Vital averages
    const recentVitals = vitals.filter(v => v.created_date >= cutoffDate);
    const vitalAvgs = {
      systolic: recentVitals.filter(v => v.systolic).reduce((s, v) => s + v.systolic, 0) / (recentVitals.filter(v => v.systolic).length || 1),
      diastolic: recentVitals.filter(v => v.diastolic).reduce((s, v) => s + v.diastolic, 0) / (recentVitals.filter(v => v.diastolic).length || 1),
      heartRate: recentVitals.filter(v => v.heart_rate).reduce((s, v) => s + v.heart_rate, 0) / (recentVitals.filter(v => v.heart_rate).length || 1),
      glucose: recentVitals.filter(v => v.blood_glucose).reduce((s, v) => s + v.blood_glucose, 0) / (recentVitals.filter(v => v.blood_glucose).length || 1),
    };

    return { fragility, fragilityPie, byType, timelineData, avgScores, vitalAvgs, byPatient };
  }, [elderly, assessments, filtered, vitals, cutoffDate]);

  const handleExport = (type) => {
    const patient = filterPatient !== "all"
      ? elderly.find(e => e.id === filterPatient)
      : { anonymous_code: "TODOS", age: "-", sex: "-", health_conditions: "", medications: "", notes: "" };
    const patVitals = filterPatient !== "all" ? vitals.filter(v => v.elderly_id === filterPatient) : vitals;
    const patNotes = filterPatient !== "all" ? notes.filter(n => n.elderly_id === filterPatient) : notes;
    const patApps = filterPatient !== "all" ? appointments.filter(a => a.elderly_id === filterPatient) : appointments;
    const opts = { vitals: patVitals, notes: patNotes, appointments: patApps };
    if (type === "pdf") generatePDF(patient, filtered, opts);
    else generateCSV(patient, filtered, opts);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const TABS = [
    { id: "overview", label: "Visão Geral", icon: BarChart2 },
    { id: "assessments", label: "Avaliações", icon: ClipboardIcon },
    { id: "vitals", label: "Sinais Vitais", icon: Activity },
    { id: "appointments", label: "Consultas", icon: Calendar },
    { id: "notes", label: "Registros", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-dm tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-primary" /> Relatórios Clínicos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} avaliações · {elderly.length} pacientes · {vitals.length} registros de sinais vitais
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/reports/family">
            <Button variant="outline" size="sm" className="gap-2">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Relatório Familiar
            </Button>
          </Link>
          <Link to="/reports/custom">
            <Button size="sm" className="gap-2">
              <Settings2 className="w-3.5 h-3.5" /> Personalizado
            </Button>
          </Link>
          {filtered.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleExport("pdf")} className="gap-2">
                <Download className="w-3.5 h-3.5" /> PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("csv")} className="gap-2">
                <Download className="w-3.5 h-3.5" /> CSV
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Buscar paciente..." className="pl-8 h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-40 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="180">Últimos 6 meses</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
              <SelectItem value="9999">Todos os registros</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterTest} onValueChange={setFilterTest}>
            <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os testes</SelectItem>
              {["MEEM","Katz","Lawton","GDS","AGA"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterPatient} onValueChange={setFilterPatient}>
            <SelectTrigger className="w-40 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos pacientes</SelectItem>
              {elderly.map(e => <SelectItem key={e.id} value={e.id}>{e.anonymous_code}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterAlert} onValueChange={setFilterAlert}>
            <SelectTrigger className="w-32 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos alertas</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
              <SelectItem value="attention">Atenção</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-border">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px",
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: VISÃO GERAL ──────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Avaliações" value={filtered.length} color="text-primary bg-primary/10" icon={Brain} />
            <StatCard label="Alertas Críticos" value={filtered.filter(a => a.alert_level === "critical").length} color="text-red-600 bg-red-50" icon={AlertTriangle} />
            <StatCard label="Em Atenção" value={filtered.filter(a => a.alert_level === "attention").length} color="text-amber-600 bg-amber-50" icon={ShieldAlert} />
            <StatCard label="Registros Normais" value={filtered.filter(a => a.alert_level === "normal").length} color="text-emerald-600 bg-emerald-50" icon={Shield} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Score médio por teste */}
            <div className="lg:col-span-3 bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm font-dm mb-1 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" /> Score Médio por Instrumento (% do máximo)
              </h3>
              <p className="text-xs text-muted-foreground mb-4">Pontuação média normalizada por tipo de avaliação</p>
              {analytics.avgScores.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado</p> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.avgScores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} formatter={v => [`${v}%`]} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="media" name="Média %" radius={[4,4,0,0]}>
                      {analytics.avgScores.map((_, i) => <Cell key={i} fill={Object.values(CHART_COLORS)[i % 5]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Distribuição fragilidade */}
            <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm font-dm mb-1 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Fragilidade
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Distribuição da população atendida</p>
              {analytics.fragilityPie.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado</p> : (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={analytics.fragilityPie} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                      {analytics.fragilityPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {[
                  { label: "Frágil", value: analytics.fragility.fragil, color: "bg-red-500" },
                  { label: "Pré-Frágil", value: analytics.fragility["pre-fragil"], color: "bg-orange-400" },
                  { label: "Robusto", value: analytics.fragility.robusto, color: "bg-emerald-500" },
                  { label: "Sem Aval.", value: analytics.fragility["sem-avaliacao"], color: "bg-slate-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs">
                    <span className={cn("w-2 h-2 rounded-full shrink-0", color)} />
                    <span className="text-muted-foreground">{label}:</span>
                    <span className="font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          {analytics.timelineData.length > 1 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm font-dm mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Volume de Avaliações ao Longo do Tempo
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={analytics.timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                  <Line type="monotone" dataKey="count" name="Avaliações" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Por instrumento */}
          {Object.keys(analytics.byType).length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm font-dm mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" /> Detalhamento por Instrumento
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      {["Instrumento","Total","Críticos","Atenção","Normais","Score Médio (%)","Taxa de Alerta"].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(analytics.byType).map(([type, data]) => {
                      const alertPct = data.total > 0 ? Math.round((data.critical + data.attention) / data.total * 100) : 0;
                      const avgScore = data.maxScoreSum > 0 ? Math.round(data.scoreSum / data.maxScoreSum * 100) : "—";
                      return (
                        <tr key={type} className="border-b border-border last:border-0 hover:bg-secondary/20">
                          <td className="px-3 py-2 font-semibold" style={{ color: CHART_COLORS[type] || "hsl(var(--foreground))" }}>{type}</td>
                          <td className="px-3 py-2 font-bold">{data.total}</td>
                          <td className="px-3 py-2"><span className="text-red-600 font-medium">{data.critical}</span></td>
                          <td className="px-3 py-2"><span className="text-amber-600 font-medium">{data.attention}</span></td>
                          <td className="px-3 py-2"><span className="text-emerald-600 font-medium">{data.normal}</span></td>
                          <td className="px-3 py-2">{avgScore}{typeof avgScore === "number" ? "%" : ""}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-red-400 rounded-full" style={{ width: `${alertPct}%` }} />
                              </div>
                              <span className="text-xs font-medium w-8">{alertPct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sinais vitais médios */}
          {vitals.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm font-dm mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Médias de Sinais Vitais (período selecionado)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Pressão Sistólica", value: Math.round(analytics.vitalAvgs.systolic) || "—", unit: "mmHg", alert: analytics.vitalAvgs.systolic > 140, color: "bg-red-50 border-red-100" },
                  { label: "Freq. Cardíaca", value: Math.round(analytics.vitalAvgs.heartRate) || "—", unit: "bpm", alert: analytics.vitalAvgs.heartRate > 100, color: "bg-rose-50 border-rose-100" },
                  { label: "Glicemia Média", value: Math.round(analytics.vitalAvgs.glucose) || "—", unit: "mg/dL", alert: analytics.vitalAvgs.glucose > 180, color: "bg-amber-50 border-amber-100" },
                  { label: "PA Diastólica", value: Math.round(analytics.vitalAvgs.diastolic) || "—", unit: "mmHg", alert: analytics.vitalAvgs.diastolic > 90, color: "bg-orange-50 border-orange-100" },
                ].map(({ label, value, unit, alert, color }) => (
                  <div key={label} className={cn("rounded-xl border p-3 text-center", color)}>
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="text-xl font-bold font-dm">{value}</p>
                    <p className="text-xs text-muted-foreground">{unit}</p>
                    {alert && <p className="text-[10px] text-red-600 font-bold mt-1">⚠ Elevada</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: AVALIAÇÕES ──────────────────────────────────────────────────── */}
      {activeTab === "assessments" && (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <EmptyState icon={FileText} title="Nenhuma avaliação encontrada" description="Ajuste os filtros para ver resultados." actionLabel="Ver Pacientes" actionHref="/patients" />
          ) : (
            <>
              <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
                <span>{filtered.length} avaliações encontradas</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleExport("pdf")}><Download className="w-3 h-3" />PDF</Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleExport("csv")}><Download className="w-3 h-3" />CSV</Button>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        {["Paciente","Tipo","Score","% Máximo","Classificação","Alerta","Data","Avaliador","Observações"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(a => (
                        <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-xs">{a.elderly_code}</td>
                          <td className="px-4 py-3 font-medium" style={{ color: CHART_COLORS[a.test_type] }}>{a.test_type}</td>
                          <td className="px-4 py-3 font-bold">{a.score}{a.max_score ? `/${a.max_score}` : ""}</td>
                          <td className="px-4 py-3">{a.max_score ? `${Math.round(a.score / a.max_score * 100)}%` : "—"}</td>
                          <td className="px-4 py-3">{a.classification}</td>
                          <td className="px-4 py-3"><AlertBadge level={a.alert_level} /></td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{format(new Date(a.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{a.professional_name || "—"}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{a.notes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: SINAIS VITAIS ──────────────────────────────────────────────── */}
      {activeTab === "vitals" && (
        <div className="space-y-4">
          {vitals.length === 0 ? (
            <EmptyState icon={Activity} title="Nenhum sinal vital" description="Registre sinais vitais na seção de pacientes." actionLabel="Registrar" actionHref="/vitals" />
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      {["Paciente","Data/Hora","PA (mmHg)","FC (bpm)","Glicemia (mg/dL)","Peso (kg)","SpO₂ (%)","Observações"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vitals.filter(v => filterPatient === "all" || v.elderly_id === filterPatient).map(v => (
                      <tr key={v.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                        <td className="px-4 py-3 font-mono font-bold text-xs">{v.elderly_code}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{format(new Date(v.created_date), "dd/MM/yy HH:mm")}</td>
                        <td className={cn("px-4 py-3 font-medium", v.systolic > 140 ? "text-red-600" : "")}>
                          {v.systolic && v.diastolic ? `${v.systolic}/${v.diastolic}` : "—"}
                          {v.systolic > 140 && <span className="ml-1 text-[10px] text-red-500">⚠</span>}
                        </td>
                        <td className={cn("px-4 py-3", (v.heart_rate > 100 || v.heart_rate < 60) ? "text-red-600 font-medium" : "")}>{v.heart_rate ?? "—"}</td>
                        <td className={cn("px-4 py-3", (v.blood_glucose > 180 || v.blood_glucose < 70) ? "text-amber-600 font-medium" : "")}>{v.blood_glucose ?? "—"}</td>
                        <td className="px-4 py-3">{v.weight ?? "—"}</td>
                        <td className={cn("px-4 py-3", v.oxygen_saturation < 95 ? "text-red-600 font-medium" : "")}>{v.oxygen_saturation ? `${v.oxygen_saturation}%` : "—"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[140px] truncate">{v.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CONSULTAS ──────────────────────────────────────────────────── */}
      {activeTab === "appointments" && (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <EmptyState icon={Calendar} title="Nenhuma consulta registrada" description="Agende consultas na aba de Agendamentos." actionLabel="Agendamentos" actionHref="/appointments" />
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      {["Paciente","Data","Hora","Tipo","Especialidade","Motivo","Status","Prioridade","Observações"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.filter(a => filterPatient === "all" || a.elderly_id === filterPatient).map(a => (
                      <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                        <td className="px-4 py-3 font-mono font-bold text-xs">{a.elderly_code}</td>
                        <td className="px-4 py-3 text-xs">{a.date}</td>
                        <td className="px-4 py-3">{a.time}</td>
                        <td className="px-4 py-3 text-xs">{a.type}</td>
                        <td className="px-4 py-3 text-xs">{a.specialty || "—"}</td>
                        <td className="px-4 py-3 text-xs max-w-[120px] truncate">{a.reason || "—"}</td>
                        <td className="px-4 py-3"><span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          a.status === "Realizado" ? "bg-slate-100 text-slate-600" :
                          a.status === "Confirmado" ? "bg-emerald-100 text-emerald-700" :
                          a.status === "Cancelado" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                        )}>{a.status}</span></td>
                        <td className={cn("px-4 py-3 text-xs font-medium", a.clinical_priority === "Urgente" ? "text-red-600" : a.clinical_priority === "Alta" ? "text-orange-600" : "text-muted-foreground")}>{a.clinical_priority}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[120px] truncate">{a.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: REGISTROS CLÍNICOS ──────────────────────────────────────────── */}
      {activeTab === "notes" && (
        <div className="space-y-4">
          {notes.length === 0 ? (
            <EmptyState icon={FileText} title="Nenhum registro clínico" description="Registros clínicos aparecem aqui após serem criados no Prontuário." />
          ) : (
            <div className="space-y-3">
              {notes.filter(n => filterPatient === "all" || n.elderly_id === filterPatient).map(n => (
                <div key={n.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-mono font-bold text-xs bg-secondary px-2 py-0.5 rounded">{n.elderly_code}</span>
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{n.note_type}</span>
                    {n.cid_codes && <span className="text-xs font-mono text-muted-foreground">{n.cid_codes}</span>}
                    {n.private && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Confidencial</span>}
                    <span className="text-xs text-muted-foreground ml-auto">{format(new Date(n.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{n.content}</p>
                  {(n.professional_name || n.professional_role) && (
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                      {n.professional_name && <strong>{n.professional_name}</strong>}
                      {n.professional_name && n.professional_role && " · "}
                      {n.professional_role}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold font-dm leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// Needed for tabs
function ClipboardIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/></svg>;
}