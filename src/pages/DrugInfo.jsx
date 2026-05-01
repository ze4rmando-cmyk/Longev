import { useState } from "react";
import { Search, AlertTriangle, Shield, ShieldAlert, ShieldOff, ChevronDown, ChevronUp, Pill, Activity, Eye, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { searchDrugs, DRUG_DATABASE } from "@/lib/drugDatabase";
import { cn } from "@/lib/utils";

const ALERT_CONFIG = {
  "Seguro": { color: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: Shield, badge: "bg-emerald-100 text-emerald-700" },
  "Atenção": { color: "bg-amber-50 border-amber-200 text-amber-700", icon: ShieldAlert, badge: "bg-amber-100 text-amber-700" },
  "EVITAR": { color: "bg-red-50 border-red-200 text-red-700", icon: ShieldOff, badge: "bg-red-100 text-red-700" },
  "ATENÇÃO MÁXIMA": { color: "bg-red-50 border-red-200 text-red-700", icon: AlertTriangle, badge: "bg-red-100 text-red-700" },
};

const CATEGORIES = ["Todos", "Anti-hipertensivo", "Antidiabético", "Hipolipemiante", "Antidemencial", "Antidepressivo", "Anticoagulante", "Antiagregante", "Diurético", "Benzodiazepínico", "Antipsicótico", "Anticonvulsivante", "Antibiótico", "Antifúngico", "Antiviral", "Broncodilatador", "Corticoide", "Gastroprotetor", "Antiparkinssoniano", "Antiosteoporótico", "Urológico", "Antigotoso", "Analgésico", "Suplemento"];

export default function DrugInfo() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedDrug, setSelectedDrug] = useState(null);

  const filteredDrugs = searchDrugs(search).filter(d =>
    selectedCategory === "Todos" ||
    d.class.toLowerCase().includes(selectedCategory.toLowerCase()) ||
    d.group.toLowerCase().includes(selectedCategory.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-dm tracking-tight flex items-center gap-2">
          <Pill className="w-7 h-7 text-primary" />
          Bulas Inteligentes
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Informações clínicas detalhadas, alertas geriátricos e NANDA/NIC/NOC para cada medicação
        </p>
      </div>

      {/* Beers warning banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-800">Critérios de Beers 2023 — Medicamentos Potencialmente Inapropriados em Idosos</p>
          <p className="text-xs text-red-700 mt-0.5">Medicamentos marcados com ⚠ Beers apresentam risco aumentado em pacientes ≥ 65 anos. Use com extrema cautela e reavalie periodicamente.</p>
        </div>
      </div>

      {/* Search and filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar medicamento, classe ou indicação..."
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Drug list */}
        <div className="lg:col-span-1 space-y-2 max-h-[700px] overflow-y-auto pr-1">
          {filteredDrugs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum medicamento encontrado.</p>
          )}
          {filteredDrugs.map(drug => {
            const cfg = ALERT_CONFIG[drug.geriatricAlert] || ALERT_CONFIG["Atenção"];
            const Icon = cfg.icon;
            return (
              <button
                key={drug.id}
                onClick={() => setSelectedDrug(drug)}
                className={cn(
                  "w-full text-left bg-card rounded-xl border p-4 transition-all hover:shadow-md",
                  selectedDrug?.id === drug.id ? "border-primary shadow-md" : "border-border"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{drug.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{drug.class}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", cfg.badge)}>
                      <Icon className="w-2.5 h-2.5" />
                      {drug.geriatricAlert}
                    </span>
                    {drug.beersCriteria && (
                      <span className="text-[10px] font-bold text-red-600">⚠ Beers</span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{drug.indication}</p>
              </button>
            );
          })}
        </div>

        {/* Drug detail */}
        <div className="lg:col-span-2">
          {!selectedDrug ? (
            <div className="h-full flex flex-col items-center justify-center bg-card rounded-xl border border-border p-10 text-center">
              <Pill className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="font-semibold text-muted-foreground">Selecione um medicamento</p>
              <p className="text-sm text-muted-foreground mt-1">Clique em um item para ver a bula completa</p>
            </div>
          ) : (
            <DrugDetail drug={selectedDrug} />
          )}
        </div>
      </div>
    </div>
  );
}

function DrugDetail({ drug }) {
  const [openSection, setOpenSection] = useState("main");
  const cfg = ALERT_CONFIG[drug.geriatricAlert] || ALERT_CONFIG["Atenção"];
  const AlertIcon = cfg.icon;

  const toggle = (s) => setOpenSection(prev => prev === s ? null : s);

  return (
    <div className="space-y-3">
      {/* Header card */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold font-dm">{drug.name}</h2>
            <p className="text-sm text-muted-foreground">{drug.group}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {drug.tags.map(tag => (
                <span key={tag} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
          <div className={cn("rounded-xl border p-3 text-center shrink-0", cfg.color)}>
            <AlertIcon className="w-5 h-5 mx-auto mb-1" />
            <p className="text-[10px] font-bold leading-tight">{drug.geriatricAlert}</p>
            {drug.beersCriteria && <p className="text-[10px] font-bold mt-0.5">⚠ Beers</p>}
          </div>
        </div>
      </div>

      {/* Geriatric alert */}
      <div className={cn("rounded-xl border p-4", cfg.color)}>
        <div className="flex items-start gap-2">
          <AlertIcon className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-1">Alerta Geriátrico</p>
            <p className="text-sm">{drug.geriatricNotes}</p>
          </div>
        </div>
      </div>

      {/* Main info */}
      <Section open={openSection === "main"} onToggle={() => toggle("main")} title="Indicação e Mecanismo de Ação">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Para que serve</p>
            <p className="text-sm">{drug.indication}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Como funciona</p>
            <p className="text-sm">{drug.mechanism}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Formas farmacêuticas</p>
            <div className="flex flex-wrap gap-2">
              {drug.doseForms.map((f, i) => (
                <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-lg">{f}</span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Side effects */}
      <Section open={openSection === "effects"} onToggle={() => toggle("effects")} title="Efeitos Adversos" iconColor="text-orange-600" bg="bg-orange-50">
        <ul className="space-y-1.5">
          {drug.sideEffects.map((e, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0 mt-1.5" />
              {e}
            </li>
          ))}
        </ul>
      </Section>

      {/* Interactions */}
      <Section open={openSection === "interactions"} onToggle={() => toggle("interactions")} title="Interações Medicamentosas" iconColor="text-red-600" bg="bg-red-50">
        <ul className="space-y-1.5">
          {drug.interactions.map((e, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500 mt-0.5" />
              {e}
            </li>
          ))}
        </ul>
      </Section>

      {/* Monitoring */}
      <Section open={openSection === "monitoring"} onToggle={() => toggle("monitoring")} title="Parâmetros de Monitoramento" iconColor="text-blue-600" bg="bg-blue-50">
        <ul className="space-y-1.5">
          {drug.monitoring.map((e, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Activity className="w-3.5 h-3.5 shrink-0 text-blue-500 mt-0.5" />
              {e}
            </li>
          ))}
        </ul>
      </Section>

      {/* Nursing */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Eye className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-purple-800 uppercase tracking-wide mb-1">Cuidados de Enfermagem</p>
            <p className="text-sm text-purple-900">{drug.nursing}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ open, onToggle, title, children, iconColor = "text-primary", bg = "bg-primary/10" }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", bg)}>
            <Info className={cn("w-3.5 h-3.5", iconColor)} />
          </div>
          <span className="font-semibold text-sm">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-border pt-3">{children}</div>}
    </div>
  );
}