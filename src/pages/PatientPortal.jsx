import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Heart, Lock, Eye, EyeOff, Calendar, Activity, Brain, ClipboardList,
  FileText, ShieldCheck, LogOut, AlertTriangle, CheckCircle, Clock, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function PatientPortal() {
  const [step, setStep] = useState("login"); // login | portal
  const [accessCode, setAccessCode] = useState("");
  const [patientCode, setPatientCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [access, setAccess] = useState(null);
  const [patient, setPatient] = useState(null);
  const [data, setData] = useState({});
  const [activeTab, setActiveTab] = useState("appointments");
  const [showCode, setShowCode] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedCode = accessCode.trim().toUpperCase();
    const normalizedPatient = patientCode.trim().toUpperCase();

    // Find access record
    const accesses = await base44.entities.PatientPortalAccess.filter({
      access_code: normalizedCode,
      elderly_code: normalizedPatient,
      active: true,
    });

    if (accesses.length === 0) {
      setError("Código de acesso inválido ou inativo. Verifique os dados e tente novamente.");
      setLoading(false);
      return;
    }

    const acc = accesses[0];

    // Check expiry
    if (acc.expires_at && acc.expires_at < format(new Date(), "yyyy-MM-dd")) {
      setError("Este acesso expirou. Entre em contato com a clínica para renovação.");
      setLoading(false);
      return;
    }

    // Load patient
    const patients = await base44.entities.Elderly.filter({ id: acc.elderly_id });
    if (patients.length === 0) {
      setError("Paciente não encontrado.");
      setLoading(false);
      return;
    }

    // Load allowed data
    const loadPromises = {};
    if (acc.allow_appointments) loadPromises.appointments = base44.entities.Appointment.filter({ elderly_id: acc.elderly_id }, "-date", 50);
    if (acc.allow_vitals) loadPromises.vitals = base44.entities.VitalSign.filter({ elderly_id: acc.elderly_id }, "-created_date", 20);
    if (acc.allow_assessments) loadPromises.assessments = base44.entities.Assessment.filter({ elderly_id: acc.elderly_id }, "-created_date", 50);
    if (acc.allow_notes) loadPromises.notes = base44.entities.ClinicalNote.filter({ elderly_id: acc.elderly_id }, "-created_date", 30);

    const results = {};
    for (const [key, promise] of Object.entries(loadPromises)) {
      results[key] = await promise;
    }

    // Update last accessed
    await base44.entities.PatientPortalAccess.update(acc.id, {
      last_accessed: new Date().toISOString(),
    });

    setAccess(acc);
    setPatient(patients[0]);
    setData(results);

    // Set default tab based on permissions
    if (acc.allow_appointments) setActiveTab("appointments");
    else if (acc.allow_assessments) setActiveTab("assessments");
    else if (acc.allow_vitals) setActiveTab("vitals");
    else if (acc.allow_care_plan) setActiveTab("careplan");
    else if (acc.allow_notes) setActiveTab("notes");

    setStep("portal");
    setLoading(false);
  };

  const handleLogout = () => {
    setStep("login");
    setAccess(null);
    setPatient(null);
    setData({});
    setAccessCode("");
    setPatientCode("");
  };

  if (step === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="https://media.base44.com/images/public/69c560939ca44a88e938b3dc/ca29870e5_aa5328db-8472-4aff-8f7a-c61ac1804154.jpeg" alt="LongevCare" className="h-20 w-auto object-contain mx-auto mb-2" />
            <h1 className="text-2xl font-bold font-dm text-foreground">Portal do Paciente</h1>
            <p className="text-muted-foreground text-sm mt-1">Acesso Familiar Autorizado</p>
          </div>

          {/* Login form */}
          <div className="bg-card rounded-2xl border border-border shadow-xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">Acesso Seguro</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Código do Paciente</Label>
                <Input
                  placeholder="Ex: GC-AB1234"
                  value={patientCode}
                  onChange={e => setPatientCode(e.target.value.toUpperCase())}
                  className="font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Código de Acesso</Label>
                <div className="relative">
                  <Input
                    type={showCode ? "text" : "password"}
                    placeholder="Código fornecido pela clínica"
                    value={accessCode}
                    onChange={e => setAccessCode(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <ShieldCheck className="w-4 h-4" />
                {loading ? "Verificando..." : "Acessar Portal"}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Os códigos de acesso são fornecidos pela equipe clínica.<br />
              Em caso de dúvidas, entre em contato com a clínica.
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            🔒 Conexão segura · Dados protegidos · Acesso auditado
          </p>
        </div>
      </div>
    );
  }

  // Portal view
  const tabs = [
    access?.allow_appointments && { key: "appointments", label: "Consultas", icon: Calendar },
    access?.allow_vitals && { key: "vitals", label: "Sinais Vitais", icon: Activity },
    access?.allow_assessments && { key: "assessments", label: "Avaliações", icon: Brain },
    access?.allow_care_plan && { key: "careplan", label: "Plano de Cuidados", icon: ClipboardList },
    access?.allow_notes && { key: "notes", label: "Registros Clínicos", icon: FileText },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center">
            <img src="https://media.base44.com/images/public/69c560939ca44a88e938b3dc/ca29870e5_aa5328db-8472-4aff-8f7a-c61ac1804154.jpeg" alt="LongevCare" className="h-8 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold">{access?.authorized_name}</p>
              <p className="text-[10px] text-muted-foreground">{access?.relationship}</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={handleLogout}>
              <LogOut className="w-3.5 h-3.5" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Patient summary */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold font-dm">{patient?.anonymous_code}</h2>
              <p className="text-sm text-muted-foreground">{patient?.age} anos · {patient?.sex}</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Acesso Autorizado
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-secondary/50 rounded-lg p-2">
              <p className="text-muted-foreground">Status</p>
              <p className="font-semibold mt-0.5">{patient?.status || "Ativo"}</p>
            </div>
            {patient?.health_conditions && (
              <div className="bg-secondary/50 rounded-lg p-2 col-span-2">
                <p className="text-muted-foreground">Condições de Saúde</p>
                <p className="font-medium mt-0.5 line-clamp-2">{patient.health_conditions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        {tabs.length > 0 && (
          <>
            <div className="flex gap-1 border-b border-border overflow-x-auto">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-all",
                    activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}>
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Appointments */}
            {activeTab === "appointments" && (
              <div className="space-y-3">
                <h3 className="font-semibold font-dm text-sm">Histórico de Consultas</h3>
                {!data.appointments?.length ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma consulta registrada.</p>
                ) : (
                  data.appointments.map(a => (
                    <div key={a.id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{a.date} às {a.time}</span>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                              a.status === "Realizado" ? "bg-slate-100 text-slate-600" :
                              a.status === "Confirmado" ? "bg-emerald-100 text-emerald-700" :
                              a.status === "Cancelado" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                            )}>{a.status}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{a.type}{a.specialty ? ` · ${a.specialty}` : ""}</p>
                          {a.reason && <p className="text-xs text-muted-foreground mt-1">{a.reason}</p>}
                        </div>
                        {a.clinical_priority === "Urgente" && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold shrink-0">Urgente</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Vitals */}
            {activeTab === "vitals" && (
              <div className="space-y-3">
                <h3 className="font-semibold font-dm text-sm">Sinais Vitais Recentes</h3>
                {!data.vitals?.length ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum registro de sinais vitais.</p>
                ) : (
                  data.vitals.map(v => (
                    <div key={v.id} className="bg-card border border-border rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-3">
                        {format(new Date(v.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {v.systolic && v.diastolic && (
                          <VitalChip label="Pressão" value={`${v.systolic}/${v.diastolic}`} unit="mmHg" alert={v.systolic > 140} />
                        )}
                        {v.heart_rate && (
                          <VitalChip label="Freq. Card." value={v.heart_rate} unit="bpm" alert={v.heart_rate > 100 || v.heart_rate < 60} />
                        )}
                        {v.blood_glucose && (
                          <VitalChip label="Glicemia" value={v.blood_glucose} unit="mg/dL" alert={v.blood_glucose > 180} />
                        )}
                        {v.oxygen_saturation && (
                          <VitalChip label="SpO₂" value={`${v.oxygen_saturation}%`} unit="" alert={v.oxygen_saturation < 95} />
                        )}
                      </div>
                      {v.notes && <p className="text-xs text-muted-foreground mt-2 italic">{v.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Assessments */}
            {activeTab === "assessments" && (
              <div className="space-y-3">
                <h3 className="font-semibold font-dm text-sm">Resultados de Avaliações Clínicas</h3>
                {!data.assessments?.length ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma avaliação registrada.</p>
                ) : (
                  data.assessments.map(a => (
                    <div key={a.id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <span className="font-semibold text-sm">{a.test_type}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Resultado: {a.score}{a.max_score ? `/${a.max_score}` : ""} · {a.classification}
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {format(new Date(a.created_date), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Care Plan */}
            {activeTab === "careplan" && (
              <div className="space-y-4">
                <h3 className="font-semibold font-dm text-sm">Plano de Cuidados</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <ClipboardList className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-800 text-sm">Plano de Cuidados Personalizado</p>
                      <p className="text-xs text-blue-700 mt-1">
                        O plano de cuidados é gerado pela equipe médica com base nas avaliações clínicas. Para visualizá-lo, acesse a seção de Plano de Cuidados no sistema clínico ou solicite uma cópia impressa na recepção.
                      </p>
                    </div>
                  </div>
                </div>
                {patient?.health_conditions && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Condições Monitoradas</p>
                    <p className="text-sm">{patient.health_conditions}</p>
                  </div>
                )}
                {patient?.medications && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-700 uppercase mb-2">Medicamentos em Uso</p>
                    <p className="text-sm">{patient.medications}</p>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {activeTab === "notes" && (
              <div className="space-y-3">
                <h3 className="font-semibold font-dm text-sm">Registros Clínicos</h3>
                {!data.notes?.length ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum registro clínico disponível.</p>
                ) : (
                  data.notes.filter(n => !n.private).map(n => (
                    <div key={n.id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{n.note_type}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {format(new Date(n.created_date), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{n.content}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground py-4 border-t border-border">
          <p>🔒 Portal seguro · LongevCare · Acesso monitorado e auditado</p>
          <p className="mt-1">Em caso de emergência, ligue para o SAMU: 192</p>
        </div>
      </main>
    </div>
  );
}

function VitalChip({ label, value, unit, alert }) {
  return (
    <div className={cn("rounded-lg border p-2.5 text-center",
      alert ? "bg-red-50 border-red-200" : "bg-secondary/50 border-border"
    )}>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn("text-base font-bold font-dm", alert ? "text-red-600" : "")}>{value}</p>
      {unit && <p className="text-[10px] text-muted-foreground">{unit}</p>}
      {alert && <p className="text-[10px] text-red-500 font-bold">⚠ Atenção</p>}
    </div>
  );
}