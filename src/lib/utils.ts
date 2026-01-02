import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateMaintenanceStatus(lastDone: number, interval: number, currentMileage: number) {
  const nextDue = lastDone + interval;
  const remaining = nextDue - currentMileage;

  let colorClass = 'bg-green-500';
  let progressColorClass = 'bg-green-500';
  let textColorClass = 'text-green-500';
  let status = 'OK';

  if (remaining <= 0) {
    colorClass = 'bg-red-500';
    progressColorClass = 'bg-red-500';
    textColorClass = 'text-red-500';
    status = 'RETARD';
  }
  else if (remaining <= 2000) {
    colorClass = 'bg-amber-500';
    progressColorClass = 'bg-amber-500';
    textColorClass = 'text-amber-500';
    status = 'PROCHE';
  }

  const kmPerDay = 20000 / 365;
  const daysRemaining = Math.max(0, remaining / kmPerDay);
  const date = new Date();
  date.setDate(date.getDate() + daysRemaining);
  const estimatedDate = date.toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' });

  return { remaining, colorClass, status, nextDue, progressColorClass, textColorClass, estimatedDate };
}

export function formatMileage(km: number): string {
  return km.toLocaleString() + ' km';
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString() + '€';
}
