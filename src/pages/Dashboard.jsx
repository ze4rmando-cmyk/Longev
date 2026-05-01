import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import ExecutiveDashboard from "@/components/ExecutiveDashboard";
import {
  Users, ClipboardList, AlertTriangle, TrendingUp, Plus, ArrowRight,
  Brain, Activity, HeartPulse, ShieldAlert, Shield, ShieldOff, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AlertBadge from "@/components/AlertBadge";
import EmptyState from "@/components/EmptyState";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell
} from "recharts";

// ── Helpers ─────────────────────────────────────────────────────────────────

function normalizeScore(score, maxScore) {
  if (!maxScore || maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}

function getPatientFragility(patientAssessments) {
  if (patientAssessments.some(a => a.alert_level === "critical")) return "fragil";
  if (patientAssessments.some(a => a.alert_level === "attention")) return "pre-fragil";
  if (patientAssessments.length > 0) return "robusto";
  return "sem-avaliacao";
}

function computeDomainScores(patientAssessments) {
  const meemList = patientAssessments.filter(a => a.test_type === "MEEM");
  const katzList = patientAssessments.filter(a => a.test_type === "Katz");
  const lawtonList = patientAssessments.filter(a => a.test_type === "Lawton");
  const gdsList = patientAssessments.filter(a => a.test_type === "GDS");
  const agaList = patientAssessments.filter(a => a.test_type === "AGA");

  const avg = (list, key = "score", maxKey = "max_score") =>
    list.length > 0 ? list.reduce((s, a) => s + normalizeScore(a[key], a[maxKey]), 0) / list.length : null;

  const cognitivo = avg(meemList);
  const funcionalKatz = avg(katzList);
  const funcionalLawton = avg(lawtonList);
  const funcional = funcionalKatz !== null && funcionalLawton !== null
    ? (funcionalKatz + funcionalLawton) / 2
    : funcionalKatz ?? funcionalLawton;

  // GDS: invert (higher GDS = worse mood → lower score on radar)
  const gdsAvg = avg(gdsList);
  const depressao = gdsAvg !== null ? 100 - gdsAvg : null;

  const abrangente = avg(agaList);

  return { cognitivo, funcional, depressao, abrangente };
}

function getLatestByType(patientAssessments) {
  const types = ["MEEM", "Katz", "Lawton", "GDS", "AGA"];
  const result = {};
  types.forEach(t => {
    const list = patientAssessments.filter(a => a.test_type === t);
    if (list.length > 0) result[t] = list[0]; // already sorted desc
  });
  return result;
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [elderly, setElderly] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [e, a, app] = await Promise.all([
        base44.entities.Elderly.list("-created_date", 200),
        base44.entities.Assessment.list("-created_date", 500),
        base44.entities.Appointment.list("-date", 200),
      ]);
      setElderly(e);
      setAssessments(a);
      setAppointments(app);
      setLoading(false);
    }
    load();
  }, []);

  const { byPatient, fragilityGroups, radarData, criticalPatients, domainBarData } = useMemo(() => {
    // Group assessments by patient
    const byPatient = {};
    elderly.forEach(p => { byPatient[p.id] = { patient: p, assessments: [] }; });
    assessments.forEach(a => {
      if (byPatient[a.elderly_id]) byPatient[a.elderly_id].assessments.push(a);
    });

    // Frailty groups
    const groups = { fragil: [], "pre-fragil": [], robusto: [], "sem-avaliacao": [] };
    Object.values(byPatient).forEach(({ patient, assessments: pa }) => {
      const level = getPatientFragility(pa);
      groups[level].push({ patient, assessments: pa });
    });

    // Radar data: average domain scores per frailty group
    function groupDomainAvg(list) {
      const domains = { cognitivo: [], funcional: [], depressao: [], abrangente: [] };
      list.forEach(({ assessments: pa }) => {
        const scores = computeDomainScores(pa);
        Object.entries(scores).forEach(([k, v]) => { if (v !== null) domains[k].push(v); });
      });
      return {
        cognitivo: domains.cognitivo.length ? Math.round(domains.cognitivo.reduce((s, v) => s + v, 0) / domains.cognitivo.length) : 0,
        funcional: domains.funcional.length ? Math.round(domains.funcional.reduce((s, v) => s + v, 0) / domains.funcional.length) : 0,
        depressao: domains.depressao.length ? Math.round(domains.depressao.reduce((s, v) => s + v, 0) / domains.depressao.length) : 0,
        abrangente: domains.abrangente.length ? Math.round(domains.abrangente.reduce((s, v) => s + v, 0) / domains.abrangente.length) : 0,
      };
    }

    const radarData = [
      { domain: "Cognitivo", Robusto: groupDomainAvg(groups.robusto).cognitivo, "Pré-Frágil": groupDomainAvg(groups["pre-fragil"]).cognitivo, Frágil: groupDomainAvg(groups.fragil).cognitivo },
      { domain: "Funcional", Robusto: groupDomainAvg(groups.robusto).funcional, "Pré-Frágil": groupDomainAvg(groups["pre-fragil"]).funcional, Frágil: groupDomainAvg(groups.fragil).funcional },
      { domain: "Humor", Robusto: groupDomainAvg(groups.robusto).depressao, "Pré-Frágil": groupDomainAvg(groups["pre-fragil"]).depressao, Frágil: groupDomainAvg(groups.fragil).depressao },
      { domain: "Abrangente", Robusto: groupDomainAvg(groups.robusto).abrangente, "Pré-Frágil": groupDomainAvg(groups["pre-fragil"]).abrangente, Frágil: groupDomainAvg(groups.fragil).abrangente },
    ];

    // Critical patients: those with critical assessments, sorted by # of criticals desc
    const criticalPatients = groups.fragil
      .map(({ patient, assessments: pa }) => ({
        patient,
        criticalCount: pa.filter(a => a.alert_level === "critical").length,
        attentionCount: pa.filter(a => a.alert_level === "attention").length,
        latest: getLatestByType(pa),
        lastDate: pa.length > 0 ? pa[0].created_date : null,
      }))
      .sort((a, b) => b.criticalCount - a.criticalCount);

    // Domain bar: per group counts
    const domainBarData = [
      { name: "Frágil", pacientes: groups.fragil.length, fill: "#ef4444" },
      { name: "Pré-Frágil", pacientes: groups["pre-fragil"].length, fill: "#f97316" },
      { name: "Robusto", pacientes: groups.robusto.length, fill: "#10b981" },
      { name: "Sem Avaliação", pacientes: groups["sem-avaliacao"].length, fill: "#94a3b8" },
    ];

    return { byPatient, fragilityGroups: groups, radarData, criticalPatients, domainBarData };
  }, [elderly, assessments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const criticalAlerts = assessments.filter(a => a.alert_level === "critical");
  const attentionAlerts = assessments.filter(a => a.alert_level === "attention");
  const hasData = assessments.length > 0;

  return (
    <div className="space-y-7">
      {/* Header */}
      {/* Executive Dashboard */}
      <ExecutiveDashboard elderly={elderly} assessments={assessments} appointments={appointments} />

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-dm tracking-tight">Monitoramento Individual</h2>
          <p className="text-muted-foreground text-sm mt-1">Visão geral de fragilidade, domínios e alertas por paciente</p>
        </div>
        <Link to="/patients/new">
          <Button className="gap-2"><Plus className="w-4 h-4" />Novo Paciente</Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile icon={Users} label="Pacientes" value={elderly.length} sub="cadastrados" color="text-primary bg-primary/10" />
        <StatTile icon={ClipboardList} label="Avaliações" value={assessments.length} sub="realizadas" color="text-blue-600 bg-blue-50" />
        <StatTile icon={AlertTriangle} label="Críticos" value={criticalAlerts.length} sub="alertas" color="text-red-600 bg-red-50" />
        <StatTile icon={TrendingUp} label="Em Atenção" value={attentionAlerts.length} sub="monitorar" color="text-amber-600 bg-amber-50" />
      </div>

      {/* Frailty distribution */}
      {elderly.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <FragilityCard
            level="fragil"
            icon={ShieldOff}
            label="Frágil"
            count={fragilityGroups.fragil.length}
            total={elderly.length}
            color="bg-red-50 border-red-200 text-red-700"
            bar="bg-red-500"
          />
          <FragilityCard
            level="pre-fragil"
            icon={ShieldAlert}
            label="Pré-Frágil"
            count={fragilityGroups["pre-fragil"].length}
            total={elderly.length}
            color="bg-orange-50 border-orange-200 text-orange-700"
            bar="bg-orange-500"
          />
          <FragilityCard
            level="robusto"
            icon={Shield}
            label="Robusto"
            count={fragilityGroups.robusto.length}
            total={elderly.length}
            color="bg-emerald-50 border-emerald-200 text-emerald-700"
            bar="bg-emerald-500"
          />
          <FragilityCard
            level="sem-avaliacao"
            icon={ClipboardList}
            label="Sem Avaliação"
            count={fragilityGroups["sem-avaliacao"].length}
            total={elderly.length}
            color="bg-secondary border-border text-muted-foreground"
            bar="bg-slate-400"
          />
        </div>
      )}

      {/* Charts row */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Radar chart */}
          <div className="lg:col-span-3 bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-primary" />
              <h2 className="font-semibold font-dm text-sm">Perfil por Domínio — Grupos de Fragilidade</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Pontuação média normalizada (0–100) por domínio clínico, agrupada por nível de fragilidade.</p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <Radar name="Robusto" dataKey="Robusto" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Pré-Frágil" dataKey="Pré-Frágil" stroke="#f97316" fill="#f97316" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Frágil" dataKey="Frágil" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }}
                  formatter={(v) => [`${v}%`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="font-semibold font-dm text-sm">Distribuição de Fragilidade</h2>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={domainBarData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }}
                  formatter={(v) => [`${v} paciente${v !== 1 ? "s" : ""}`, ""]}
                />
                <Bar dataKey="pacientes" radius={[0, 6, 6, 0]}>
                  {domainBarData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Critical patients */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h2 className="text-lg font-semibold font-dm">Pacientes com Alertas Críticos — Intervenção Urgente</h2>
          </div>
          {criticalPatients.length > 0 && (
            <Link to="/patients" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {criticalPatients.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800 text-sm">Nenhum paciente em estado crítico</p>
              <p className="text-xs text-emerald-700 mt-0.5">Todos os pacientes avaliados estão em níveis normal ou atenção.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {criticalPatients.slice(0, 8).map(({ patient, criticalCount, attentionCount, latest, lastDate }) => (
              <Link
                key={patient.id}
                to={`/patients/${patient.id}`}
                className="flex items-center gap-4 bg-card rounded-xl border border-red-200 p-4 hover:shadow-md hover:border-red-300 transition-all group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>

                {/* Patient info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm font-mono">{patient.anonymous_code}</span>
                    <span className="text-xs text-muted-foreground">{patient.age} anos • {patient.sex}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {Object.entries(latest).map(([type, assessment]) => (
                      <AlertBadge key={type} level={assessment.alert_level} label={type} />
                    ))}
                  </div>
                </div>

                {/* Counters */}
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                      {criticalCount} crítico{criticalCount !== 1 ? "s" : ""}
                    </span>
                    {attentionCount > 0 && (
                      <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {attentionCount} atenção
                      </span>
                    )}
                  </div>
                  {lastDate && (
                    <span className="text-xs text-muted-foreground">
                      Última: {format(new Date(lastDate), "dd/MM/yy", { locale: ptBR })}
                    </span>
                  )}
                </div>

                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Domain indicators */}
      {hasData && (
        <div>
          <h2 className="text-lg font-semibold font-dm mb-4">Indicadores por Domínio Clínico</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DomainIndicator
              icon={Brain}
              title="Domínio Cognitivo"
              subtitle="MEEM"
              alertCount={assessments.filter(a => a.test_type === "MEEM" && a.alert_level !== "normal").length}
              total={assessments.filter(a => a.test_type === "MEEM").length}
              criticalCount={assessments.filter(a => a.test_type === "MEEM" && a.alert_level === "critical").length}
              color="text-purple-600 bg-purple-50"
              barColor="bg-purple-500"
            />
            <DomainIndicator
              icon={Activity}
              title="Domínio Funcional"
              subtitle="Katz + Lawton"
              alertCount={assessments.filter(a => ["Katz","Lawton"].includes(a.test_type) && a.alert_level !== "normal").length}
              total={assessments.filter(a => ["Katz","Lawton"].includes(a.test_type)).length}
              criticalCount={assessments.filter(a => ["Katz","Lawton"].includes(a.test_type) && a.alert_level === "critical").length}
              color="text-blue-600 bg-blue-50"
              barColor="bg-blue-500"
            />
            <DomainIndicator
              icon={HeartPulse}
              title="Domínio do Humor"
              subtitle="GDS-15"
              alertCount={assessments.filter(a => a.test_type === "GDS" && a.alert_level !== "normal").length}
              total={assessments.filter(a => a.test_type === "GDS").length}
              criticalCount={assessments.filter(a => a.test_type === "GDS" && a.alert_level === "critical").length}
              color="text-rose-600 bg-rose-50"
              barColor="bg-rose-500"
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {elderly.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum paciente cadastrado"
          description="Cadastre o primeiro paciente para visualizar o dashboard clínico."
          actionLabel="Cadastrar Paciente"
          actionHref="/patients/new"
        />
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatTile({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold font-dm leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label} · {sub}</p>
      </div>
    </div>
  );
}

function FragilityCard({ icon: Icon, label, count, total, color, bar }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-3xl font-bold font-dm">{count}</p>
      <p className="text-xs opacity-70 mt-0.5">{pct}% do total</p>
      <div className="mt-2 h-1 bg-black/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DomainIndicator({ icon: Icon, title, subtitle, alertCount, total, criticalCount, color, barColor }) {
  const pct = total > 0 ? Math.round((alertCount / total) * 100) : 0;
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-end justify-between mb-2">
        <div>
          <span className="text-2xl font-bold font-dm">{alertCount}</span>
          <span className="text-sm text-muted-foreground ml-1">/ {total} com alerta</span>
        </div>
        {criticalCount > 0 && (
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            {criticalCount} crítico{criticalCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{pct}% de alertas</p>
    </div>
  );
}