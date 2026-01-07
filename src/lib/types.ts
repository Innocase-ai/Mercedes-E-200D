export interface MaintenanceTask {
  id: string;
  airtableId?: string;
  name: string;
  interval: number;
  priceIndep: number;
  priceMB: number;
  description: string;
}

export interface ServiceHistory {
  [key: string]: number;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  label: string;
  type: 'Entretien' | 'Taxe' | 'Assurance' | 'Réparation' | 'Autre';
  analysis: string;
  isConform: boolean;
}

export interface CarDetails {
  mma: number;
  puissanceFiscale: number;
  nextTechnicalInspection: string;
}

export interface MaintenanceRecord {
  id: string;
  taskName: string;
  mileage: number;
  date?: string;
  taskId: string;
}
