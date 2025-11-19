const isDevelopment = process.env.NODE_ENV === 'development';

export const log = {
    info: (message: string, data?: object | string | number | boolean) => {
        if (isDevelopment) {
            console.log(`INFO: ${message}`, data);
        }
    },
    error: async (message: string, error?: Error | string | object) => {
        if (isDevelopment) {
            console.error(`ERROR: ${message}`, error);
        }

        if (!isDevelopment) {
            try {
                const errorDetails = error instanceof Error ? {
                    message: error.message,
                } : {
                    message: typeof error === 'string' ? error : JSON.stringify(error),
                };

                await fetch('http://localhost:5000/api/logs/frontend', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        url: window.location.href,
                        error: errorDetails
                    })
                });
            }
            catch (logError) {
                console.error("Failed to log error to backend:", logError);
            }
        }
    }
}
