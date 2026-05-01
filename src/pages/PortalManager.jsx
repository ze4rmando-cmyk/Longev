import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ShieldCheck, Plus, Trash2, Edit2, Eye, EyeOff, Copy, Check,
  Users, Calendar, Activity, Brain, FileText, ClipboardList,
  AlertTriangle, Search, RefreshCw, Key, ToggleLeft, ToggleRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmptyState from "@/components/EmptyState";
import { cn } from "@/lib/utils";

function generateAccessCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += "-";
  }
  return code;
}

const PERMISSIONS = [
  { key: "allow_appointments", label: "Consultas", icon: Calendar },
  { key: "allow_vitals", label: "Sinais Vitais", icon: Activity },
  { key: "allow_assessments", label: "Avaliações", icon: Brain },
  { key: "allow_care_plan", label: "Plano de Cuidados", icon: ClipboardList },
  { key: "allow_notes", label: "Registros Clínicos", icon: FileText },
];

export default function PortalManager() {
  const [accesses, setAccesses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(null);
  const [form, setForm] = useState({
    elderly_id: "",
    elderly_code: "",
    access_code: generateAccessCode(),
    authorized_name: "",
    relationship: "",
    expires_at: "",
    notes: "",
    active: true,
    allow_appointments: true,
    allow_vitals: false,
    allow_assessments: false,
    allow_care_plan: true,
    allow_notes: false,
  });

  const load = async () => {
    const [a, p] = await Promise.all([
      base44.entities.PatientPortalAccess.list("-created_date", 200),
      base44.entities.Elderly.list("-created_date", 200),
    ]);
    setAccesses(a);
    setPatients(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const patientMap = Object.fromEntries(patients.map(p => [p.id, p]));

  const handlePatientChange = (id) => {
    const p = patientMap[id];
    setForm(f => ({ ...f, elderly_id: id, elderly_code: p?.anonymous_code || "" }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingId) {
      await base44.entities.PatientPortalAccess.update(editingId, form);
    } else {
      await base44.entities.PatientPortalAccess.create(form);
    }
    setShowForm(false);
    setEditingId(null);
    resetForm();
    load();
  };

  const handleEdit = (acc) => {
    setForm({ ...acc });
    setEditingId(acc.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.PatientPortalAccess.delete(id);
    load();
  };

  const handleToggleActive = async (acc) => {
    await base44.entities.PatientPortalAccess.update(acc.id, { active: !acc.active });
    load();
  };

  const resetForm = () => {
    setForm({
      elderly_id: "", elderly_code: "",
      access_code: generateAccessCode(),
      authorized_name: "", relationship: "",
      expires_at: "", notes: "", active: true,
      allow_appointments: true, allow_vitals: false,
      allow_assessments: false, allow_care_plan: true, allow_notes: false,
    });
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = accesses.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.authorized_name?.toLowerCase().includes(q) ||
      a.elderly_code?.toLowerCase().includes(q) ||
      a.relationship?.toLowerCase().includes(q);
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-dm flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Portal Familiar — Gerenciar Acessos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crie e gerencie os acessos de familiares ao portal do paciente
          </p>
        </div>
        <Button className="gap-2" onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
          <Plus className="w-4 h-4" /> Novo Acesso
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-dm">{accesses.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total de Acessos</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-dm text-emerald-600">{accesses.filter(a => a.active).length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Acessos Ativos</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-dm text-muted-foreground">{accesses.filter(a => !a.active).length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Inativos/Revogados</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
          <h2 className="font-bold font-dm text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            {editingId ? "Editar Acesso" : "Novo Acesso ao Portal"}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Paciente *</Label>
                <Select value={form.elderly_id} onValueChange={handlePatientChange} required>
                  <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
                  <SelectContent>
                    {patients.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.anonymous_code} ({p.age} anos)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Código de Acesso *</Label>
                <div className="flex gap-2">
                  <Input value={form.access_code} onChange={e => setForm(f => ({ ...f, access_code: e.target.value.toUpperCase() }))}
                    className="font-mono" required />
                  <Button type="button" variant="outline" size="icon" onClick={() => setForm(f => ({ ...f, access_code: generateAccessCode() }))}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Compartilhe com o familiar autorizado</p>
              </div>
              <div className="space-y-2">
                <Label>Nome do Autorizado *</Label>
                <Input value={form.authorized_name} onChange={e => setForm(f => ({ ...f, authorized_name: e.target.value }))}
                  placeholder="Nome completo" required />
              </div>
              <div className="space-y-2">
                <Label>Parentesco / Relação *</Label>
                <Input value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))}
                  placeholder="Ex: Filha, Cônjuge, Cuidador" required />
              </div>
              <div className="space-y-2">
                <Label>Data de Expiração</Label>
                <Input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
                <p className="text-xs text-muted-foreground">Deixe em branco para acesso indefinido</p>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Notas internas..." />
              </div>
            </div>

            {/* Permissions */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Permissões de Acesso</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {PERMISSIONS.map(({ key, label, icon: Icon }) => (
                  <button key={key} type="button"
                    onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                    className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all",
                      form[key]
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/50"
                    )}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</Button>
              <Button type="submit" className="gap-2">
                <ShieldCheck className="w-4 h-4" />
                {editingId ? "Salvar Alterações" : "Criar Acesso"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por familiar, paciente..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Access list */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum acesso cadastrado"
          description="Crie o primeiro acesso para um familiar ou cuidador autorizado." />
      ) : (
        <div className="space-y-3">
          {filtered.map(acc => {
            const patient = patientMap[acc.elderly_id];
            const isExpired = acc.expires_at && acc.expires_at < format(new Date(), "yyyy-MM-dd");
            return (
              <div key={acc.id} className={cn("bg-card rounded-2xl border p-4 transition-all",
                !acc.active || isExpired ? "border-border opacity-60" : "border-border hover:border-primary/30"
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    acc.active && !isExpired ? "bg-primary/10" : "bg-secondary"
                  )}>
                    <Users className={cn("w-5 h-5", acc.active && !isExpired ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{acc.authorized_name}</span>
                      <span className="text-xs text-muted-foreground">{acc.relationship}</span>
                      {!acc.active && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">Inativo</span>}
                      {isExpired && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Expirado</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Paciente: <strong className="font-mono">{acc.elderly_code}</strong>
                      {acc.expires_at && ` · Expira: ${acc.expires_at}`}
                      {acc.last_accessed && ` · Último acesso: ${format(new Date(acc.last_accessed), "dd/MM/yy HH:mm")}`}
                    </p>

                    {/* Code */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">Código:</span>
                      <code className="text-xs bg-secondary px-2 py-0.5 rounded font-mono font-bold">{acc.access_code}</code>
                      <button onClick={() => copyCode(acc.access_code, acc.id)}
                        className="text-muted-foreground hover:text-primary transition-colors">
                        {copied === acc.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Permissions */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {PERMISSIONS.map(({ key, label }) => acc[key] && (
                        <span key={key} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{label}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleEdit(acc)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleToggleActive(acc)}
                      title={acc.active ? "Revogar acesso" : "Reativar acesso"}>
                      {acc.active ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => handleDelete(acc.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4" /> Como funciona o Portal Familiar
        </p>
        <ul className="text-xs space-y-1 text-blue-700 list-disc list-inside">
          <li>Crie um acesso com as permissões específicas para cada familiar</li>
          <li>Compartilhe o Código do Paciente + Código de Acesso com o autorizado</li>
          <li>O familiar acessa em <strong>/portal</strong> e insere os dois códigos</li>
          <li>Todos os acessos são registrados com data e hora (auditoria)</li>
          <li>Você pode revogar um acesso a qualquer momento</li>
        </ul>
      </div>
    </div>
  );
}