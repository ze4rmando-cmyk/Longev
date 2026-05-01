import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Plus, Search, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await base44.entities.Elderly.list("-created_date", 200);
      setPatients(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = patients.filter(p =>
    p.anonymous_code.toLowerCase().includes(search.toLowerCase()) ||
    (p.health_conditions || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-dm tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground text-sm mt-1">{patients.length} paciente{patients.length !== 1 ? "s" : ""} cadastrado{patients.length !== 1 ? "s" : ""}</p>
        </div>
        <Link to="/patients/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      {patients.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código ou condição..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {filtered.length === 0 && patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum paciente cadastrado"
          description="Comece cadastrando o primeiro paciente para iniciar sua pesquisa."
          actionLabel="Cadastrar Paciente"
          actionHref="/patients/new"
        />
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">Nenhum resultado encontrado.</p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/patients/${p.id}`}
              className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-md hover:border-primary/30 transition-all group"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">{p.anonymous_code.slice(0, 2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold font-dm text-sm">{p.anonymous_code}</span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.age} anos • {p.sex}
                  {p.health_conditions ? ` • ${p.health_conditions.substring(0, 40)}...` : ""}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "Ativo": "bg-emerald-100 text-emerald-700",
    "Inativo": "bg-slate-100 text-slate-600",
    "Concluído": "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[status] || styles["Ativo"]}`}>
      {status || "Ativo"}
    </span>
  );
}