import { Gauge, Plus, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatMileage } from '@/lib/utils';

interface StatsCardProps {
  currentMileage: number;
  isClient: boolean;
  isSpeaking: boolean;
  onUpdateClick: () => void;
  onSpeakClick: () => void;
}

export default function StatsCard({ currentMileage, isClient, isSpeaking, onUpdateClick, onSpeakClick }: StatsCardProps) {
  return (
    <Card className="rounded-[2rem] sm:rounded-[3rem] p-4 sm:p-8 shadow-2xl shadow-slate-200/60 border-white/80 flex items-center justify-between">
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="bg-slate-900 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-lg shadow-slate-200">
          <Gauge className="w-6 h-6 sm:w-9 sm:h-9 text-white" />
        </div>
        <div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-black tracking-[0.15em] sm:tracking-[0.2em] mb-1">Kilométrage</p>
          <p className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-none">
            {isClient ? formatMileage(currentMileage) : `${currentMileage} KM`}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:gap-3">
        <Button
          onClick={onUpdateClick}
          className="bg-primary text-primary-foreground rounded-[1.25rem] shadow-xl shadow-blue-100 active:scale-95 transition-all w-12 h-12 sm:w-16 sm:h-16"
        >
          <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
        </Button>
        <Button
          onClick={onSpeakClick}
          disabled={isSpeaking}
          variant={isSpeaking ? 'default' : 'secondary'}
          className={`${isSpeaking ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-50 text-slate-400'} rounded-[1.25rem] active:scale-95 transition-all border border-slate-100 w-12 h-12 sm:w-16 sm:h-16`}
        >
          {isSpeaking ? <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin text-white" /> : <Volume2 className="w-6 h-6 sm:w-7 sm:h-7" />}
        </Button>
      </div>
    </Card>
  );
}
