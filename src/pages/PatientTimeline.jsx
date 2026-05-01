import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft, ClipboardList, Activity, FileText, Calendar,
  Brain, HeartPulse, AlertTriangle, Shield, ShieldAlert, ShieldOff, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EVENT_TYPES = {
  assessment: {
    label: "Avaliação",
    icon: ClipboardList,
    color: "bg-purple-50 border-purple-200 text-purple-700",
    dot: "bg-purple-500",
  },
  vital: {
    label: "Sinais Vitais",
    icon: Activity,
    color: "bg-blue-50 border-blue-200 text-blue-700",
    dot: "bg-blue-500",
  },
  note: {
    label: "Registro Clínico",
    icon: FileText,
    color: "bg-green-50 border-green-200 text-green-700",
    dot: "bg-green-500",
  },
  appointment: {
    label: "Consulta",
    icon: Calendar,
    color: "bg-orange-50 border-orange-200 text-orange-700",
    dot: "bg-orange-500",
  },
};

function alertIcon(level) {
  if (level === "critical") return <ShieldOff className="w-3.5 h-3.5 text-red-600" />;
  if (level === "attention") return <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />;
  return <Shield className="w-3.5 h-3.5 text-emerald-600" />;
}

export default function PatientTimeline() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const [patients, assessments, vitals, notes, appointments] = await Promise.all([
        base44.entities.Elderly.filter({ id }),
        base44.entities.Assessment.filter({ elderly_id: id }, "-created_date", 200),
        base44.entities.VitalSign.filter({ elderly_id: id }, "-created_date", 100),
        base44.entities.ClinicalNote.filter({ elderly_id: id }, "-created_date", 200),
        base44.entities.Appointment.filter({ elderly_id: id }, "-date", 100),
      ]);
      setPatient(patients[0] || null);

      const allEvents = [
        ...assessments.map(a => ({ type: "assessment", date: a.created_date, data: a })),
        ...vitals.map(v => ({ type: "vital", date: v.created_date, data: v })),
        ...notes.map(n => ({ type: "note", date: n.created_date, data: n })),
        ...appointments.map(a => ({
          type: "appointment",
          date: a.date + "T" + (a.time || "00:00") + ":00",
          data: a,
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setEvents(allEvents);
      setLoading(false);
    }
    load();
  }, [id]);

  const filtered = filter === "all" ? events : events.filter(e => e.type === filter);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!patient) return <div className="text-center py-20 text-muted-foreground">Paciente não encontrado.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${id}`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold font-dm flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Linha do Tempo — {patient.anonymous_code}
          </h1>
          <p className="text-sm text-muted-foreground">{patient.age} anos · {patient.sex} · {events.length} eventos registrados</p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "Todos", count: events.length },
          { key: "assessment", label: "Avaliações", count: events.filter(e => e.type === "assessment").length },
          { key: "vital", label: "Sinais Vitais", count: events.filter(e => e.type === "vital").length },
          { key: "note", label: "Registros", count: events.filter(e => e.type === "note").length },
          { key: "appointment", label: "Consultas", count: events.filter(e => e.type === "appointment").length },
        ].map(({ key, label, count }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              filter === key ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/40"
            )}>
            {label} <span className="ml-1 opacity-70">({count})</span>
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum evento encontrado.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4 pl-14">
            {filtered.map((event, idx) => {
              const cfg = EVENT_TYPES[event.type];
              const Icon = cfg.icon;
              const d = event.data;
              const dateStr = format(new Date(event.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

              return (
                <div key={`${event.type}-${idx}`} className="relative">
                  {/* Dot */}
                  <div className={cn("absolute -left-9 w-4 h-4 rounded-full border-2 border-white shadow-sm", cfg.dot)} />

                  <div className={cn("bg-card rounded-xl border p-4 hover:shadow-sm transition-all", cfg.color.split(" ")[1])}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border", cfg.color)}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                        {/* Assessment type badge */}
                        {event.type === "assessment" && (
                          <span className="text-xs font-bold bg-secondary px-2 py-0.5 rounded-full">{d.test_type}</span>
                        )}
                        {/* Note type badge */}
                        {event.type === "note" && (
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{d.note_type}</span>
                        )}
                        {/* Appointment type badge */}
                        {event.type === "appointment" && (
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{d.type} · {d.status}</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{dateStr}</span>
                    </div>

                    {/* Content */}
                    {event.type === "assessment" && (
                      <div className="flex items-center gap-3">
                        {alertIcon(d.alert_level)}
                        <span className="text-sm font-medium">{d.classification}</span>
                        <span className="text-sm text-muted-foreground">Score: {d.score}{d.max_score ? `/${d.max_score}` : ""}</span>
                        {d.max_score && <span className="text-xs text-muted-foreground">({Math.round(d.score / d.max_score * 100)}%)</span>}
                      </div>
                    )}

                    {event.type === "vital" && (
                      <div className="flex flex-wrap gap-3 text-sm">
                        {d.systolic && d.diastolic && <span className={cn("font-medium", d.systolic > 140 ? "text-red-600" : "")}><span className="text-muted-foreground text-xs">PA:</span> {d.systolic}/{d.diastolic} mmHg</span>}
                        {d.heart_rate && <span><span className="text-muted-foreground text-xs">FC:</span> {d.heart_rate} bpm</span>}
                        {d.blood_glucose && <span className={cn(d.blood_glucose > 180 ? "text-amber-600 font-medium" : "")}><span className="text-muted-foreground text-xs">Glicemia:</span> {d.blood_glucose} mg/dL</span>}
                        {d.weight && <span><span className="text-muted-foreground text-xs">Peso:</span> {d.weight} kg</span>}
                        {d.oxygen_saturation && <span className={cn(d.oxygen_saturation < 95 ? "text-red-600 font-medium" : "")}><span className="text-muted-foreground text-xs">SpO₂:</span> {d.oxygen_saturation}%</span>}
                      </div>
                    )}

                    {event.type === "note" && (
                      <p className="text-sm line-clamp-3 leading-relaxed">{d.content}</p>
                    )}

                    {event.type === "appointment" && (
                      <div className="text-sm">
                        {d.specialty && <p className="font-medium">{d.specialty}</p>}
                        {d.reason && <p className="text-muted-foreground">{d.reason}</p>}
                        {d.clinical_priority !== "Normal" && (
                          <span className="text-xs font-bold text-red-600 mt-1 inline-block">⚡ {d.clinical_priority}</span>
                        )}
                      </div>
                    )}

                    {/* Notes / observations */}
                    {(event.type !== "note" && d.notes) && (
                      <p className="text-xs text-muted-foreground mt-2 italic">{d.notes}</p>
                    )}
                    {d.professional_name && (
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">{d.professional_name}{d.professional_role ? ` · ${d.professional_role}` : ""}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}