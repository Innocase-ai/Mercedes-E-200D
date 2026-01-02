import Airtable from 'airtable';

export const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
export const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

export const TABLE_NAME = 'CarStatus';

let base: Airtable.Base | null = null;

if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
    base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
}

export { base };
