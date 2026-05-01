import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, Send, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function TeamChat() {
  const [messages, setMessages] = useState([]);
  const [patients, setPatients] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [senderName, setSenderName] = useState(() => localStorage.getItem("gc_sender_name") || "");
  const [filterPatient, setFilterPatient] = useState("all");
  const [searchPatient, setSearchPatient] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [nameSet, setNameSet] = useState(!!localStorage.getItem("gc_sender_name"));
  const [nameInput, setNameInput] = useState("");
  const bottomRef = useRef(null);

  const load = async () => {
    const [msgs, pts] = await Promise.all([
      base44.entities.TeamMessage.list("created_date", 200),
      base44.entities.Elderly.list("-created_date", 200),
    ]);
    setMessages(msgs);
    setPatients(pts);
    setLoading(false);
  };

  useEffect(() => {
    if (!nameSet) return;
    load();
    const unsub = base44.entities.TeamMessage.subscribe((event) => {
      if (event.type === "create") setMessages(prev => [...prev, event.data]);
      else if (event.type === "delete") setMessages(prev => prev.filter(m => m.id !== event.id));
    });
    return unsub;
  }, [nameSet]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSetName = () => {
    if (!nameInput.trim()) return;
    localStorage.setItem("gc_sender_name", nameInput.trim());
    setSenderName(nameInput.trim());
    setNameSet(true);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const patient = filterPatient !== "all" ? patients.find(p => p.id === filterPatient) : null;
    await base44.entities.TeamMessage.create({
      sender_name: senderName,
      message: newMessage.trim(),
      patient_id: patient?.id || "",
      patient_code: patient?.anonymous_code || "",
    });
    setNewMessage("");
    setSending(false);
  };

  const filteredMessages = messages.filter(m => {
    if (filterPatient === "all") return true;
    const patient = patients.find(p => p.id === filterPatient);
    return m.patient_id === filterPatient || (patient && m.patient_code === patient.anonymous_code);
  });

  const filteredPatients = patients.filter(p =>
    !searchPatient || p.anonymous_code.toLowerCase().includes(searchPatient.toLowerCase())
  );

  if (!nameSet) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full space-y-4 shadow-sm">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-lg font-bold font-dm">Chat da Equipe</h2>
            <p className="text-sm text-muted-foreground mt-1">Qual é o seu nome para identificação nas mensagens?</p>
          </div>
          <Input
            placeholder="Seu nome ou função (ex: Dr. Ana)"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSetName()}
            autoFocus
          />
          <Button className="w-full" onClick={handleSetName} disabled={!nameInput.trim()}>
            Entrar no Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-dm flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Chat da Equipe
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Comunicação interna entre profissionais · Olá, <strong>{senderName}</strong>
          </p>
        </div>
        <button
          className="text-xs text-muted-foreground hover:text-foreground underline"
          onClick={() => { localStorage.removeItem("gc_sender_name"); setNameSet(false); setSenderName(""); setNameInput(""); }}
        >
          Trocar nome
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-240px)] min-h-[500px]">
        {/* Sidebar — filtros por paciente */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Filtrar por Paciente
            </h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-8 h-8 text-xs" value={searchPatient} onChange={e => setSearchPatient(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <button
              onClick={() => setFilterPatient("all")}
              className={cn("w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all",
                filterPatient === "all" ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"
              )}
            >
              💬 Geral ({messages.filter(m => !m.patient_id).length})
            </button>
            {filteredPatients.map(p => {
              const count = messages.filter(m => m.patient_id === p.id).length;
              return (
                <button key={p.id} onClick={() => setFilterPatient(p.id)}
                  className={cn("w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all",
                    filterPatient === p.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"
                  )}>
                  <span className="font-mono">{p.anonymous_code}</span>
                  {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border flex flex-col overflow-hidden">
          {/* Context badge */}
          {filterPatient !== "all" && (
            <div className="px-4 py-2 bg-primary/5 border-b border-border flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary">
                {patients.find(p => p.id === filterPatient)?.anonymous_code}
              </span>
              <span className="text-xs text-muted-foreground">— Mensagens relacionadas a este paciente</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma mensagem ainda. Seja o primeiro!</p>
              </div>
            ) : (
              filteredMessages.map(msg => {
                const isMe = msg.sender_name === senderName;
                return (
                  <div key={msg.id} className={cn("flex gap-3", isMe ? "justify-end" : "justify-start")}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                        {msg.sender_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className={cn("max-w-[75%]", isMe && "items-end flex flex-col")}>
                      <div className="flex items-center gap-2 mb-1">
                        {!isMe && <span className="text-xs font-semibold text-foreground">{msg.sender_name}</span>}
                        {msg.patient_code && (
                          <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{msg.patient_code}</span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(msg.created_date), "HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <div className={cn("rounded-2xl px-4 py-2.5 text-sm",
                        isMe ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                      )}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            {filterPatient !== "all" && (
              <span className="text-[10px] font-mono text-muted-foreground self-center shrink-0 bg-secondary px-2 py-1 rounded">
                {patients.find(p => p.id === filterPatient)?.anonymous_code}
              </span>
            )}
            <Input
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSend} disabled={!newMessage.trim() || sending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}