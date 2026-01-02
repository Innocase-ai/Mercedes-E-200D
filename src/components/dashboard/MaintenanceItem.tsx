
"use client";

import { useState, useEffect } from 'react';
import { MaintenanceTask, ServiceHistory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateMaintenanceStatus, formatMileage, formatCurrency } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface MaintenanceItemProps {
  task: MaintenanceTask;
  currentMileage: number;
  serviceHistory: ServiceHistory;
  onMarkDone: (id: string) => void;
}

export default function MaintenanceItem({ task, currentMileage, serviceHistory, onMarkDone }: MaintenanceItemProps) {
  const [open, setOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const lastDone = serviceHistory[task.id] || 0;
  const { remaining, colorClass, status, nextDue, progressColorClass, textColorClass } =
    calculateMaintenanceStatus(lastDone, task.interval, currentMileage);

  const progressPercentage = Math.max(0, Math.min(100, (1 - remaining / task.interval) * 100));

  const handleConfirm = () => {
    onMarkDone(task.id);
    setOpen(false);
  }

  return (
    <Card className="rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 shadow-sm border-gray-100 group active:scale-[0.99] transition-all hover:shadow-xl hover:shadow-slate-100">
      <CardHeader className="flex-row justify-between items-start mb-4 sm:mb-6 p-0">
        <div className="flex items-start gap-3 sm:gap-5">
          <div className={`${colorClass} w-2 sm:w-3 h-12 sm:h-14 rounded-full opacity-10`} />
          <div>
            <CardTitle className="font-black text-slate-800 tracking-tight text-lg sm:text-xl leading-none mb-1 sm:mb-2">{task.name}</CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-tight opacity-80">{task.description}</CardDescription>
          </div>
        </div>
        <Badge className={`${colorClass} text-white text-[9px] sm:text-[10px] font-black px-3 py-1 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl uppercase tracking-widest shadow-lg shadow-slate-100`}>
          {status}
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8 mb-6 px-1">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] sm:text-[11px] mb-2 sm:mb-3 text-slate-300 font-black uppercase tracking-tighter">
              <span>État de la pièce</span>
              <span>Échéance : {isClient ? formatMileage(nextDue) : `${nextDue} km`}</span>
            </div>
            <Progress value={progressPercentage} className="h-2 sm:h-2.5 w-full bg-slate-50 border border-slate-100" indicatorClassName={progressColorClass} />
          </div>
          <div className="text-right min-w-[100px]">
            <span className={`text-3xl sm:text-4xl font-black tracking-tighter leading-none ${remaining <= 0 ? 'text-red-500' : 'text-slate-900'}`}>
              {isClient ? Math.max(0, remaining).toLocaleString() : Math.max(0, remaining)}
            </span>
            <p className="text-[10px] sm:text-[11px] text-slate-300 font-black uppercase tracking-widest mt-1 sm:mt-2">KM RESTANTS</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-4 sm:pt-6 border-t border-slate-50 p-0">
        <div className="flex gap-4 sm:gap-10">
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-black tracking-tighter mb-1">Garage Soignies</span>
            <span className="text-base sm:text-lg font-black text-slate-700">{formatCurrency(task.priceIndep)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-black tracking-tighter mb-1">Concessionnaire</span>
            <span className="text-base sm:text-lg font-black text-primary">{formatCurrency(task.priceMB)}</span>
          </div>
        </div>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button className="bg-slate-900 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-[1.25rem] sm:rounded-[1.5rem] text-[11px] sm:text-[12px] font-black uppercase tracking-widest shadow-2xl active:scale-90 transition-all h-auto">
              Valider
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer l'entretien</AlertDialogTitle>
              <AlertDialogDescription>
                Confirmez-vous la réalisation de "{task.name}" au kilométrage actuel de {isClient ? formatMileage(currentMileage) : `${currentMileage} km`} ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>Confirmer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
