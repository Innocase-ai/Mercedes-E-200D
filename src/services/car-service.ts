import { base, TABLE_NAME, HISTORY_TABLE_NAME, TASKS_TABLE_NAME, INVOICES_TABLE_NAME } from '@/lib/airtable';
import { MaintenanceTask, ServiceHistory, Expense, MaintenanceRecord, CarDetails } from '@/lib/types';
import { AppError, AppErrorCode, logger } from '@/lib/error-handling';
import { Record } from 'airtable';

// Define the shape of our data
export interface CarData {
    mileage: number;
    history: ServiceHistory;
    details: CarDetails;
}

export class CarService {
    private static getBase() {
        if (!base) {
            throw new AppError(
                AppErrorCode.CONFIG_MISSING,
                "Airtable base not initialized. Check server logs.",
                500,
                { component: 'CarService' }
            );
        }
        return base;
    }

    /**
     * Fetches all maintenance tasks from Airtable.
     * @returns Array of MaintenanceTask
     */
    static async getMaintenanceTasks(): Promise<MaintenanceTask[]> {
        try {
            const records = await this.getBase()(TASKS_TABLE_NAME).select().all();

            if (records.length === 0) {
                logger.warn("Table is empty, returning temporary debug task", { table: TASKS_TABLE_NAME });
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
            logger.error(`Error fetching tasks`, error, { component: 'CarService' });
            throw AppError.fromError(error, AppErrorCode.INTERNAL_ERROR);
        }
    }

    /**
     * Fetches core car data (mileage, history, details).
     * @returns CarData or null if not found
     */
    static async getCarData(): Promise<CarData | null> {
        try {
            // Parallel fetch for performance
            const [vehicleRecords, historyRecords] = await Promise.all([
                this.getBase()(TABLE_NAME).select({ maxRecords: 1 }).firstPage(),
                this.getBase()(HISTORY_TABLE_NAME).select().all()
            ]);

            const record = vehicleRecords[0];
            if (!record) return null;

            const mileage = (record.get('Kilometrage Actuel') as number) || 0;
            const details: CarDetails = {
                mma: (record.get('MMA') as number) || 2320,
                puissanceFiscale: (record.get('Puissance Fiscale') as number) || 10,
                nextTechnicalInspection: (record.get('Prochain CT') as string) || '2026-12-26',
                tireSize: (record.get('Taille Pneus') as string) || '',
                tireBrand: (record.get('Marque Pneus') as string) || '',
                tirePrice: (record.get('Prix Pneus') as number) || 0,
                oilType: (record.get('Type Huile') as string) || '',
                oilBrand: (record.get('Marque Huile') as string) || '',
                oilPrice: (record.get('Prix Huile') as number) || 0,
                notes: (record.get('Notes') as string) || '',
            };

            const history: ServiceHistory = {};
            historyRecords.forEach(r => {
                const taskId = r.get('TacheID') as string;
                const km = r.get('Kilometrage Realise') as number;
                if (taskId && km) {
                    if (!history[taskId] || km > history[taskId]) {
                        history[taskId] = km;
                    }
                }
            });

            return { mileage, history, details };
        } catch (error) {
            logger.error("Error fetching car data", error, { component: 'CarService' });
            throw AppError.fromError(error, AppErrorCode.INTERNAL_ERROR);
        }
    }

    /**
     * Updates car mileage/details and syncs new history records.
     */
    static async updateCarData(mileage: number, history: ServiceHistory, details?: CarDetails): Promise<void> {
        try {
            const vehicleRecords = await this.getBase()(TABLE_NAME).select({ maxRecords: 1 }).firstPage();

            const updateFields: any = { 'Kilometrage Actuel': mileage };
            if (details) {
                Object.assign(updateFields, {
                    'MMA': details.mma,
                    'Puissance Fiscale': details.puissanceFiscale,
                    'Prochain CT': details.nextTechnicalInspection,
                    'Taille Pneus': details.tireSize,
                    'Marque Pneus': details.tireBrand,
                    'Prix Pneus': details.tirePrice,
                    'Type Huile': details.oilType,
                    'Marque Huile': details.oilBrand,
                    'Prix Huile': details.oilPrice,
                    'Notes': details.notes,
                });
            }

            if (vehicleRecords.length === 0) {
                await this.getBase()(TABLE_NAME).create([{ fields: updateFields }]);
            } else {
                const currentRecord = vehicleRecords[0];
                if (this.needsUpdate(currentRecord, updateFields)) {
                    await this.getBase()(TABLE_NAME).update(currentRecord.id, updateFields);
                }
            }

            await this.syncHistory(history);

        } catch (error) {
            logger.error("Error updating car data", error, { component: 'CarService' });
            throw AppError.fromError(error, AppErrorCode.INTERNAL_ERROR);
        }
    }

    /**
     * Creates a new structured invoice record.
     */
    static async createInvoice(data: any): Promise<void> {
        try {
            const fields = {
                'Analyse': data.analysis,
                'Date Analyse': new Date().toISOString().split('T')[0],
                'Date': data.date || '',
                'Montant': data.amount || 0,
                'Libelle': data.label || 'Facture',
                'Type': data.type || 'Autre',
                'Conforme': data.isConform ? 'OUI' : 'NON'
            };
            await this.getBase()(INVOICES_TABLE_NAME).create([{ fields }]);
        } catch (error) {
            logger.error("Error creating invoice", error, { component: 'CarService' });
            // Failsafe creation? Logic copied from original but simplified
            try {
                await this.getBase()(INVOICES_TABLE_NAME).create([{
                    fields: {
                        'Analyse': `[FAILSAFE] ${data.analysis}\n\nStructured Data: ${JSON.stringify(data)}`,
                        'Date Analyse': new Date().toISOString().split('T')[0]
                    }
                }]);
            } catch (inner) {
                throw new AppError(AppErrorCode.INTERNAL_ERROR, "Failed to save invoice even in fallback mode");
            }
        }
    }

    static async getExpenses(): Promise<Expense[]> {
        try {
            const records = await this.getBase()(INVOICES_TABLE_NAME).select({
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
            logger.error("Error fetching expenses", error, { component: 'CarService' });
            throw AppError.fromError(error, AppErrorCode.INTERNAL_ERROR);
        }
    }

    static async getMaintenanceHistory(): Promise<MaintenanceRecord[]> {
        try {
            const [historyRecords, taskRecords] = await Promise.all([
                this.getBase()(HISTORY_TABLE_NAME).select({
                    sort: [{ field: 'Kilometrage Realise', direction: 'desc' }]
                }).all(),
                this.getMaintenanceTasks()
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
            logger.error("Error fetching maintenance history", error, { component: 'CarService' });
            throw AppError.fromError(error, AppErrorCode.INTERNAL_ERROR);
        }
    }

    private static needsUpdate(record: any, newFields: any): boolean {
        // Simplified diff logic to reduce Airtable calls
        // Mapping from Airtable Field Name -> Value matching is implicit in newFields
        for (const [key, value] of Object.entries(newFields)) {
            if (record.get(key) !== value) return true;
        }
        return false;
    }

    private static async syncHistory(history: ServiceHistory): Promise<void> {
        const existingHistory = await this.getBase()(HISTORY_TABLE_NAME).select().all();

        const creations = [];
        for (const [taskId, km] of Object.entries(history)) {
            const exists = existingHistory.some(r =>
                r.get('TacheID') === taskId &&
                r.get('Kilometrage Realise') === km
            );

            if (!exists) {
                creations.push({
                    fields: {
                        'TacheID': taskId,
                        'Kilometrage Realise': km
                    }
                });
            }
        }

        if (creations.length > 0) {
            // Batch create (Airtable allows up to 10 per request, simple loop for now provided load is low)
            // Splitting into chunks of 10 if necessary is better usage, but for now strict 1-by-1 or small batch
            for (const batch of this.chunk(creations, 10)) {
                await this.getBase()(HISTORY_TABLE_NAME).create(batch);
            }
        }
    }

    private static chunk<T>(array: T[], size: number): T[][] {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}
