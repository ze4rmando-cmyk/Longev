import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Activity, Plus, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Vitals() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ systolic: "", diastolic: "", heart_rate: "", weight: "", blood_glucose: "", oxygen_saturation: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [recentVitals, setRecentVitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Elderly.list("-created_date", 200).then((data) => {
      setPatients(data.filter(p => p.status !== "Inativo"));
      setLoading(false);
    });
  }, []);

  const selectPatient = async (p) => {
    setSelectedPatient(p);
    const vitals = await base44.entities.VitalSign.filter({ elderly_id: p.id }, "-created_date", 10);
    setRecentVitals(vitals);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { elderly_id: selectedPatient.id, elderly_code: selectedPatient.anonymous_code };
    if (form.systolic) data.systolic = Number(form.systolic);
    if (form.diastolic) data.diastolic = Number(form.diastolic);
    if (form.heart_rate) data.heart_rate = Number(form.heart_rate);
    if (form.weight) data.weight = Number(form.weight);
    if (form.blood_glucose) data.blood_glucose = Number(form.blood_glucose);
    if (form.oxygen_saturation) data.oxygen_saturation = Number(form.oxygen_saturation);
    if (form.notes) data.notes = form.notes;

    await base44.entities.VitalSign.create(data);
    setForm({ systolic: "", diastolic: "", heart_rate: "", weight: "", blood_glucose: "", oxygen_saturation: "", notes: "" });
    const vitals = await base44.entities.VitalSign.filter({ elderly_id: selectedPatient.id }, "-created_date", 10);
    setRecentVitals(vitals);
    setSaving(false);
  };

  const filtered = patients.filter(p => p.anonymous_code.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-dm tracking-tight">Sinais Vitais</h1>
        <p className="text-muted-foreground text-sm mt-1">Registro de medidas vitais por paciente</p>
      </div>

      {/* Select patient */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar paciente..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="grid gap-2 max-h-48 overflow-y-auto">
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => selectPatient(p)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all w-full ${selectedPatient?.id === p.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{p.anonymous_code.slice(0, 2)}</span>
              </div>
              <div>
                <p className="font-semibold text-sm">{p.anonymous_code}</p>
                <p className="text-xs text-muted-foreground">{p.age} anos • {p.sex}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedPatient && (
        <>
          {/* Form */}
          <form onSubmit={handleSave} className="bg-card rounded-xl border border-border p-5 space-y-4">
            <h2 className="font-semibold font-dm">Registrar Medidas — <span className="text-primary">{selectedPatient.anonymous_code}</span></h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Sistólica (mmHg)</Label>
                <Input type="number" placeholder="120" value={form.systolic} onChange={e => setForm({ ...form, systolic: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Diastólica (mmHg)</Label>
                <Input type="number" placeholder="80" value={form.diastolic} onChange={e => setForm({ ...form, diastolic: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Freq. Cardíaca (bpm)</Label>
                <Input type="number" placeholder="72" value={form.heart_rate} onChange={e => setForm({ ...form, heart_rate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Peso (kg)</Label>
                <Input type="number" step="0.1" placeholder="70.5" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Glicemia (mg/dL)</Label>
                <Input type="number" placeholder="100" value={form.blood_glucose} onChange={e => setForm({ ...form, blood_glucose: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Saturação O₂ (%)</Label>
                <Input type="number" placeholder="98" value={form.oxygen_saturation} onChange={e => setForm({ ...form, oxygen_saturation: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Observações</Label>
              <Textarea rows={2} placeholder="Notas..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>

            <Button type="submit" disabled={saving} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              {saving ? "Salvando..." : "Registrar Medidas"}
            </Button>
          </form>

          {/* Recent */}
          {recentVitals.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold font-dm">Últimos Registros</h2>
              <div className="space-y-2">
                {recentVitals.map(v => (
                  <div key={v.id} className="bg-card rounded-xl border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-2">{format(new Date(v.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                    <div className="flex flex-wrap gap-3">
                      {v.systolic && v.diastolic && <VitalChip label="PA" value={`${v.systolic}/${v.diastolic}`} unit="mmHg" color="bg-red-50 text-red-700" alert={v.systolic > 140 || v.diastolic > 90} />}
                      {v.heart_rate && <VitalChip label="FC" value={v.heart_rate} unit="bpm" color="bg-rose-50 text-rose-700" alert={v.heart_rate > 100 || v.heart_rate < 60} />}
                      {v.weight && <VitalChip label="Peso" value={v.weight} unit="kg" color="bg-blue-50 text-blue-700" />}
                      {v.blood_glucose && <VitalChip label="Glicemia" value={v.blood_glucose} unit="mg/dL" color="bg-amber-50 text-amber-700" alert={v.blood_glucose > 180 || v.blood_glucose < 70} />}
                      {v.oxygen_saturation && <VitalChip label="SpO₂" value={v.oxygen_saturation} unit="%" color="bg-cyan-50 text-cyan-700" alert={v.oxygen_saturation < 95} />}
                    </div>
                    {v.notes && <p className="text-xs text-muted-foreground mt-2">{v.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function VitalChip({ label, value, unit, color, alert }) {
  return (
    <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${color} ${alert ? "ring-2 ring-red-300" : ""}`}>
      {label}: {value} <span className="font-normal opacity-70">{unit}</span>
      {alert && <span className="ml-1">⚠️</span>}
    </div>
  );
}