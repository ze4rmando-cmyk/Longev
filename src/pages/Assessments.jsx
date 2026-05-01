import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Brain, Activity, HeartPulse, ChevronRight, Search, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ALL_TESTS } from "@/lib/clinicalTests";

const TEST_META = {
  MEEM: { icon: Brain, color: "bg-purple-50 text-purple-600", border: "hover:border-purple-300", desc: "Avalia funções cognitivas" },
  Katz: { icon: Activity, color: "bg-blue-50 text-blue-600", border: "hover:border-blue-300", desc: "Atividades Básicas da Vida Diária" },
  Lawton: { icon: Activity, color: "bg-emerald-50 text-emerald-600", border: "hover:border-emerald-300", desc: "Atividades Instrumentais da Vida Diária" },
  GDS: { icon: HeartPulse, color: "bg-rose-50 text-rose-600", border: "hover:border-rose-300", desc: "Rastreamento de depressão geriátrica" },
  AGA: { icon: Stethoscope, color: "bg-amber-50 text-amber-600", border: "hover:border-amber-300", desc: "Avaliação multidimensional completa" },
};

export default function Assessments() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Elderly.list("-created_date", 200).then((data) => {
      setPatients(data.filter(p => p.status !== "Inativo"));
      setLoading(false);
    });
  }, []);

  const filtered = patients.filter(p =>
    p.anonymous_code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-dm tracking-tight">Nova Avaliação</h1>
        <p className="text-muted-foreground text-sm mt-1">Selecione o paciente e o instrumento clínico</p>
      </div>

      {/* Step 1: Select patient */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0">1</div>
          <h2 className="font-semibold">Selecionar Paciente</h2>
        </div>

        {patients.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
            Nenhum paciente ativo. <button className="text-primary underline" onClick={() => navigate("/patients/new")}>Cadastrar paciente</button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all w-full ${
                    selectedPatient?.id === p.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40 hover:bg-secondary/30"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{p.anonymous_code.slice(0, 2)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{p.anonymous_code}</p>
                    <p className="text-xs text-muted-foreground">{p.age} anos • {p.sex}</p>
                  </div>
                  {selectedPatient?.id === p.id && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <ChevronRight className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Step 2: Select test */}
      {selectedPatient && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0">2</div>
            <h2 className="font-semibold">Selecionar Instrumento</h2>
          </div>
          <div className="grid gap-3">
            {Object.entries(ALL_TESTS).map(([key, test]) => {
              const meta = TEST_META[key];
              const Icon = meta.icon;
              return (
                <button
                  key={key}
                  onClick={() => navigate(`/tests/apply?patient=${selectedPatient.id}&test=${key}`)}
                  className={`bg-card rounded-xl border border-border ${meta.border} p-4 flex items-center gap-4 text-left transition-all hover:shadow-md group w-full`}
                >
                  <div className={`w-11 h-11 rounded-xl ${meta.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm font-dm">{test.name}</p>
                    <p className="text-xs text-muted-foreground">{meta.desc} • {test.maxScore} pontos</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}