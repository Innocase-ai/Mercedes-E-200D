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
    // FORCE DEBUG RETURN
    return [
        {
            id: 'service_a',
            airtableId: 'recTest1',
            name: 'Service A (Test Forcé)',
            interval: 25000,
            priceIndep: 220,
            priceMB: 400,
            description: 'Tâche forcée pour test affichage'
        },
        {
            id: 'bva_9g',
            airtableId: 'recTest2',
            name: 'Vidange BVA 9G-Tronic',
            interval: 125000,
            priceIndep: 400,
            priceMB: 600,
            description: 'Vidange boîte'
        }
    ];
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

