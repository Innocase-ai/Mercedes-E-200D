'use server';

import { CarService, CarData } from '@/services/car-service';
import { MaintenanceTask, ServiceHistory, Expense, MaintenanceRecord, CarDetails } from '@/lib/types';
import { AppError, AppErrorCode, logger } from '@/lib/error-handling';
import { z } from 'zod';

// --- Validation Schemas ---
const MileageSchema = z.number().min(0).max(1000000);
const HistorySchema = z.record(z.string(), z.number().min(0));
const CarDetailsSchema = z.object({
    mma: z.number(),
    puissanceFiscale: z.number(),
    nextTechnicalInspection: z.string(),
    tireSize: z.string().optional(),
    tireBrand: z.string().optional(),
    tirePrice: z.number().optional(),
    oilType: z.string().optional(),
    oilBrand: z.string().optional(),
    oilPrice: z.number().optional(),
    notes: z.string().optional()
}).optional();

// --- Server Actions ---

/**
 * Fetches all available maintenance tasks.
 */
export async function fetchMaintenanceTasks(): Promise<MaintenanceTask[]> {
    try {
        return await CarService.getMaintenanceTasks();
    } catch (error) {
        logger.error("Controller Error: fetchMaintenanceTasks", error);
        return []; // Fail safe for UI
    }
}

/**
 * Fetches current car status (mileage, history, details).
 */
export async function fetchCarData(): Promise<CarData | null> {
    try {
        return await CarService.getCarData();
    } catch (error) {
        logger.error("Controller Error: fetchCarData", error);
        return null;
    }
}

/**
 * Updates car data (mileage, history, details).
 * Handles validation and business logic orchestration.
 */
export async function saveCarData(
    mileage: number,
    history: ServiceHistory,
    details?: CarDetails
): Promise<{ success: boolean; error?: string }> {
    try {
        // 1. Validation Layer
        MileageSchema.parse(mileage);
        HistorySchema.parse(history);
        if (details) CarDetailsSchema.parse(details);

        // 2. Service Call
        await CarService.updateCarData(mileage, history, details);

        return { success: true };

    } catch (error: any) {
        // 3. Error Handling Layer
        if (error instanceof z.ZodError) {
            logger.warn("Validation Error in saveCarData", { issues: error.issues });
            return { success: false, error: "Données invalides (vérifiez les champs)." };
        }

        logger.error("Controller Error: saveCarData", error);

        if (error instanceof AppError) {
            return { success: false, error: error.message }; // User-friendly message from AppError
        }

        return { success: false, error: "Erreur serveur lors de la sauvegarde." };
    }
}

/**
 * Saves a new invoice/expense.
 */
export async function saveInvoice(data: any): Promise<boolean> {
    try {
        // Basic validation implicit in Service, could be enhanced here with Zod
        await CarService.createInvoice(data);
        return true;
    } catch (error) {
        logger.error("Controller Error: saveInvoice", error);
        return false;
    }
}

/**
 * Fetches all expenses/invoices.
 */
export async function fetchExpenses(): Promise<Expense[]> {
    try {
        return await CarService.getExpenses();
    } catch (error) {
        logger.error("Controller Error: fetchExpenses", error);
        return [];
    }
}

/**
 * Fetches combined maintenance history with task details.
 */
export async function fetchMaintenanceHistory(): Promise<MaintenanceRecord[]> {
    try {
        return await CarService.getMaintenanceHistory();
    } catch (error) {
        logger.error("Controller Error: fetchMaintenanceHistory", error);
        return [];
    }
}
