import { fetchMaintenanceHistory, fetchExpenses } from "@/actions/car-data";
import HistoryClient from "@/components/dashboard/HistoryClient";

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
    const [history, expenses] = await Promise.all([
        fetchMaintenanceHistory(),
        fetchExpenses()
    ]);

    return (
        <HistoryClient
            initialHistory={history}
            initialExpenses={expenses}
        />
    );
}
