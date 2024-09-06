declare module 'google-api-key-verification' {
    interface ApiInfo {
        title: string;
        name: string;
        id: string;
        discoveryRestUrl: string;
    }

    interface ApiResponse {
        success: ApiInfo[];
        fail: ApiInfo[];
    }

    interface ErrorResponse {
        error: string;
    }

    export function checkApiKeyForTitle(apiKey: string, title: string): Promise<ApiResponse | ErrorResponse>;
    export function checkApiKey(apiKey: string): Promise<ApiResponse | ErrorResponse>;
}
