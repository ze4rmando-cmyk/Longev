import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft, Plus, FileText, Activity, Brain, HeartPulse,
  Pill, Stethoscope, ClipboardList, Printer, User, Calendar,
  AlertTriangle, ChevronDown, ChevronUp, Shield, Zap, Download,
  Heart, Thermometer, Weight, Droplets, Sparkles, Eye, EyeOff,
  CheckCircle, XCircle, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AlertBadge from "@/components/AlertBadge";
import ClinicalNoteForm from "@/components/ClinicalNoteForm";
import DrugInteractionChecker from "@/components/DrugInteractionChecker";
import EmptyState from "@/components/EmptyState";
import { cn } from "@/lib/utils";

// ── Constants ────────────────────────────────────────────────────────────────
const NOTE_TYPE_COLORS = {
  "Evolução Clínica": "bg-blue-50 text-blue-700 border-blue-200",
  "Anamnese": "bg-purple-50 text-purple-700 border-purple-200",
  "Hipótese Diagnóstica": "bg-orange-50 text-orange-700 border-orange-200",
  "Prescrição": "bg-green-50 text-green-700 border-green-200",
  "Procedimento": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Alta/Encaminhamento": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Intercorrência": "bg-red-50 text-red-700 border-red-200",
  "Observação": "bg-slate-50 text-slate-700 border-slate-200",
};

const NOTE_ICONS = {
  "Evolução Clínica": Activity,
  "Anamnese": User,
  "Hipótese Diagnóstica": Brain,
  "Prescrição": Pill,
  "Procedimento": Stethoscope,
  "Alta/Encaminhamento": FileText,
  "Intercorrência": AlertTriangle,
  "Observação": ClipboardList,
};

const TEST_COLORS = {
  MEEM: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100" },
  Katz: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100" },
  Lawton: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", badge: "bg-indigo-100" },
  GDS: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", badge: "bg-rose-100" },
  AGA: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100" },
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function MedicalRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [patient, setPatient] = useState(null);
  const [notes, setNotes] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteFilter, setNoteFilter] = useState("Todos");
  const [expandedNotes, setExpandedNotes] = useState({});

  const load = async () => {
    const [patients, allNotes, allAssessments, allVitals] = await Promise.all([
      base44.entities.Elderly.filter({ id }),
      base44.entities.ClinicalNote.filter({ elderly_id: id }, "-created_date", 200),
      base44.entities.Assessment.filter({ elderly_id: id }, "-created_date", 100),
      base44.entities.VitalSign.filter({ elderly_id: id }, "-created_date", 50),
    ]);
    setPatient(patients[0] || null);
    setNotes(allNotes);
    setAssessments(allAssessments);
    setVitals(allVitals);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleNoteSaved = () => { setShowNoteForm(false); load(); };
  const toggleNote = (noteId) => setExpandedNotes(prev => ({ ...prev, [noteId]: !prev[noteId] }));

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!patient) return <EmptyState title="Paciente não encontrado" description="O paciente não existe." />;

  // Computed
  const criticalAssessments = assessments.filter(a => a.alert_level === "critical");
  const attentionAssessments = assessments.filter(a => a.alert_level === "attention");
  const latestByType = {};
  assessments.forEach(a => { if (!latestByType[a.test_type]) latestByType[a.test_type] = a; });
  const latestVital = vitals[0] || null;
  const allNoteTypes = ["Todos", ...new Set(notes.map(n => n.note_type))];
  const filteredNotes = noteFilter === "Todos" ? notes : notes.filter(n => n.note_type === noteFilter);

  return (
    <div className="max-w-5xl mx-auto space-y-0 print:space-y-0" ref={printRef}>

      {/* ── SCREEN-ONLY TOOLBAR ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-5 print:hidden sticky top-14 z-10 bg-background/95 backdrop-blur py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${id}`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold font-dm">Prontuário Eletrônico</h1>
            <p className="text-sm text-muted-foreground">{patient.anonymous_code} · {patient.age} anos · {patient.sex}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5" /> Imprimir / PDF
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setShowNoteForm(!showNoteForm)}>
            <Plus className="w-3.5 h-3.5" /> {showNoteForm ? "Cancelar" : "Novo Registro"}
          </Button>
        </div>
      </div>

      {/* Note form (screen only) */}
      {showNoteForm && (
        <div className="mb-5 print:hidden">
          <ClinicalNoteForm patient={patient} onSaved={handleNoteSaved} onCancel={() => setShowNoteForm(false)} />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* DOCUMENTO DO PRONTUÁRIO — visível tanto na tela quanto no print   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm print:shadow-none print:border-none print:rounded-none">

        {/* ── CABEÇALHO DO DOCUMENTO ───────────────────────────────────── */}
        <div className="bg-primary px-6 py-5 print:py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl font-dm">GeriCare Research</h1>
                <p className="text-white/70 text-xs">Prontuário Eletrônico do Paciente</p>
              </div>
            </div>
            <div className="text-right text-white/80 text-xs space-y-0.5">
              <p>Emissão: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              <p>Código: <strong className="text-white font-mono">{patient.anonymous_code}</strong></p>
              <p className={cn(
                "inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                criticalAssessments.length > 0 ? "bg-red-500/80 text-white" :
                attentionAssessments.length > 0 ? "bg-amber-400/80 text-white" :
                "bg-emerald-400/80 text-white"
              )}>
                {criticalAssessments.length > 0 ? "⚠ ALERTAS CRÍTICOS" :
                 attentionAssessments.length > 0 ? "⚡ EM ATENÇÃO" : "✓ ESTÁVEL"}
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">

          {/* ── SEÇÃO 1: IDENTIFICAÇÃO DO PACIENTE ──────────────────────── */}
          <Section title="1. Identificação do Paciente" icon={User}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InfoBlock label="Código Anônimo" value={patient.anonymous_code} mono />
              <InfoBlock label="Idade" value={`${patient.age} anos`} />
              <InfoBlock label="Sexo" value={patient.sex} />
              <InfoBlock label="Status" value={patient.status || "Ativo"} badge
                badgeColor={patient.status === "Ativo" ? "bg-emerald-100 text-emerald-700" :
                            patient.status === "Concluído" ? "bg-blue-100 text-blue-700" :
                            "bg-secondary text-muted-foreground"} />
            </div>
            {patient.health_conditions && (
              <div className="mt-4 p-3 bg-secondary/50 rounded-xl">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Condições de Saúde</p>
                <p className="text-sm whitespace-pre-wrap">{patient.health_conditions}</p>
              </div>
            )}
            {patient.medications && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Medicamentos em Uso</p>
                <p className="text-sm whitespace-pre-wrap">{patient.medications}</p>
              </div>
            )}
            {patient.notes && (
              <div className="mt-3 p-3 bg-secondary/30 rounded-xl">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Observações Gerais</p>
                <p className="text-sm whitespace-pre-wrap">{patient.notes}</p>
              </div>
            )}
          </Section>

          {/* ── SEÇÃO 2: ALERTAS CLÍNICOS ───────────────────────────────── */}
          {(criticalAssessments.length > 0 || attentionAssessments.length > 0) && (
            <Section title="2. Alertas Clínicos Ativos" icon={AlertTriangle} danger>
              <div className={cn(
                "rounded-xl border p-4 flex items-start gap-3",
                criticalAssessments.length > 0 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
              )}>
                <AlertTriangle className={cn("w-5 h-5 shrink-0 mt-0.5", criticalAssessments.length > 0 ? "text-red-600" : "text-amber-600")} />
                <div className="flex-1">
                  <p className={cn("font-semibold text-sm", criticalAssessments.length > 0 ? "text-red-800" : "text-amber-800")}>
                    {criticalAssessments.length > 0 ? `${criticalAssessments.length} avaliação(ões) crítica(s) — Intervenção necessária` : "Avaliações em nível de atenção"}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {criticalAssessments.map(a => (
                      <span key={a.id} className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-semibold">{a.test_type}</span>
                    ))}
                    {attentionAssessments.map(a => (
                      <span key={a.id} className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">{a.test_type}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* ── SEÇÃO 3: AVALIAÇÕES CLÍNICAS ────────────────────────────── */}
          <Section title="3. Avaliações Clínicas" icon={ClipboardList} count={assessments.length}>
            {assessments.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-4">Nenhuma avaliação realizada.</p>
            ) : (
              <>
                {/* Resumo das últimas avaliações */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
                  {Object.entries(latestByType).map(([type, a]) => {
                    const c = TEST_COLORS[type] || TEST_COLORS.AGA;
                    return (
                      <div key={type} className={cn("rounded-xl border p-3 text-center", c.bg, c.border)}>
                        <p className={cn("text-xs font-bold uppercase", c.text)}>{type}</p>
                        <p className={cn("text-2xl font-bold font-dm mt-1", c.text)}>
                          {a.score}<span className="text-xs font-normal opacity-60">/{a.max_score}</span>
                        </p>
                        <span className={cn("inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1", c.badge, c.text)}>
                          {a.classification}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {format(new Date(a.created_date), "dd/MM/yy", { locale: ptBR })}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Histórico completo */}
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Histórico Completo de Avaliações</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Teste</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Score</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Classificação</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Alerta</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Data</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.map(a => (
                        <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                          <td className="px-3 py-2 font-semibold">{a.test_type}</td>
                          <td className="px-3 py-2">{a.score}{a.max_score ? `/${a.max_score}` : ""}</td>
                          <td className="px-3 py-2">{a.classification}</td>
                          <td className="px-3 py-2"><AlertBadge level={a.alert_level} /></td>
                          <td className="px-3 py-2 text-muted-foreground text-xs">
                            {format(new Date(a.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground max-w-[200px] truncate">{a.notes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Section>

          {/* ── SEÇÃO 4: SINAIS VITAIS ───────────────────────────────────── */}
          <Section title="4. Sinais Vitais" icon={Activity} count={vitals.length}>
            {vitals.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-4">Nenhum registro de sinais vitais.</p>
            ) : (
              <>
                {/* Últimos registros */}
                {latestVital && (
                  <>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                      Último Registro — {format(new Date(latestVital.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
                      {latestVital.systolic && latestVital.diastolic && (
                        <VitalCard label="Pressão Arterial" value={`${latestVital.systolic}/${latestVital.diastolic}`} unit="mmHg"
                          alert={latestVital.systolic > 140 || latestVital.diastolic > 90} color="red" />
                      )}
                      {latestVital.heart_rate && (
                        <VitalCard label="Freq. Cardíaca" value={latestVital.heart_rate} unit="bpm"
                          alert={latestVital.heart_rate > 100 || latestVital.heart_rate < 60} color="rose" />
                      )}
                      {latestVital.blood_glucose && (
                        <VitalCard label="Glicemia" value={latestVital.blood_glucose} unit="mg/dL"
                          alert={latestVital.blood_glucose > 180 || latestVital.blood_glucose < 70} color="amber" />
                      )}
                      {latestVital.weight && (
                        <VitalCard label="Peso" value={latestVital.weight} unit="kg" color="blue" />
                      )}
                      {latestVital.oxygen_saturation && (
                        <VitalCard label="SpO₂" value={latestVital.oxygen_saturation} unit="%"
                          alert={latestVital.oxygen_saturation < 95} color="cyan" />
                      )}
                    </div>
                  </>
                )}

                {/* Tabela histórica */}
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Histórico de Registros</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        {["Data/Hora", "PA (mmHg)", "FC (bpm)", "Glicemia (mg/dL)", "Peso (kg)", "SpO₂ (%)"].map(h => (
                          <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {vitals.map(v => (
                        <tr key={v.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                          <td className="px-3 py-2 text-muted-foreground">{format(new Date(v.created_date), "dd/MM/yy HH:mm")}</td>
                          <td className={cn("px-3 py-2 font-medium", v.systolic > 140 ? "text-red-600" : "")}>
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
                </div>
              </>
            )}
          </Section>

          {/* ── SEÇÃO 5: INTERAÇÕES MEDICAMENTOSAS ──────────────────────── */}
          {patient.medications && (
            <Section title="5. Análise de Interações Medicamentosas" icon={Pill}>
              <DrugInteractionChecker medications={patient.medications} />
            </Section>
          )}

          {/* ── SEÇÃO 6: REGISTROS CLÍNICOS ─────────────────────────────── */}
          <Section title="6. Registros Clínicos" icon={FileText} count={notes.length}>
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-4">Nenhum registro clínico.</p>
            ) : (
              <>
                {/* Filtros de tipo (apenas tela) */}
                <div className="flex flex-wrap gap-2 mb-4 print:hidden">
                  {allNoteTypes.map(t => (
                    <button key={t} onClick={() => setNoteFilter(t)}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full font-medium transition-all border",
                        noteFilter === t
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                      )}>
                      {t} {t !== "Todos" && <span className="ml-1 opacity-60">({notes.filter(n => n.note_type === t).length})</span>}
                    </button>
                  ))}
                </div>

                {/* Resumo de tipos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {Object.entries(Object.groupBy ? Object.groupBy(notes, n => n.note_type) :
                    notes.reduce((acc, n) => { acc[n.note_type] = (acc[n.note_type] || []); acc[n.note_type].push(n); return acc; }, {}))
                    .map(([type, typeNotes]) => {
                      const colorClass = NOTE_TYPE_COLORS[type] || "bg-slate-50 text-slate-700 border-slate-200";
                      return (
                        <div key={type} className={cn("rounded-xl border p-2.5 text-center", colorClass)}>
                          <p className="text-[10px] font-bold uppercase tracking-wide">{type}</p>
                          <p className="text-xl font-bold font-dm mt-0.5">{typeNotes.length}</p>
                        </div>
                      );
                    })}
                </div>

                {/* Notas */}
                <div className="space-y-3">
                  {filteredNotes.map(note => (
                    <NoteCard key={note.id} note={note} expanded={expandedNotes[note.id] !== false} onToggle={() => toggleNote(note.id)} />
                  ))}
                </div>
              </>
            )}
          </Section>

          {/* ── SEÇÃO 7: DIAGNÓSTICOS HIPÓTESES ─────────────────────────── */}
          {notes.filter(n => n.note_type === "Hipótese Diagnóstica").length > 0 && (
            <Section title="7. Hipóteses Diagnósticas" icon={Brain}>
              <div className="space-y-3">
                {notes.filter(n => n.note_type === "Hipótese Diagnóstica").map(note => (
                  <NoteCard key={note.id} note={note} expanded onToggle={() => {}} forceExpand />
                ))}
              </div>
            </Section>
          )}

          {/* ── SEÇÃO 8: PRESCRIÇÕES ────────────────────────────────────── */}
          {notes.filter(n => n.note_type === "Prescrição").length > 0 && (
            <Section title="8. Prescrições" icon={Pill}>
              <div className="space-y-3">
                {notes.filter(n => n.note_type === "Prescrição").map(note => (
                  <NoteCard key={note.id} note={note} expanded onToggle={() => {}} forceExpand />
                ))}
              </div>
            </Section>
          )}

          {/* ── RODAPÉ DO DOCUMENTO ─────────────────────────────────────── */}
          <div className="px-6 py-4 bg-secondary/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5" />
                <span>Este documento é gerado pelo GeriCare Research para fins de pesquisa científica. Não substitui o prontuário oficial.</span>
              </div>
              <p className="shrink-0">GeriCare Research · {format(new Date(), "yyyy")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page { margin: 1.5cm; size: A4; }
          body { font-size: 11px !important; }
          .print\\:hidden { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .sticky { position: static !important; }
        }
      `}</style>
    </div>
  );
}

// ── Section Wrapper ───────────────────────────────────────────────────────────
function Section({ title, icon: Icon, count, children, danger }) {
  return (
    <div className="px-6 py-5">
      <div className="flex items-center gap-2 mb-4">
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
          danger ? "bg-red-100" : "bg-primary/10")}>
          <Icon className={cn("w-3.5 h-3.5", danger ? "text-red-600" : "text-primary")} />
        </div>
        <h2 className={cn("font-bold font-dm text-sm", danger ? "text-red-700" : "text-foreground")}>{title}</h2>
        {count !== undefined && count > 0 && (
          <span className="ml-auto text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium">{count} registro{count !== 1 ? "s" : ""}</span>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Info Block ────────────────────────────────────────────────────────────────
function InfoBlock({ label, value, mono, badge, badgeColor }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">{label}</p>
      {badge ? (
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", badgeColor)}>{value}</span>
      ) : (
        <p className={cn("text-sm font-medium", mono && "font-mono")}>{value || "—"}</p>
      )}
    </div>
  );
}

// ── Vital Card ────────────────────────────────────────────────────────────────
function VitalCard({ label, value, unit, alert, color }) {
  const colors = {
    red: { bg: "bg-red-50 border-red-100", text: "text-red-700" },
    rose: { bg: "bg-rose-50 border-rose-100", text: "text-rose-700" },
    amber: { bg: "bg-amber-50 border-amber-100", text: "text-amber-700" },
    blue: { bg: "bg-blue-50 border-blue-100", text: "text-blue-700" },
    cyan: { bg: "bg-cyan-50 border-cyan-100", text: "text-cyan-700" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={cn("rounded-xl border p-3 text-center", c.bg)}>
      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
      <p className={cn("text-xl font-bold font-dm mt-0.5", c.text)}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{unit}</p>
      {alert && <p className="text-[10px] text-red-600 font-bold mt-0.5">⚠ Fora do intervalo</p>}
    </div>
  );
}

// ── Note Card ─────────────────────────────────────────────────────────────────
function NoteCard({ note, expanded, onToggle, forceExpand }) {
  const colorClass = NOTE_TYPE_COLORS[note.note_type] || "bg-slate-50 text-slate-700 border-slate-200";
  const Icon = NOTE_ICONS[note.note_type] || FileText;
  const isLong = note.content?.length > 300;
  const showFull = forceExpand || expanded;

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden print:break-inside-avoid">
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0", colorClass)}>
            <Icon className="w-3 h-3" />
            {note.note_type}
          </span>
          {note.cid_codes && (
            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-mono shrink-0">{note.cid_codes}</span>
          )}
          {note.private && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0">Confidencial</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">
            {format(new Date(note.created_date), "dd/MM/yy HH:mm", { locale: ptBR })}
          </span>
          {isLong && !forceExpand && (
            <button onClick={onToggle} className="text-muted-foreground hover:text-foreground print:hidden">
              {showFull ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      <div className="px-4 pb-4">
        <p className={cn("text-sm leading-relaxed whitespace-pre-wrap", !showFull && isLong && "line-clamp-3 print:line-clamp-none")}>
          {note.content}
        </p>
        {(note.professional_name || note.professional_role) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-3 h-3 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">
              {note.professional_name && <strong className="text-foreground">{note.professional_name}</strong>}
              {note.professional_name && note.professional_role && " · "}
              {note.professional_role}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}