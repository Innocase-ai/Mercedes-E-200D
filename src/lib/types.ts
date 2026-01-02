export interface MaintenanceTask {
  id: string;
  name: string;
  interval: number;
  priceIndep: number;
  priceMB: number;
  description: string;
}

export interface ServiceHistory {
  [key: string]: number;
}
