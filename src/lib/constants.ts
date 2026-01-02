import type { MaintenanceTask } from './types';

export const MAINTENANCE_TASKS: MaintenanceTask[] = [
  { id: 'service_a', name: 'Service A (Petit)', interval: 25000, priceIndep: 220, priceMB: 400, description: 'Vidange, filtres, AdBlue' },
  { id: 'service_b', name: 'Service B (Grand)', interval: 50000, priceIndep: 400, priceMB: 680, description: 'Service A + Freins + Habitacle' },
  { id: 'bva', name: 'Vidange BVA 9G-Tronic', interval: 60000, priceIndep: 550, priceMB: 880, description: 'Carter, huile et crépine' },
  { id: 'fuel_filter', name: 'Filtre Carburant', interval: 50000, priceIndep: 130, priceMB: 250, description: 'Protection injecteurs OM 654' },
  { id: 'brakes_av', name: 'Plaquettes Avant', interval: 45000, priceIndep: 160, priceMB: 350, description: 'Sécurité freinage' }
];
