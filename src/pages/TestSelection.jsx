import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Activity, HeartPulse, ChevronRight, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_TESTS } from "@/lib/clinicalTests";

const TEST_META = {
  MEEM: { icon: Brain, color: "bg-purple-50 text-purple-600", border: "border-purple-200 hover:border-purple-400" },
  Katz: { icon: Activity, color: "bg-blue-50 text-blue-600", border: "border-blue-200 hover:border-blue-400" },
  Lawton: { icon: Activity, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-200 hover:border-emerald-400" },
  GDS: { icon: HeartPulse, color: "bg-rose-50 text-rose-600", border: "border-rose-200 hover:border-rose-400" },
  AGA: { icon: ClipboardList, color: "bg-amber-50 text-amber-600", border: "border-amber-200 hover:border-amber-400" },
};

export default function TestSelection() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get("patient");

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      base44.entities.Elderly.filter({ id: patientId }).then(([p]) => {
        setPatient(p);
        setLoading(false);
      });
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold font-dm">Selecionar Avaliação</h1>
          <p className="text-sm text-muted-foreground">
            Paciente: <span className="font-medium text-foreground">{patient?.anonymous_code}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {Object.entries(ALL_TESTS).map(([key, test]) => {
          const meta = TEST_META[key];
          const Icon = meta.icon;
          return (
            <button
              key={key}
              onClick={() => navigate(`/tests/apply?patient=${patientId}&test=${key}`)}
              className={`bg-card rounded-xl border ${meta.border} p-5 flex items-center gap-4 text-left transition-all hover:shadow-md group w-full`}
            >
              <div className={`w-12 h-12 rounded-xl ${meta.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold font-dm text-sm">{test.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{test.description}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{test.reference}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}