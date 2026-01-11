'use server';

import { TABLE_NAME, HISTORY_TABLE_NAME, TASKS_TABLE_NAME, INVOICES_TABLE_NAME, base } from '@/lib/airtable';
import { MaintenanceTask, ServiceHistory, Expense, MaintenanceRecord, CarDetails } from '@/lib/types';
import { z } from 'zod';

const MileageSchema = z.number().min(0).max(1000000);
const HistorySchema = z.record(z.string(), z.number().min(0));

// Define the shape of our data
export interface CarData {
    mileage: number;
    history: ServiceHistory;
    details: CarDetails;
}

// SECURITY NOTE: In a production environment, all server actions MUST be protected
// by an authentication layer (e.g., Clerk, NextAuth, or session check).
// Current implementation is unauthenticated and exposed to resource exhaustion.

export async function fetchMaintenanceTasks(): Promise<MaintenanceTask[]> {
    console.log("[Airtable Debug] Checking environment variables...", {
        hasApiKey: !!process.env.AIRTABLE_API_KEY,
        hasBaseId: !!process.env.AIRTABLE_BASE_ID,
        nodeEnv: process.env.NODE_ENV
    });

    console.log("Fetching maintenance tasks from Airtable...");
    if (!base) {
        console.error("fetchMaintenanceTasks: Airtable base not initialized.");
        return [];
    }

    try {
        const records = await base(TASKS_TABLE_NAME).select().all();
        console.log(`fetchMaintenanceTasks: Found ${records.length} records in table ${TASKS_TABLE_NAME}`);

        if (records.length === 0) {
            console.warn("fetchMaintenanceTasks: Table is empty, returning temporary debug task");
            return [{
                id: 'no_tasks_found',
                name: 'Aucune tâche trouvée dans Airtable',
                interval: 0,
                priceIndep: 0,
                priceMB: 0,
                description: 'Vérifiez que la table TachesMaintenance contient bien des données.'
            }];
        }

        return records.map(record => ({
            id: (record.get('TaskID') as string) || record.id,
            airtableId: record.id,
            name: (record.get('Nom') as string) || 'Tâche sans nom',
            interval: (record.get('Intervalle') as number) || 0,
            priceIndep: (record.get('Prix Independant') as number) || 0,
            priceMB: (record.get('Prix Mercedes') as number) || 0,
            description: (record.get('Description') as string) || '',
        }));
    } catch (error) {
        console.error(`fetchMaintenanceTasks Error:`, error);
        return [];
    }
}

export async function fetchCarData(): Promise<CarData | null> {
    if (!base) {
        return null;
    }

    try {
        // 1. Fetch Mileage and Details from Vehicules
        const vehicleRecords = await base(TABLE_NAME).select({ maxRecords: 1 }).firstPage();
        const record = vehicleRecords[0];

        const mileage = record ? (record.get('Kilometrage Actuel') as number) : 0;
        const details: CarDetails = {
            mma: record ? (record.get('MMA') as number) || 2320 : 2320,
            puissanceFiscale: record ? (record.get('Puissance Fiscale') as number) || 10 : 10,
            nextTechnicalInspection: record ? (record.get('Prochain CT') as string) || '2026-12-26' : '2026-12-26',
            tireSize: record ? (record.get('Taille Pneus') as string) || '' : '',
            tireBrand: record ? (record.get('Marque Pneus') as string) || '' : '',
            tirePrice: record ? (record.get('Prix Pneus') as number) || 0 : 0,
            oilType: record ? (record.get('Type Huile') as string) || '' : '',
            oilBrand: record ? (record.get('Marque Huile') as string) || '' : '',
            oilPrice: record ? (record.get('Prix Huile') as number) || 0 : 0,
            notes: record ? (record.get('Notes') as string) || '' : '',
        };

        // 2. Fetch History from HistoriqueEntretiens
        const historyRecords = await base(HISTORY_TABLE_NAME).select().all();

        const history: ServiceHistory = {};
        historyRecords.forEach(record => {
            const taskId = record.get('TacheID') as string;
            const km = record.get('Kilometrage Realise') as number;

            if (taskId && km) {
                if (!history[taskId] || km > history[taskId]) {
                    history[taskId] = km;
                }
            }
        });

        return { mileage, history, details };
    } catch (error) {
        console.error("fetchCarData Error:", error);
        return null;
    }
}

export async function saveCarData(mileage: number, history: ServiceHistory, details?: CarDetails): Promise<boolean> {
    console.log("Server Action: Saving car data...");

    if (!base) {
        console.error("saveCarData: Airtable base not initialized.");
        return false;
    }

    try {
        // Validate Inputs
        MileageSchema.parse(mileage);
        HistorySchema.parse(history);

        // 1. Update Mileage and Details in Vehicules
        const vehicleRecords = await base(TABLE_NAME).select({ maxRecords: 1 }).firstPage();

        const updateFields: any = { 'Kilometrage Actuel': mileage };
        if (details) {
            updateFields['MMA'] = details.mma;
            updateFields['Puissance Fiscale'] = details.puissanceFiscale;
            updateFields['Prochain CT'] = details.nextTechnicalInspection;
            updateFields['Taille Pneus'] = details.tireSize;
            updateFields['Marque Pneus'] = details.tireBrand;
            updateFields['Prix Pneus'] = details.tirePrice;
            updateFields['Type Huile'] = details.oilType;
            updateFields['Marque Huile'] = details.oilBrand;
            updateFields['Prix Huile'] = details.oilPrice;
            updateFields['Notes'] = details.notes;
        }

        if (vehicleRecords.length === 0) {
            await base(TABLE_NAME).create([{ fields: updateFields }]);
        } else {
            // Check if anything actually changed to avoid unnecessary API calls
            const currentRecord = vehicleRecords[0];
            const currentKm = currentRecord.get('Kilometrage Actuel') as number;
            const currentMMA = currentRecord.get('MMA') as number;
            const currentPF = currentRecord.get('Puissance Fiscale') as number;
            const currentCT = currentRecord.get('Prochain CT') as string;

            const needsUpdate = currentKm !== mileage ||
                (details && (
                    currentRecord.get('MMA') !== details.mma ||
                    currentRecord.get('Puissance Fiscale') !== details.puissanceFiscale ||
                    currentRecord.get('Prochain CT') !== details.nextTechnicalInspection ||
                    currentRecord.get('Taille Pneus') !== details.tireSize ||
                    currentRecord.get('Marque Pneus') !== details.tireBrand ||
                    currentRecord.get('Prix Pneus') !== details.tirePrice ||
                    currentRecord.get('Type Huile') !== details.oilType ||
                    currentRecord.get('Marque Huile') !== details.oilBrand ||
                    currentRecord.get('Prix Huile') !== details.oilPrice ||
                    currentRecord.get('Notes') !== details.notes
                ));

            if (needsUpdate) {
                await base(TABLE_NAME).update(currentRecord.id, updateFields);
            }
        }

        // 2. Sync History to HistoriqueEntretiens
        const existingHistory = await base(HISTORY_TABLE_NAME).select().all();

        for (const [taskId, km] of Object.entries(history)) {
            const exists = existingHistory.some(r =>
                r.get('TacheID') === taskId &&
                r.get('Kilometrage Realise') === km
            );

            if (!exists) {
                await base(HISTORY_TABLE_NAME).create([{
                    fields: {
                        'TacheID': taskId,
                        'Kilometrage Realise': km
                    }
                }]);
            }
        }

        return true;
    } catch (error: any) {
        console.error("saveCarData Error Details:", error?.response?.data || error.message || error);
        if (error instanceof z.ZodError) {
            console.error("saveCarData Validation Error:", error.issues);
        } else {
            console.error("saveCarData Critical Error:", error);
        }
        return false;
    }
}

export async function saveInvoice(data: any): Promise<boolean> {
    console.log("Server Action: Saving structured invoice...");
    if (!base) return false;

    try {
        await base(INVOICES_TABLE_NAME).create([{
            fields: {
                'Analyse': data.analysis,
                'Date Analyse': new Date().toISOString().split('T')[0],
                'Date': data.date || '',
                'Montant': data.amount || 0,
                'Libelle': data.label || 'Facture',
                'Type': data.type || 'Autre',
                'Conforme': data.isConform ? 'OUI' : 'NON'
            }
        }]);
        return true;
    } catch (error) {
        console.error(`saveInvoice Error (Table: ${INVOICES_TABLE_NAME}):`, error);
        try {
            await base(INVOICES_TABLE_NAME).create([{
                fields: {
                    'Analyse': `[FAILSAFE] ${data.analysis}\n\nStructured Data: ${JSON.stringify(data)}`,
                    'Date Analyse': new Date().toISOString().split('T')[0]
                }
            }]);
            return true;
        } catch (innerError) {
            return false;
        }
    }
}

export async function fetchExpenses(): Promise<Expense[]> {
    console.log("Server Action: Fetching expenses from Airtable...");
    if (!base) return [];

    try {
        const records = await base(INVOICES_TABLE_NAME).select({
            sort: [{ field: 'Date', direction: 'desc' }]
        }).all();

        return records.map(record => ({
            id: record.id,
            date: (record.get('Date') as string) || (record.get('Date Analyse') as string) || '',
            amount: (record.get('Montant') as number) || 0,
            label: (record.get('Libelle') as string) || 'Document',
            type: (record.get('Type') as any) || 'Autre',
            analysis: (record.get('Analyse') as string) || '',
            isConform: record.get('Conforme') === 'OUI'
        }));
    } catch (error) {
        console.error("fetchExpenses Error:", error);
        return [];
    }
}

export async function fetchMaintenanceHistory(): Promise<MaintenanceRecord[]> {
    console.log("Server Action: Fetching maintenance history...");
    if (!base) return [];

    try {
        const [historyRecords, taskRecords] = await Promise.all([
            base(HISTORY_TABLE_NAME).select({
                sort: [{ field: 'Kilometrage Realise', direction: 'desc' }]
            }).all(),
            fetchMaintenanceTasks()
        ]);

        const taskMap = new Map(taskRecords.map(t => [t.id, t.name]));

        return historyRecords.map(record => {
            const taskId = record.get('TacheID') as string;
            return {
                id: record.id,
                taskId,
                taskName: taskMap.get(taskId) || 'Tâche inconnue',
                mileage: (record.get('Kilometrage Realise') as number) || 0,
                date: (record.get('Date') as string) || undefined
            };
        });
    } catch (error) {
        console.error("fetchMaintenanceHistory Error:", error);
        return [];
    }
}

