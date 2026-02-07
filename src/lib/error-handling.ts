/**
 * @fileOverview Centralized error handling and structured logging for the application.
 * Designed for Google Cloud Run compatibility (JSON logs).
 */

// 1. Codes d'erreurs énumérés (Source de vérité stable)
export enum AppErrorCode {
    INVALID_INPUT = 'INVALID_INPUT',
    AUTH_REQUIRED = 'AUTH_REQUIRED',
    AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
    AI_TIMEOUT = 'AI_TIMEOUT',
    CONFIG_MISSING = 'CONFIG_MISSING',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// 2. Classe d'erreur de base unifiée
export class AppError extends Error {
    public readonly name = 'AppError';

    constructor(
        public readonly code: AppErrorCode,
        public readonly message: string,
        public readonly statusCode: number = 500,
        public readonly context?: Record<string, any>
    ) {
        super(message);
        // Maintain proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }

    // Helper pour convertir une erreur inconnue en AppError
    static fromError(error: unknown, defaultCode: AppErrorCode = AppErrorCode.INTERNAL_ERROR): AppError {
        if (error instanceof AppError) {
            return error;
        }
        const message = error instanceof Error ? error.message : String(error);
        return new AppError(defaultCode, message, 500, { originalError: error });
    }
}

// 3. Logger Structuré (JSON logs pour Cloud Run)
const isProd = process.env.NODE_ENV === 'production';

export const logger = {
    error: (message: string, error?: unknown, context?: Record<string, any>) => {
        const errorObj = error instanceof Error ? error : (error ? new Error(String(error)) : undefined);

        const payload = {
            severity: 'ERROR',
            message: message,
            error_code: error instanceof AppError ? error.code : 'UNKNOWN',
            stack_trace: errorObj?.stack,
            context: {
                ...context,
                ...(error instanceof AppError ? error.context : {}),
            },
            timestamp: new Date().toISOString(),
        };
        console.error(JSON.stringify(payload));
    },

    warn: (message: string, context?: Record<string, any>) => {
        const payload = {
            severity: 'WARNING',
            message: message,
            context,
            timestamp: new Date().toISOString(),
        };
        console.warn(JSON.stringify(payload));
    },

    info: (message: string, context?: Record<string, any>) => {
        const payload = {
            severity: 'INFO',
            message: message,
            context,
            timestamp: new Date().toISOString(),
        };
        console.log(JSON.stringify(payload));
    },

    debug: (message: string, context?: Record<string, any>) => {
        // En prod, on peut vouloir filtrer les logs debug pour réduire le bruit/coût
        // Pour l'instant on les laisse pour faciliter le diagnostic post-déploiement
        const payload = {
            severity: 'DEBUG',
            message: message,
            context,
            timestamp: new Date().toISOString(),
        };
        console.log(JSON.stringify(payload));
    }
};
