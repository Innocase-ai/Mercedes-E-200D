"use client";

import { MaintenanceTask, ServiceHistory } from '@/lib/types';
import { calculateMaintenanceStatus } from '@/lib/utils';
import { AlertTriangle, Info, BellRing } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MaintenanceAlertProps {
    tasks: MaintenanceTask[];
    currentMileage: number;
    serviceHistory: ServiceHistory;
}

export default function MaintenanceAlert({ tasks, currentMileage, serviceHistory }: MaintenanceAlertProps) {
    const alerts = tasks.map(task => {
        const lastDone = serviceHistory[task.id] || 0;
        return {
            task,
            ...calculateMaintenanceStatus(lastDone, task.interval, currentMileage)
        };
    }).filter(a => a.status !== 'OK');

    if (alerts.length === 0) return null;

    return (
        <div className="px-4 sm:px-6 mb-8 mt-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="space-y-4">
                {alerts.map((alert) => (
                    <Card key={alert.task.id} className={cn(
                        "rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 border-l-[6px] shadow-xl transition-all",
                        alert.status === 'RETARD'
                            ? "bg-red-50 border-red-500 shadow-red-100/50"
                            : "bg-amber-50 border-amber-500 shadow-amber-100/50"
                    )}>
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                "p-2 sm:p-3 rounded-2xl shrink-0",
                                alert.status === 'RETARD' ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                            )}>
                                {alert.status === 'RETARD' ? <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" /> : <BellRing className="w-5 h-5 sm:w-6 sm:h-6" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className={cn(
                                        "font-black uppercase tracking-tight text-sm sm:text-base mb-1",
                                        alert.status === 'RETARD' ? "text-red-900" : "text-amber-900"
                                    )}>
                                        {alert.status === 'RETARD' ? "Entretien en retard !" : "Entretien à prévoir"}
                                    </h3>
                                    <span className={cn(
                                        "text-[9px] sm:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                        alert.status === 'RETARD' ? "bg-red-200 text-red-700" : "bg-amber-200 text-amber-700"
                                    )}>
                                        {alert.status === 'RETARD' ? "Critique" : "Alerte"}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-[12px] sm:text-sm font-bold leading-tight">
                                    {alert.task.name} : <span className="font-black">{alert.remaining <= 0 ? "Échéance dépassée" : `Encore ${alert.remaining.toLocaleString()} km`}</span>
                                </p>
                                <div className="mt-2 flex items-center gap-1.5 text-[11px] sm:text-[12px] text-slate-400 font-bold italic">
                                    <Info className="w-3.5 h-3.5" />
                                    <span>Prévu vers le {alert.estimatedDate}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
