import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { getTestById, getAlertColor } from "@/lib/clinicalTests";
import { cn } from "@/lib/utils";
import AlertBadge from "@/components/AlertBadge";
import ClinicalInterpretationPanel from "@/components/ClinicalInterpretationPanel";

export default function TestApplication() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get("patient");
  const testId = urlParams.get("test");

  const test = getTestById(testId);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});
  const [notes, setNotes] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (patientId) {
      base44.entities.Elderly.filter({ id: patientId }).then(([p]) => {
        setPatient(p);
        setLoading(false);
      });
    }
  }, [patientId]);

  if (loading || !test) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const allQuestions = test.sections.flatMap(s => s.questions);
  const answeredCount = Object.keys(responses).length;
  const totalQuestions = allQuestions.length;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const section = test.sections[currentSection];
  const isLastSection = currentSection === test.sections.length - 1;

  const handleAnswer = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateScore = () => {
    let score = 0;
    if (testId === "GDS") {
      test.sections[0].questions.forEach(q => {
        const answer = responses[q.id];
        if (answer === q.depressiveAnswer) score += 1;
      });
    } else if (testId === "MEEM") {
      allQuestions.forEach(q => {
        if (responses[q.id] === 1) score += q.points;
      });
    } else {
      allQuestions.forEach(q => {
        score += (responses[q.id] || 0);
      });
    }
    return score;
  };

  const handleFinish = () => {
    setShowResult(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const score = calculateScore();
    const result = test.classify(score);

    await base44.entities.Assessment.create({
      elderly_id: patientId,
      elderly_code: patient.anonymous_code,
      test_type: testId,
      responses: JSON.stringify(responses),
      score,
      max_score: test.maxScore,
      classification: result.classification,
      alert_level: result.alert,
      notes,
    });

    navigate(`/patients/${patientId}`);
  };

  if (showResult) {
    const score = calculateScore();
    const result = test.classify(score);

    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-4 py-6">
          <div className={cn("w-20 h-20 rounded-2xl mx-auto flex items-center justify-center", getAlertColor(result.alert))}>
            {result.alert === "normal" ? (
              <Check className="w-8 h-8" />
            ) : (
              <AlertTriangle className="w-8 h-8" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold font-dm">Resultado: {test.shortName || test.name}</h1>
            <p className="text-muted-foreground text-sm">Paciente: {patient.anonymous_code}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 text-center space-y-4">
          <div>
            <p className="text-4xl font-bold font-dm">{score}<span className="text-lg text-muted-foreground">/{test.maxScore}</span></p>
            <p className="text-sm text-muted-foreground mt-1">Pontuação</p>
          </div>
          <AlertBadge level={result.alert} label={result.classification} />
        </div>

        <ClinicalInterpretationPanel testId={testId} alertLevel={result.alert} />

        <div className="space-y-2">
          <Label>Observações do Avaliador</Label>
          <Textarea
            placeholder="Anotações sobre a aplicação do teste..."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setShowResult(false)}>
            Revisar Respostas
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Resultado"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold font-dm truncate">{test.name}</h1>
          <p className="text-xs text-muted-foreground">Paciente: {patient?.anonymous_code}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Seção {currentSection + 1} de {test.sections.length}</span>
          <span>{answeredCount}/{totalQuestions} respondidas</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Section */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-5">
        <div>
          <h2 className="font-semibold font-dm text-base">{section.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{section.instructions}</p>
        </div>

        <div className="space-y-4">
          {section.questions.map((q) => (
            <QuestionItem
              key={q.id}
              question={q}
              testId={testId}
              value={responses[q.id]}
              onChange={(val) => handleAnswer(q.id, val)}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentSection > 0 && (
          <Button variant="outline" className="flex-1" onClick={() => setCurrentSection(currentSection - 1)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Anterior
          </Button>
        )}
        {isLastSection ? (
          <Button className="flex-1" onClick={handleFinish}>
            <Check className="w-4 h-4 mr-1.5" /> Finalizar
          </Button>
        ) : (
          <Button className="flex-1" onClick={() => setCurrentSection(currentSection + 1)}>
            Próxima <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

function QuestionItem({ question, testId, value, onChange }) {
  if (testId === "GDS") {
    return (
      <div className="border border-border rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium">{question.text}</p>
        <div className="flex gap-2">
          {["Sim", "Não"].map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium transition-all border",
                value === opt
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 text-foreground border-border hover:bg-secondary"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (question.options) {
    return (
      <div className="border border-border rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium">{question.text}</p>
        <div className="space-y-2">
          {question.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all border",
                value === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/30 text-foreground border-border hover:bg-secondary"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // MEEM style: correct/incorrect
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <p className="text-sm font-medium">{question.text}</p>
      <div className="flex gap-2">
        {[
          { label: "Correto", val: 1 },
          { label: "Incorreto", val: 0 },
        ].map((opt) => (
          <button
            key={opt.val}
            onClick={() => onChange(opt.val)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition-all border",
              value === opt.val
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/50 text-foreground border-border hover:bg-secondary"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}