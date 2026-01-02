import Airtable from 'airtable';

export const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
export const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

export const TABLE_NAME = 'Vehicules';
export const HISTORY_TABLE_NAME = 'HistoriqueEntretiens';
export const INVOICES_TABLE_NAME = 'Factures';
export const TASKS_TABLE_NAME = 'TachesMaintenance';

let base: Airtable.Base | null = null;

if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
    base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
}

export { base };
