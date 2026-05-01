import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Clock, User,
  Video, MapPin, Stethoscope, AlertTriangle, CheckCircle,
  XCircle, RotateCcw, Bell, Filter, Search, Home, FlaskConical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import AppointmentModal from "@/components/AppointmentModal";

// ── Constants ─────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  "Presencial":         { icon: MapPin,       color: "bg-blue-50 text-blue-700 border-blue-200",    dot: "bg-blue-500" },
  "Telemedicina":       { icon: Video,         color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  "Visita Domiciliar":  { icon: Home,          color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  "Exame":              { icon: FlaskConical,  color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  "Retorno":            { icon: RotateCcw,     color: "bg-cyan-50 text-cyan-700 border-cyan-200",    dot: "bg-cyan-500" },
};

const STATUS_CONFIG = {
  "Agendado":   { color: "bg-blue-100 text-blue-700",    icon: Clock },
  "Confirmado": { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  "Realizado":  { color: "bg-slate-100 text-slate-600",  icon: CheckCircle },
  "Cancelado":  { color: "bg-red-100 text-red-700",      icon: XCircle },
  "Remarcado":  { color: "bg-amber-100 text-amber-700",  icon: RotateCcw },
};

const PRIORITY_COLORS = {
  "Urgente":   "bg-red-500",
  "Alta":      "bg-orange-400",
  "Normal":    "bg-blue-400",
  "Preventiva":"bg-emerald-400",
};

export default function Appointments() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  const load = async () => {
    const [apps, pts] = await Promise.all([
      base44.entities.Appointment.list("-date", 500),
      base44.entities.Elderly.list("-created_date", 200),
    ]);
    setAppointments(apps);
    setPatients(pts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const patientMap = useMemo(() => {
    const m = {};
    patients.forEach(p => { m[p.id] = p; });
    return m;
  }, [patients]);

  // Calendar grid
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const startDow = (start.getDay() + 6) % 7; // Mon=0
    const prefixDays = Array(startDow).fill(null);
    return [...prefixDays, ...days];
  }, [currentMonth]);

  // Appointments per day map
  const appointmentsByDay = useMemo(() => {
    const map = {};
    appointments.forEach(a => {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    });
    return map;
  }, [appointments]);

  // Selected day appointments (filtered)
  const selectedDayApps = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    let list = (appointmentsByDay[dateStr] || []).sort((a, b) => a.time.localeCompare(b.time));
    if (filterStatus !== "all") list = list.filter(a => a.status === filterStatus);
    if (filterType !== "all") list = list.filter(a => a.type === filterType);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a => a.elderly_code?.toLowerCase().includes(q) || a.specialty?.toLowerCase().includes(q) || a.reason?.toLowerCase().includes(q));
    }
    return list;
  }, [selectedDate, appointmentsByDay, filterStatus, filterType, search]);

  // Upcoming appointments (next 7 days)
  const upcomingApps = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return appointments
      .filter(a => a.date >= today && a.status !== "Cancelado" && a.status !== "Realizado")
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 8);
  }, [appointments]);

  // Stats
  const stats = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const thisMonth = format(currentMonth, "yyyy-MM");
    return {
      today: appointments.filter(a => a.date === today).length,
      thisMonth: appointments.filter(a => a.date?.startsWith(thisMonth)).length,
      pending: appointments.filter(a => a.status === "Agendado" || a.status === "Confirmado").length,
      urgent: appointments.filter(a => a.clinical_priority === "Urgente" && (a.status === "Agendado" || a.status === "Confirmado")).length,
    };
  }, [appointments, currentMonth]);

  const handleSaved = () => { setShowModal(false); setEditingApp(null); load(); };
  const handleEdit = (app) => { setEditingApp(app); setShowModal(true); };
  const handleNewOnDate = () => { setEditingApp(null); setShowModal(true); };

  const handleStatusChange = async (appId, newStatus) => {
    await base44.entities.Appointment.update(appId, { status: newStatus });
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-dm tracking-tight flex items-center gap-2">
            <Calendar className="w-7 h-7 text-primary" />
            Agendamento de Consultas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie consultas presenciais, telemedicina e retornos</p>
        </div>
        <Button className="gap-2" onClick={handleNewOnDate}>
          <Plus className="w-4 h-4" /> Nova Consulta
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Clock} label="Hoje" value={stats.today} color="text-primary bg-primary/10" />
        <StatCard icon={Calendar} label="Este Mês" value={stats.thisMonth} color="text-blue-600 bg-blue-50" />
        <StatCard icon={CheckCircle} label="Pendentes" value={stats.pending} color="text-amber-600 bg-amber-50" />
        <StatCard icon={AlertTriangle} label="Urgentes" value={stats.urgent} color="text-red-600 bg-red-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── CALENDÁRIO ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-2xl border border-border p-5">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="font-bold font-dm text-base capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const dateStr = format(day, "yyyy-MM-dd");
                const dayApps = appointmentsByDay[dateStr] || [];
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const today = isToday(day);

                // Dots by type (max 3)
                const dots = dayApps.slice(0, 3).map(a => TYPE_CONFIG[a.type]?.dot || "bg-primary");

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "relative rounded-xl p-1.5 min-h-[52px] flex flex-col items-center transition-all",
                      isSelected ? "bg-primary text-primary-foreground shadow-md" :
                      today ? "bg-primary/10 text-primary font-bold" :
                      "hover:bg-secondary",
                      !isCurrentMonth && "opacity-30"
                    )}
                  >
                    <span className={cn("text-sm font-medium leading-none", today && !isSelected && "text-primary")}>{day.getDate()}</span>
                    {dayApps.length > 0 && (
                      <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                        {dots.map((dot, i) => (
                          <span key={i} className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-white/80" : dot)} />
                        ))}
                        {dayApps.length > 3 && (
                          <span className={cn("text-[9px] font-bold", isSelected ? "text-white/80" : "text-muted-foreground")}>+{dayApps.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
              {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
                <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                  {type}
                </div>
              ))}
            </div>
          </div>

          {/* ── AGENDA DO DIA SELECIONADO ─── */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold font-dm capitalize">
                  {isToday(selectedDate) ? "Hoje — " : ""}
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedDayApps.length} consulta{selectedDayApps.length !== 1 ? "s" : ""}</p>
              </div>
              <Button size="sm" className="gap-1.5" onClick={handleNewOnDate}>
                <Plus className="w-3.5 h-3.5" /> Agendar
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="relative flex-1 min-w-[160px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-8 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.keys(STATUS_CONFIG).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.keys(TYPE_CONFIG).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {selectedDayApps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma consulta para este dia</p>
                <button onClick={handleNewOnDate} className="text-primary text-sm hover:underline mt-1">Agendar consulta</button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDayApps.map(app => (
                  <AppointmentCard key={app.id} app={app} patient={patientMap[app.elderly_id]} onEdit={handleEdit} onStatusChange={handleStatusChange} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── SIDEBAR DIREITA ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Próximas consultas */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="font-bold font-dm text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Próximas Consultas
            </h3>
            {upcomingApps.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhuma consulta agendada.</p>
            ) : (
              <div className="space-y-2">
                {upcomingApps.map(app => {
                  const patient = patientMap[app.elderly_id];
                  const typeCfg = TYPE_CONFIG[app.type] || TYPE_CONFIG["Presencial"];
                  const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG["Agendado"];
                  const UpcomingIcon = typeCfg.icon;
                  return (
                    <div key={app.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors cursor-pointer"
                      onClick={() => { setSelectedDate(new Date(app.date + "T12:00:00")); setCurrentMonth(new Date(app.date + "T12:00:00")); }}>
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border", typeCfg.color)}>
                        <UpcomingIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-mono text-xs font-bold truncate">{patient?.anonymous_code || app.elderly_code}</p>
                          <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0", statusCfg.color)}>{app.status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{app.specialty || app.reason}</p>
                        <p className="text-[10px] text-primary font-medium mt-0.5">
                          {format(new Date(app.date + "T12:00:00"), "dd/MM", { locale: ptBR })} às {app.time}
                        </p>
                        {app.clinical_priority !== "Normal" && (
                          <span className={cn("inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white", PRIORITY_COLORS[app.clinical_priority])}>
                            {app.clinical_priority}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legenda de status */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="font-bold font-dm text-sm mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              Status de Consultas
            </h3>
            <div className="space-y-2">
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                const count = appointments.filter(a => a.status === status).length;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", cfg.color)}>{status}</span>
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lembretes automáticos */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <h3 className="font-bold font-dm text-sm mb-2 flex items-center gap-2 text-amber-800">
              <Bell className="w-4 h-4" />
              Lembretes Automáticos
            </h3>
            <p className="text-xs text-amber-700 mb-3">Consultas das próximas 48h sem confirmação:</p>
            {appointments.filter(a => {
              const appDate = new Date(a.date + "T12:00:00");
              const now = new Date();
              const diffH = (appDate - now) / 3600000;
              return diffH > 0 && diffH <= 48 && a.status === "Agendado";
            }).length === 0 ? (
              <p className="text-xs text-amber-600 italic">Nenhum lembrete pendente.</p>
            ) : (
              appointments.filter(a => {
                const appDate = new Date(a.date + "T12:00:00");
                const now = new Date();
                const diffH = (appDate - now) / 3600000;
                return diffH > 0 && diffH <= 48 && a.status === "Agendado";
              }).slice(0, 5).map(app => (
                <ReminderItem key={app.id} app={app} patient={patientMap[app.elderly_id]} onConfirm={() => handleStatusChange(app.id, "Confirmado")} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de agendamento */}
      {showModal && (
        <AppointmentModal
          appointment={editingApp}
          defaultDate={format(selectedDate, "yyyy-MM-dd")}
          patients={patients}
          onSaved={handleSaved}
          onClose={() => { setShowModal(false); setEditingApp(null); }}
        />
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }) {
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

function AppointmentCard({ app, patient, onEdit, onStatusChange }) {
  const typeCfg = TYPE_CONFIG[app.type] || TYPE_CONFIG["Presencial"];
  const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG["Agendado"];
  const TypeIcon = typeCfg.icon;

  return (
    <div className={cn("flex items-start gap-3 p-3.5 rounded-xl border bg-white hover:shadow-sm transition-all",
      app.clinical_priority === "Urgente" ? "border-red-300" : "border-border")}>
      <div className="flex flex-col items-center gap-1 shrink-0">
        <span className="text-sm font-bold text-primary font-mono">{app.time}</span>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", typeCfg.color)}>
          <TypeIcon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-sm">{patient?.anonymous_code || app.elderly_code}</span>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", typeCfg.color)}>{app.type}</span>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", statusCfg.color)}>{app.status}</span>
          {app.clinical_priority !== "Normal" && (
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full text-white", PRIORITY_COLORS[app.clinical_priority])}>
              {app.clinical_priority}
            </span>
          )}
        </div>
        {app.specialty && <p className="text-xs font-medium mt-1">{app.specialty}</p>}
        {app.reason && <p className="text-xs text-muted-foreground mt-0.5 truncate">{app.reason}</p>}
        {app.notes && <p className="text-xs text-muted-foreground mt-0.5 italic truncate">{app.notes}</p>}
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => onEdit(app)}>Editar</Button>
        {app.status === "Agendado" && (
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700" onClick={() => onStatusChange(app.id, "Confirmado")}>Confirmar</Button>
        )}
        {(app.status === "Agendado" || app.status === "Confirmado") && (
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary" onClick={() => onStatusChange(app.id, "Realizado")}>Realizado</Button>
        )}
      </div>
    </div>
  );
}

function ReminderItem({ app, patient, onConfirm }) {
  const typeCfg = TYPE_CONFIG[app.type] || TYPE_CONFIG["Presencial"];
  const TypeIconR = typeCfg.icon;
  return (
    <div className="flex items-center justify-between gap-2 mb-2 last:mb-0">
      <div className="min-w-0">
        <p className="font-mono font-bold text-xs text-amber-900">{patient?.anonymous_code || app.elderly_code}</p>
        <p className="text-[10px] text-amber-700">{app.date} às {app.time}</p>
      </div>
      <Button size="sm" className="h-6 px-2 text-[10px] bg-amber-600 hover:bg-amber-700 text-white shrink-0" onClick={onConfirm}>Confirmar</Button>
    </div>
  );
}