import { Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AiDiagnosisProps {
  aiDiagnosis: string;
  isDiagnosing: boolean;
  onDiagnoseClick: () => void;
}

export default function AiDiagnosis({ aiDiagnosis, isDiagnosing, onDiagnoseClick }: AiDiagnosisProps) {
  return (
    <section className="px-4 sm:px-6 mt-8 sm:mt-12">
      <Card className="rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border-gray-100 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
        <CardHeader className="flex flex-row items-center justify-between mb-6 relative z-10 p-0">
          <CardTitle className="font-black text-slate-800 flex items-center gap-3 uppercase text-xs tracking-widest">
            <Sparkles className="w-5 h-5 text-primary" /> Analyse Prédictive IA
          </CardTitle>
          <Button
            onClick={onDiagnoseClick}
            disabled={isDiagnosing}
            variant="secondary"
            className="bg-primary/10 text-primary text-[10px] sm:text-[11px] font-black px-3 py-2 sm:px-4 rounded-lg sm:rounded-xl flex items-center gap-2 uppercase tracking-tighter transition-all active:scale-95 hover:bg-primary/20"
          >
            {isDiagnosing ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
            {aiDiagnosis ? "Réanalyser" : "Lancer"}
          </Button>
        </CardHeader>
        
        <CardContent className="text-sm sm:text-[15px] leading-relaxed text-slate-600 relative z-10 font-medium italic p-0">
          {isDiagnosing ? (
              <div className="flex items-center gap-3 text-primary font-bold animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin" /> Expertise OM 654 en cours...
              </div>
          ) : (
              aiDiagnosis || "L'assistant Gemini peut analyser vos données d'entretien pour anticiper les pannes sur votre motorisation."
          )}
        </CardContent>
      </Card>
    </section>
  );
}
