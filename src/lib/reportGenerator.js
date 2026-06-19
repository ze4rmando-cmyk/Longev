import jsPDF from 'jspdf';
import { getTestById } from './clinicalTests';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ─── Helpers ────────────────────────────────────────────────────────────────
const GREEN = [13, 148, 136];
const DARK  = [30, 41, 59];
const GRAY  = [100, 116, 139];
const LIGHT = [241, 245, 249];
const RED   = [220, 38, 38];
const AMBER = [217, 119, 6];

function addPage(doc) { doc.addPage(); return 20; }
function checkY(doc, y, needed = 15) { return (y + needed > 275) ? addPage(doc) : y; }

function sectionTitle(doc, text, y, pw) {
  doc.setFillColor(...GREEN);
  doc.rect(15, y - 4, pw - 30, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(text.toUpperCase(), 18, y + 1);
  doc.setTextColor(...DARK);
  return y + 10;
}

function subTitle(doc, text, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...GREEN);
  doc.text(text, 18, y);
  doc.setTextColor(...DARK);
  return y + 6;
}

function row(doc, label, value, y, pw, indent = 20) {
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...GRAY);
  doc.text(label + ":", indent, y);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK);
  const lines = doc.splitTextToSize(String(value || "—"), pw - indent - 55);
  doc.text(lines, indent + 50, y);
  return y + lines.length * 5;
}

function alertColor(level) {
  if (level === "critical") return RED;
  if (level === "attention") return AMBER;
  return GREEN;
}

function alertLabel(level) {
  if (level === "critical") return "CRITICO";
  if (level === "attention") return "ATENCAO";
  return "NORMAL";
}

// ─── generatePDF — relatório completo de um paciente ───────────────────────
export function generatePDF(patient, assessments, options = {}) {
  const { vitals = [], notes = [], appointments = [] } = options;
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  let y = 15;

  // ── CAPA ──
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pw, 38, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(255,255,255);
  doc.text("LongevCare", pw / 2, 16, { align: "center" });
  doc.setFontSize(11); doc.setFont("helvetica", "normal");
  doc.text("Prontuário Eletrônico Completo", pw / 2, 24, { align: "center" });
  doc.setFontSize(8);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pw / 2, 31, { align: "center" });
  doc.setTextColor(...DARK);
  y = 48;

  // ── 1. IDENTIFICAÇÃO DO PACIENTE ──
  y = sectionTitle(doc, "1. Identificação do Paciente", y, pw);
  y = row(doc, "Código Anônimo", patient.anonymous_code, y, pw);
  y = row(doc, "Idade", `${patient.age} anos`, y, pw);
  y = row(doc, "Sexo", patient.sex, y, pw);
  y = row(doc, "Status", patient.status || "Ativo", y, pw);
  y += 2;

  if (patient.health_conditions) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...GRAY);
    doc.text("Condições de Saúde:", 20, y); doc.setTextColor(...DARK);
    y += 5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(patient.health_conditions, pw - 45);
    y = checkY(doc, y, lines.length * 5 + 5);
    doc.text(lines, 25, y); y += lines.length * 5 + 3;
  }
  if (patient.medications) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...GRAY);
    doc.text("Medicamentos em Uso:", 20, y); doc.setTextColor(...DARK);
    y += 5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(patient.medications, pw - 45);
    y = checkY(doc, y, lines.length * 5 + 5);
    doc.text(lines, 25, y); y += lines.length * 5 + 3;
  }
  if (patient.notes) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...GRAY);
    doc.text("Observações Gerais:", 20, y); doc.setTextColor(...DARK);
    y += 5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(patient.notes, pw - 45);
    y = checkY(doc, y, lines.length * 5 + 5);
    doc.text(lines, 25, y); y += lines.length * 5 + 5;
  }
  y += 4;

  // ── 2. AVALIAÇÕES CLÍNICAS ──
  if (assessments.length > 0) {
    y = checkY(doc, y, 20);
    y = sectionTitle(doc, `2. Avaliações Clínicas (${assessments.length} registros)`, y, pw);

    assessments.forEach((a, idx) => {
      y = checkY(doc, y, 35);
      const test = getTestById(a.test_type);
      const alertLvl = alertLabel(a.alert_level);
      const alertClr = alertColor(a.alert_level);

      // badge alerta
      doc.setFillColor(...alertClr);
      doc.roundedRect(pw - 55, y - 4, 38, 7, 2, 2, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(255,255,255);
      doc.text(alertLvl, pw - 36, y + 0.5, { align: "center" });
      doc.setTextColor(...DARK);

      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.text(`${idx + 1}. ${test?.name || a.test_type}`, 20, y); y += 6;
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
      doc.text(`Data: ${format(new Date(a.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 25, y); y += 4.5;
      doc.text(`Pontuação: ${a.score}${a.max_score ? ` / ${a.max_score}` : ""}${a.max_score ? `  (${Math.round(a.score / a.max_score * 100)}% do máximo)` : ""}`, 25, y); y += 4.5;
      doc.text(`Classificação: ${a.classification}`, 25, y); y += 4.5;
      if (a.elderly_code) { doc.text(`Paciente: ${a.elderly_code}`, 25, y); y += 4.5; }
      if (a.notes) {
        const lines = doc.splitTextToSize(`Observações: ${a.notes}`, pw - 55);
        y = checkY(doc, y, lines.length * 4.5);
        doc.text(lines, 25, y); y += lines.length * 4.5;
      }
      y += 3;
      doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
      doc.line(20, y, pw - 20, y); y += 4;
    });
    y += 3;
  }

  // ── 3. SINAIS VITAIS ──
  if (vitals.length > 0) {
    y = checkY(doc, y, 25);
    y = sectionTitle(doc, `3. Sinais Vitais (${vitals.length} registros)`, y, pw);

    // Table header
    doc.setFillColor(...LIGHT);
    doc.rect(18, y - 3, pw - 36, 7, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...GRAY);
    const cols = [20, 48, 72, 92, 112, 130, 148];
    ["Data/Hora","PA (mmHg)","FC (bpm)","Glicemia","Peso","SpO₂","Obs"].forEach((h, i) => {
      doc.text(h, cols[i], y + 1);
    });
    doc.setTextColor(...DARK); y += 6;

    vitals.forEach(v => {
      y = checkY(doc, y, 6);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      const paAlert = v.systolic > 140 || v.diastolic > 90;
      const fcAlert = v.heart_rate > 100 || v.heart_rate < 60;
      const glcAlert = v.blood_glucose > 180 || v.blood_glucose < 70;
      const spo2Alert = v.oxygen_saturation < 95;

      doc.text(format(new Date(v.created_date), "dd/MM/yy HH:mm"), cols[0], y);

      if (paAlert) doc.setTextColor(...RED); else doc.setTextColor(...DARK);
      doc.text(v.systolic && v.diastolic ? `${v.systolic}/${v.diastolic}` : "—", cols[1], y);

      if (fcAlert) doc.setTextColor(...RED); else doc.setTextColor(...DARK);
      doc.text(v.heart_rate ? String(v.heart_rate) : "—", cols[2], y);

      if (glcAlert) doc.setTextColor(...AMBER); else doc.setTextColor(...DARK);
      doc.text(v.blood_glucose ? String(v.blood_glucose) : "—", cols[3], y);

      doc.setTextColor(...DARK);
      doc.text(v.weight ? `${v.weight}` : "—", cols[4], y);

      if (spo2Alert) doc.setTextColor(...RED); else doc.setTextColor(...DARK);
      doc.text(v.oxygen_saturation ? `${v.oxygen_saturation}%` : "—", cols[5], y);

      doc.setTextColor(...DARK);
      if (v.notes) {
        const noteText = v.notes.length > 25 ? v.notes.substring(0, 22) + "..." : v.notes;
        doc.text(noteText, cols[6], y);
      }
      y += 5;
    });
    y += 5;
  }

  // ── 4. AGENDAMENTOS ──
  if (appointments.length > 0) {
    y = checkY(doc, y, 25);
    y = sectionTitle(doc, `4. Consultas e Agendamentos (${appointments.length} registros)`, y, pw);

    appointments.forEach(a => {
      y = checkY(doc, y, 16);
      const statusColor = a.status === "Realizado" ? GRAY : a.status === "Cancelado" ? RED : GREEN;
      doc.setFillColor(...statusColor);
      doc.roundedRect(pw - 55, y - 4, 38, 6, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(255,255,255);
      doc.text(a.status || "Agendado", pw - 36, y + 0, { align: "center" });
      doc.setTextColor(...DARK);

      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
      doc.text(`${a.date} às ${a.time}  —  ${a.type}`, 20, y); y += 5;
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      if (a.specialty) { doc.text(`Especialidade: ${a.specialty}`, 25, y); y += 4.5; }
      if (a.reason) { doc.text(`Motivo: ${a.reason}`, 25, y); y += 4.5; }
      if (a.clinical_priority && a.clinical_priority !== "Normal") {
        doc.setTextColor(...RED); doc.text(`Prioridade: ${a.clinical_priority}`, 25, y); doc.setTextColor(...DARK); y += 4.5;
      }
      if (a.notes) {
        const lines = doc.splitTextToSize(`Obs: ${a.notes}`, pw - 55);
        doc.text(lines, 25, y); y += lines.length * 4.5;
      }
      y += 2;
      doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
      doc.line(20, y, pw - 20, y); y += 4;
    });
    y += 3;
  }

  // ── 5. REGISTROS CLÍNICOS ──
  if (notes.length > 0) {
    y = checkY(doc, y, 25);
    y = sectionTitle(doc, `5. Registros Clínicos (${notes.length} registros)`, y, pw);

    notes.forEach((n, idx) => {
      const contentLines = doc.splitTextToSize(n.content || "", pw - 45);
      y = checkY(doc, y, contentLines.length * 4.5 + 22);

      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...GREEN);
      doc.text(`${idx + 1}. ${n.note_type}`, 20, y);
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...GRAY);
      doc.text(format(new Date(n.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR }), pw - 20, y, { align: "right" });
      doc.setTextColor(...DARK);
      y += 5.5;

      if (n.cid_codes) { doc.setFontSize(7.5); doc.setTextColor(...GRAY); doc.text(`CID: ${n.cid_codes}`, 25, y); doc.setTextColor(...DARK); y += 4.5; }

      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
      doc.text(contentLines, 25, y); y += contentLines.length * 4.5 + 2;

      if (n.professional_name || n.professional_role) {
        doc.setFontSize(7.5); doc.setTextColor(...GRAY);
        doc.text(`${n.professional_name || ""}${n.professional_name && n.professional_role ? " · " : ""}${n.professional_role || ""}`, 25, y);
        doc.setTextColor(...DARK); y += 5;
      }
      doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
      doc.line(20, y, pw - 20, y); y += 5;
    });
  }

  // ── RODAPÉ ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFillColor(...GREEN);
    doc.rect(0, footerY - 5, pw, 15, "F");
    doc.setFont("helvetica", "italic"); doc.setFontSize(7); doc.setTextColor(255,255,255);
    doc.text(`LongevCare  •  ${patient.anonymous_code}  •  Página ${i} de ${totalPages}  •  Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, pw / 2, footerY, { align: "center" });
  }

  doc.save(`prontuario_${patient.anonymous_code}_${format(new Date(), "yyyy-MM-dd_HHmm")}.pdf`);
}

// ─── generateCSV — exportação completa com todas as seções ─────────────────
export function generateCSV(patient, assessments, options = {}) {
  const { vitals = [], notes = [], appointments = [] } = options;
  const BOM = "\uFEFF";
  const sep = ";"; // usar ; para compatibilidade com Excel pt-BR
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  let csv = BOM;

  // ── Info do paciente ──
  csv += "=== DADOS DO PACIENTE ===\n";
  csv += ["Campo","Valor"].map(q).join(sep) + "\n";
  csv += [q("Código Anônimo"), q(patient.anonymous_code)].join(sep) + "\n";
  csv += [q("Idade"), q(`${patient.age} anos`)].join(sep) + "\n";
  csv += [q("Sexo"), q(patient.sex)].join(sep) + "\n";
  csv += [q("Status"), q(patient.status || "Ativo")].join(sep) + "\n";
  csv += [q("Condições de Saúde"), q(patient.health_conditions || "")].join(sep) + "\n";
  csv += [q("Medicamentos em Uso"), q(patient.medications || "")].join(sep) + "\n";
  csv += [q("Observações Gerais"), q(patient.notes || "")].join(sep) + "\n";
  csv += [q("Data de Geração"), q(format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR }))].join(sep) + "\n";
  csv += "\n";

  // ── Avaliações ──
  if (assessments.length > 0) {
    csv += "=== AVALIAÇÕES CLÍNICAS ===\n";
    const headers = ["Código Paciente","Instrumento","Score","Score Máximo","% do Máximo","Classificação","Nível de Alerta","Data","Hora","Observações do Avaliador"];
    csv += headers.map(q).join(sep) + "\n";
    assessments.forEach(a => {
      const test = getTestById(a.test_type);
      const alertLabel = a.alert_level === "critical" ? "Crítico" : a.alert_level === "attention" ? "Atenção" : "Normal";
      const pct = a.max_score ? `${Math.round(a.score / a.max_score * 100)}%` : "";
      const dt = new Date(a.created_date);
      csv += [
        q(a.elderly_code || patient.anonymous_code),
        q(test?.name || a.test_type),
        q(a.score),
        q(a.max_score || ""),
        q(pct),
        q(a.classification),
        q(alertLabel),
        q(format(dt, "dd/MM/yyyy", { locale: ptBR })),
        q(format(dt, "HH:mm", { locale: ptBR })),
        q(a.notes || ""),
      ].join(sep) + "\n";
    });
    csv += "\n";
  }

  // ── Sinais Vitais ──
  if (vitals.length > 0) {
    csv += "=== SINAIS VITAIS ===\n";
    const headers = ["Código Paciente","Data","Hora","PA Sistólica (mmHg)","PA Diastólica (mmHg)","Freq. Cardíaca (bpm)","Glicemia (mg/dL)","Peso (kg)","SpO₂ (%)","Observações"];
    csv += headers.map(q).join(sep) + "\n";
    vitals.forEach(v => {
      const dt = new Date(v.created_date);
      csv += [
        q(v.elderly_code || patient.anonymous_code),
        q(format(dt, "dd/MM/yyyy")),
        q(format(dt, "HH:mm")),
        q(v.systolic || ""),
        q(v.diastolic || ""),
        q(v.heart_rate || ""),
        q(v.blood_glucose || ""),
        q(v.weight || ""),
        q(v.oxygen_saturation || ""),
        q(v.notes || ""),
      ].join(sep) + "\n";
    });
    csv += "\n";
  }

  // ── Agendamentos ──
  if (appointments.length > 0) {
    csv += "=== CONSULTAS E AGENDAMENTOS ===\n";
    const headers = ["Código Paciente","Data","Hora","Tipo","Especialidade","Motivo","Status","Prioridade","Lembrete Enviado","Observações"];
    csv += headers.map(q).join(sep) + "\n";
    appointments.forEach(a => {
      csv += [
        q(a.elderly_code || patient.anonymous_code),
        q(a.date),
        q(a.time),
        q(a.type),
        q(a.specialty || ""),
        q(a.reason || ""),
        q(a.status),
        q(a.clinical_priority || "Normal"),
        q(a.reminder_sent ? "Sim" : "Não"),
        q(a.notes || ""),
      ].join(sep) + "\n";
    });
    csv += "\n";
  }

  // ── Registros Clínicos ──
  if (notes.length > 0) {
    csv += "=== REGISTROS CLÍNICOS ===\n";
    const headers = ["Código Paciente","Data","Hora","Tipo de Registro","CID-10","Conteúdo","Profissional","Especialidade","Confidencial"];
    csv += headers.map(q).join(sep) + "\n";
    notes.forEach(n => {
      const dt = new Date(n.created_date);
      csv += [
        q(n.elderly_code || patient.anonymous_code),
        q(format(dt, "dd/MM/yyyy")),
        q(format(dt, "HH:mm")),
        q(n.note_type),
        q(n.cid_codes || ""),
        q(n.content || ""),
        q(n.professional_name || ""),
        q(n.professional_role || ""),
        q(n.private ? "Sim" : "Não"),
      ].join(sep) + "\n";
    });
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `prontuario_${patient.anonymous_code}_${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── generateCustomPDF — mantido para relatório personalizado ───────────────
export async function generateCustomPDF({ patients, assessments, vitals, title, period, domains, professionalName, professionalRole, observations }) {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  let y = 15;

  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pw, 35, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(255,255,255);
  doc.text("GeriCare Research", pw / 2, 14, { align: "center" });
  doc.setFontSize(11); doc.setFont("helvetica", "normal");
  doc.text(title, pw / 2, 22, { align: "center" });
  doc.setFontSize(8);
  doc.text(`Período: ${period}  •  Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pw / 2, 29, { align: "center" });
  doc.setTextColor(...DARK);
  y = 45;

  if (professionalName || professionalRole) {
    y = subTitle(doc, "Profissional Responsável", y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
    if (professionalName) { doc.text(`Nome: ${professionalName}`, 22, y); y += 5; }
    if (professionalRole) { doc.text(`Função: ${professionalRole}`, 22, y); y += 5; }
    y += 4;
  }

  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...GRAY);
  doc.text("Domínios incluídos:", 20, y); doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.text(domains.join(" • "), 60, y); y += 10;

  for (const patient of patients) {
    y = checkY(doc, y, 20);
    doc.setFillColor(...LIGHT);
    doc.rect(15, y - 4, pw - 30, 10, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...GREEN);
    doc.text(`PACIENTE: ${patient.anonymous_code}`, 18, y + 2);
    doc.setTextColor(...DARK); y += 10;

    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
    doc.text(`Idade: ${patient.age} anos  •  Sexo: ${patient.sex}  •  Status: ${patient.status || "Ativo"}`, 20, y); y += 5;
    if (patient.health_conditions) {
      const lines = doc.splitTextToSize(`Condições: ${patient.health_conditions}`, pw - 40);
      y = checkY(doc, y, lines.length * 5);
      doc.text(lines, 20, y); y += lines.length * 5;
    }
    if (patient.medications) {
      const lines = doc.splitTextToSize(`Medicamentos: ${patient.medications}`, pw - 40);
      y = checkY(doc, y, lines.length * 5);
      doc.text(lines, 20, y); y += lines.length * 5;
    }
    if (patient.notes) {
      const lines = doc.splitTextToSize(`Obs: ${patient.notes}`, pw - 40);
      y = checkY(doc, y, lines.length * 5);
      doc.text(lines, 20, y); y += lines.length * 5;
    }
    y += 3;

    const patientAssessments = assessments.filter(a => a.elderly_id === patient.id);
    if (patientAssessments.length > 0) {
      y = checkY(doc, y, 10);
      y = subTitle(doc, "Avaliações Clínicas", y);
      patientAssessments.forEach(a => {
        y = checkY(doc, y, 20);
        const test = getTestById(a.test_type);
        doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
        doc.text(`${test?.name || a.test_type}`, 22, y); y += 5;
        doc.setFont("helvetica", "normal"); doc.setFontSize(8);
        const alert = alertLabel(a.alert_level);
        doc.text(`Score: ${a.score}${a.max_score ? `/${a.max_score}` : ""}  •  ${a.classification}  •  ${alert}  •  ${format(new Date(a.created_date), "dd/MM/yyyy", { locale: ptBR })}`, 26, y); y += 4.5;
        if (a.notes) {
          const lines = doc.splitTextToSize(`Obs: ${a.notes}`, pw - 55);
          doc.text(lines, 26, y); y += lines.length * 4.5;
        }
        y += 2;
      });
    }

    const patientVitals = vitals.filter(v => v.elderly_id === patient.id);
    if (patientVitals.length > 0) {
      y = checkY(doc, y, 10);
      y = subTitle(doc, "Sinais Vitais", y);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      patientVitals.slice(0, 10).forEach(v => {
        y = checkY(doc, y, 6);
        doc.text(`${format(new Date(v.created_date), "dd/MM/yy HH:mm")}  PA: ${v.systolic && v.diastolic ? `${v.systolic}/${v.diastolic}` : "—"}  FC: ${v.heart_rate || "—"}  Glicemia: ${v.blood_glucose || "—"}  Peso: ${v.weight || "—"}  SpO₂: ${v.oxygen_saturation ? v.oxygen_saturation + "%" : "—"}`, 22, y); y += 5;
      });
    }
    y += 6;
  }

  if (observations) {
    y = checkY(doc, y, 20);
    y = sectionTitle(doc, "Observações do Profissional", y, pw);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    const lines = doc.splitTextToSize(observations, pw - 40);
    doc.text(lines, 20, y); y += lines.length * 5 + 6;
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const fY = doc.internal.pageSize.getHeight() - 10;
    doc.setFillColor(...GREEN); doc.rect(0, fY - 5, pw, 15, "F");
    doc.setFont("helvetica", "italic"); doc.setFontSize(7); doc.setTextColor(255,255,255);
    doc.text(`LongevCare  •  Página ${i} de ${totalPages}  •  Dados para fins de pesquisa científica`, pw / 2, fY, { align: "center" });
  }

  doc.save(`relatorio_personalizado_${format(new Date(), "yyyy-MM-dd_HHmm")}.pdf`);
}