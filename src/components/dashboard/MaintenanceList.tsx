import { MaintenanceTask, ServiceHistory } from '@/lib/types';
import MaintenanceItem from './MaintenanceItem';

interface MaintenanceListProps {
  tasks: MaintenanceTask[];
  currentMileage: number;
  serviceHistory: ServiceHistory;
  onMarkDone: (id: string) => void;
}

export default function MaintenanceList({ tasks, currentMileage, serviceHistory, onMarkDone }: MaintenanceListProps) {
  return (
    <main className="px-4 sm:px-6 mt-8 sm:mt-12 space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center px-4 mb-4">
          <h2 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400 italic">Maintenance préventive</h2>
          <span className="text-[9px] sm:text-[10px] font-black bg-slate-900 text-white px-3 py-1 sm:px-4 sm:py-1.5 rounded-full tracking-tighter shadow-lg">W213 BERLINE</span>
      </div>
      
      {tasks.map(task => (
        <MaintenanceItem
          key={task.id}
          task={task}
          currentMileage={currentMileage}
          serviceHistory={serviceHistory}
          onMarkDone={onMarkDone}
        />
      ))}
    </main>
  );
}
