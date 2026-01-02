const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const Airtable = require('airtable');

const baseId = process.env.AIRTABLE_BASE_ID;
const apiKey = process.env.AIRTABLE_API_KEY;
const base = new Airtable({ apiKey }).base(baseId);

const TASKS_TABLE = 'TachesMaintenance';
const HISTORY_TABLE = 'HistoriqueEntretiens';
const INVOICES_TABLE = 'Factures';

async function testFullSync() {
    console.log('--- STARTING FULL SYNC TEST ---');

    // 1. Test Fetching Tasks
    console.log(`\n1. Fetching Tasks from '${TASKS_TABLE}'...`);
    try {
        const tasks = await base(TASKS_TABLE).select().all();
        console.log(`✅ Fetched ${tasks.length} tasks.`);
        if (tasks.length > 0) {
            console.log('Sample Task:', tasks[0].get('Nom'));
        }
    } catch (e) {
        console.error('❌ Failed to fetch tasks:', e.message);
    }

    // 2. Test Saving History
    console.log(`\n2. Testing History Save to '${HISTORY_TABLE}'...`);
    const testTaskId = 'TEST_TASK_' + Date.now();
    const testKm = 12345;
    let historyRecordId = null;

    try {
        const created = await base(HISTORY_TABLE).create([{
            fields: {
                'TacheID': testTaskId,
                'Kilometrage Realise': testKm
            }
        }]);
        historyRecordId = created[0].id;
        console.log('✅ Created test history record:', historyRecordId);

        // Verify read back
        const records = await base(HISTORY_TABLE).select({
            filterByFormula: `{TacheID} = '${testTaskId}'`
        }).all();

        if (records.length === 1 && records[0].get('Kilometrage Realise') === testKm) {
            console.log('✅ Verified record existence and data.');
        } else {
            console.error('❌ Verification failed: Record not found or incorrect data.');
        }

    } catch (e) {
        console.error('❌ Failed to save history:', e.message);
    }

    // 3. Test Saving Invoice
    console.log(`\n3. Testing Invoice Save to '${INVOICES_TABLE}'...`);
    let invoiceRecordId = null;
    try {
        const created = await base(INVOICES_TABLE).create([{
            fields: {
                'Analyse': 'Test Analysis Full Sync',
                'Date Analyse': new Date().toISOString().split('T')[0]
            }
        }]);
        invoiceRecordId = created[0].id;
        console.log('✅ Created test invoice record:', invoiceRecordId);
    } catch (e) {
        console.error('❌ Failed to save invoice:', e.message);
    }

    // Cleanup
    console.log('\n--- CLEANUP ---');
    if (historyRecordId) {
        try {
            await base(HISTORY_TABLE).destroy([historyRecordId]);
            console.log('✅ Cleaned up history record.');
        } catch (e) { console.error('Failed cleanup history', e); }
    }
    if (invoiceRecordId) {
        try {
            await base(INVOICES_TABLE).destroy([invoiceRecordId]);
            console.log('✅ Cleaned up invoice record.');
        } catch (e) { console.error('Failed cleanup invoice', e); }
    }

    console.log('\n--- TEST COMPLETE ---');
}

testFullSync();
