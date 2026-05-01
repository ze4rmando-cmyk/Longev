import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";

function generateCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const l1 = letters[Math.floor(Math.random() * 26)];
  const l2 = letters[Math.floor(Math.random() * 26)];
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return `GC-${l1}${l2}${num}`;
}

export default function PatientForm() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("edit");

  const [form, setForm] = useState({
    anonymous_code: generateCode(),
    age: "",
    sex: "",
    health_conditions: "",
    allergies: "",
    family_history: "",
    medications: "",
    notes: "",
    status: "Ativo",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      base44.entities.Elderly.filter({ id: editId }).then(([patient]) => {
        if (patient) setForm(patient);
        setLoading(false);
      });
    }
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editId) {
      await base44.entities.Elderly.update(editId, {
        age: Number(form.age),
        sex: form.sex,
        health_conditions: form.health_conditions,
        medications: form.medications,
        notes: form.notes,
        status: form.status,
      });
    } else {
      await base44.entities.Elderly.create({
        ...form,
        age: Number(form.age),
      });
    }
    navigate("/patients");
  };

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
          <h1 className="text-xl font-bold font-dm">{editId ? "Editar Paciente" : "Novo Paciente"}</h1>
          <p className="text-sm text-muted-foreground">Dados anônimos do participante</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Código Anônimo</Label>
            <Input value={form.anonymous_code} disabled className="bg-secondary font-mono" />
            <p className="text-xs text-muted-foreground">Gerado automaticamente</p>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Idade *</Label>
            <Input
              type="number"
              min="60"
              max="120"
              required
              placeholder="Ex: 72"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Sexo *</Label>
            <Select value={form.sex} onValueChange={(v) => setForm({ ...form, sex: v })} required>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Feminino">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Condições de Saúde</Label>
          <Textarea
            placeholder="Ex: Hipertensão, Diabetes Tipo 2, Osteoporose..."
            rows={3}
            value={form.health_conditions}
            onChange={(e) => setForm({ ...form, health_conditions: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Alergias</Label>
          <Textarea
            placeholder="Ex: Alergia a Penicilina, Dipirona, frutos do mar..."
            rows={2}
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Histórico Familiar</Label>
          <Textarea
            placeholder="Ex: Pai: cardiopatia, AVE. Mãe: Alzheimer, Diabetes..."
            rows={2}
            value={form.family_history}
            onChange={(e) => setForm({ ...form, family_history: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Medicamentos em Uso</Label>
          <Textarea
            placeholder="Ex: Losartana 50mg, Metformina 850mg..."
            rows={3}
            value={form.medications}
            onChange={(e) => setForm({ ...form, medications: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Observações</Label>
          <Textarea
            placeholder="Notas adicionais sobre o paciente..."
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" disabled={saving || !form.age || !form.sex} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : editId ? "Atualizar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </div>
  );
}