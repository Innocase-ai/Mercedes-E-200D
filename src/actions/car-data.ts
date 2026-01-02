'use server';

import { base, TABLE_NAME, TASKS_TABLE_NAME, HISTORY_TABLE_NAME, INVOICES_TABLE_NAME } from '@/lib/airtable';
import { MaintenanceTask, ServiceHistory, Expense } from '@/lib/types';
import { z } from 'zod';

const MileageSchema = z.number().min(0).max(1000000);
const HistorySchema = z.record(z.string(), z.number().min(0));

// Define the shape of our data
export interface CarData {
    mileage: number;
    history: ServiceHistory;
}

// SECURITY NOTE: In a production environment, all server actions MUST be protected
// by an authentication layer (e.g., Clerk, NextAuth, or session check).
// Current implementation is unauthenticated and exposed to resource exhaustion.

export async function fetchMaintenanceTasks(): Promise<MaintenanceTask[]> {
    console.log("Server Action: Fetching maintenance tasks...");
    if (!base) {
        console.error("fetchMaintenanceTasks: Airtable base not initialized.");
        return [];
    }

    try {
        const records = await base(TASKS_TABLE_NAME).select().all();
        return records.map(record => ({
            id: record.id,
            name: (record.get('Nom') as string) || 'Tâche sans nom',
            interval: (record.get('Intervalle') as number) || 0,
            priceIndep: (record.get('Prix Independant') as number) || 0,
            priceMB: (record.get('Prix Mercedes') as number) || 0,
            description: (record.get('Description') as string) || '',
        }));
    } catch (error) {
        console.error(`fetchMaintenanceTasks Error (Table: ${TASKS_TABLE_NAME}):`, error);
        return [];
    }
}

export async function fetchCarData(): Promise<CarData | null> {
    console.log("Server Action: Fetching car data (Mileage & History)...");
    if (!base) {
        console.error("fetchCarData: Airtable base not initialized.");
        return null;
    }

    try {
        // 1. Fetch Mileage from Vehicules
        const vehicleRecords = await base(TABLE_NAME).select({ maxRecords: 1 }).firstPage();
        const mileage = vehicleRecords.length > 0 ? (vehicleRecords[0].get('Kilometrage Actuel') as number) : 0;

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

        return { mileage, history };
    } catch (error) {
        console.error("fetchCarData Error:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return null; // Ensure we return null so UI knows something went wrong
    }
}

export async function saveCarData(mileage: number, history: ServiceHistory): Promise<boolean> {
    console.log("Server Action: Saving car data...");

    if (!base) {
        console.error("saveCarData: Airtable base not initialized.");
        return false;
    }

    try {
        // Validate Inputs
        MileageSchema.parse(mileage);
        HistorySchema.parse(history);

        // 1. Update Mileage in Vehicules
        const vehicleRecords = await base(TABLE_NAME).select({ maxRecords: 1 }).firstPage();
        if (vehicleRecords.length === 0) {
            await base(TABLE_NAME).create([{ fields: { 'Kilometrage Actuel': mileage } }]);
        } else {
            const currentKm = vehicleRecords[0].get('Kilometrage Actuel') as number;
            if (currentKm !== mileage) {
                await base(TABLE_NAME).update(vehicleRecords[0].id, { 'Kilometrage Actuel': mileage });
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
    } catch (error) {
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
        // Note: This might fail if the user hasn't added the new columns yet.
        // I will try to fall back to just analysis if it fails.
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

