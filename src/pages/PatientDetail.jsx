import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, ClipboardList, Download, Brain, Activity, HeartPulse, FileText, Sparkles, Calendar, Clock, MessageSquare } from "lucide-react";
import RiskAnalysis from "@/components/RiskAnalysis";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AlertBadge from "@/components/AlertBadge";
import EmptyState from "@/components/EmptyState";
import PatientEvolutionChart from "@/components/PatientEvolutionChart";
import DrugInteractionChecker from "@/components/DrugInteractionChecker";
import VitalHistory from "@/components/VitalHistory";
import { cn } from "@/lib/utils";
import { generatePDF, generateCSV } from "@/lib/reportGenerator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [notes, setNotes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assessments");

  useEffect(() => {
    async function load() {
      const [patients, allAssessments, allVitals, allNotes, allApps] = await Promise.all([
        base44.entities.Elderly.filter({ id }),
        base44.entities.Assessment.filter({ elderly_id: id }, "-created_date", 100),
        base44.entities.VitalSign.filter({ elderly_id: id }, "-created_date", 50),
        base44.entities.ClinicalNote.filter({ elderly_id: id }, "-created_date", 100),
        base44.entities.Appointment.filter({ elderly_id: id }, "-date", 50),
      ]);
      setPatient(patients[0] || null);
      setAssessments(allAssessments);
      setVitals(allVitals);
      setNotes(allNotes);
      setAppointments(allApps);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleDelete = async () => {
    await base44.entities.Elderly.delete(id);
    navigate("/patients");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return <EmptyState title="Paciente não encontrado" description="O paciente solicitado não existe." />;
  }

  const testIcons = { MEEM: Brain, Katz: Activity, Lawton: Activity, GDS: HeartPulse };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/patients")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold font-dm">{patient.anonymous_code}</h1>
            <p className="text-sm text-muted-foreground">{patient.age} anos • {patient.sex}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/patients/new?edit=${id}`)}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir paciente?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Todas as avaliações associadas permanecerão no banco de dados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Patient info card */}
      <div className="bg-card rounded-xl border border-border p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <InfoItem label="Condições de Saúde" value={patient.health_conditions || "Não informado"} />
        <InfoItem label="Medicamentos" value={patient.medications || "Não informado"} />
        <InfoItem label="Alergias" value={patient.allergies || "Não informado"} />
        <InfoItem label="Histórico Familiar" value={patient.family_history || "Não informado"} />
        <InfoItem label="Status" value={patient.status || "Ativo"} />
        <InfoItem label="Observações" value={patient.notes || "—"} />
      </div>

      {/* Drug Interaction Checker */}
      {patient.medications && (
        <div className="bg-card rounded-xl border border-border p-5">
          <DrugInteractionChecker medications={patient.medications} />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link to={`/appointments`}>
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Agendamentos
          </Button>
        </Link>
        <Link to={`/patients/${id}/care-plan`}>
          <Button className="gap-2">
            <Sparkles className="w-4 h-4" />
            Plano de Cuidados
          </Button>
        </Link>
        <Link to={`/patients/${id}/timeline`}>
          <Button variant="outline" className="gap-2">
            <Clock className="w-4 h-4" />
            Linha do Tempo
          </Button>
        </Link>
        <Link to={`/patients/${id}/record`}>
          <Button className="gap-2">
            <ClipboardList className="w-4 h-4" />
            Nova Avaliação
          </Button>
        </Link>
        {assessments.length > 0 && (
          <>
            <Button variant="outline" className="gap-2" onClick={() => generatePDF(patient, assessments, { vitals, notes, appointments })}>
              <Download className="w-4 h-4" /> PDF Completo
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => generateCSV(patient, assessments, { vitals, notes, appointments })}>
              <Download className="w-4 h-4" /> CSV Completo
            </Button>
          </>
        )}
      </div>

      <div className="flex gap-1 border-b border-border">
        {[
          { key: "assessments", label: "Avaliações" },
          { key: "vitals", label: "Sinais Vitais" },
          { key: "risk", label: "Análise de Risco IA" },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all",
              activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "assessments" && (
        <div className="space-y-4">
          {assessments.length > 1 && <PatientEvolutionChart assessments={assessments} />}
          <h3 className="font-semibold font-dm">Histórico de Avaliações</h3>
          {assessments.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Nenhuma avaliação"
              description="Realize a primeira avaliação clínica deste paciente."
              actionLabel="Iniciar Avaliação"
              actionHref={`/tests/select?patient=${id}`}
            />
          ) : (
            <div className="space-y-3">
              {assessments.map((a) => {
                const Icon = testIcons[a.test_type] || ClipboardList;
                return (
                  <div key={a.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{a.test_type}</span>
                        <AlertBadge level={a.alert_level} label={a.classification} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Score: {a.score}{a.max_score ? ` / ${a.max_score}` : ""} •{" "}
                        {format(new Date(a.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "vitals" && (
        <VitalHistory elderlyId={id} />
      )}

      {activeTab === "risk" && (
        <div className="bg-card rounded-xl border border-border p-5">
          <RiskAnalysis patient={patient} assessments={assessments} vitals={vitals} />
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground font-medium mb-0.5">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}