function GetEnv<T extends string>(key: string, required: true): T;
function GetEnv<T extends string>(key: string, required: false): string | undefined;
function GetEnv<T extends string>(key: string, required: boolean): T | undefined {
    const value = process.env[key] as T | undefined;
    const isClient = typeof window !== 'undefined';
    const isPublic = key.startsWith('NEXT_PUBLIC_');

    if (value) {
        return value;
    }
    if (required && isClient && isPublic) {
        throw new Error(`Environment variable ${key} is required: ${value}`);
    }
    return value as T | undefined;
}

function CheckEnv(key: string, value?: string) {
    if (!value) {
        throw new Error(`Environment variable ${key} is required`);
    }
    return value;
}

interface ConfigType {
    NEXT_PUBLIC_API_URL: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    NEXTAUTH_SECRET: string;
    AUTH_REDIRECT_URI: string;
    AUTH_FIREBASE_API_KEY: string;
    AUTH_FIREBASE_MESSAGING_SENDER_ID: string;
    AUTH_FIREBASE_APP_ID: string;
    AUTH_FIREBASE_AUTH_DOMAIN: string;
    AUTH_FIREBASE_PROJECT_ID: string;
    AUTH_FIREBASE_STORAGE_BUCKET: string;
    AUTH_FIREBASE_MEASUREMENT_ID: string;
    FRONTEND_DOMAIN: string;
    WITH_AUTH: boolean;
    OPENAI_API_KEY: string;
    ANTHROPIC_API_KEY: string;
    DEEPSEEK_API_KEY: string;
    LANGFUSE_SECRET_KEY: string;
    LANGFUSE_PUBLIC_KEY: string;
    LANGFUSE_BASEURL: string;
    NEXT_PUBLIC_DUMMY_ADS: boolean;
    NEXT_PUBLIC_ADMOB_BANNER_ID: string;
    NODE_ENV: string;
    SLACK_WEBHOOK_URL: string;
    FIRECRAWL_API_KEY: string;
    TAVILY_API_KEY: string;
}

const config: ConfigType = {
    NEXT_PUBLIC_API_URL: CheckEnv('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL),
    GOOGLE_CLIENT_ID: GetEnv('GOOGLE_CLIENT_ID', true),
    GOOGLE_CLIENT_SECRET: GetEnv('GOOGLE_CLIENT_SECRET', true),
    NEXTAUTH_SECRET: GetEnv('NEXTAUTH_SECRET', false) || '',
    AUTH_REDIRECT_URI: GetEnv('AUTH_REDIRECT_URI', false) || '',
    AUTH_FIREBASE_API_KEY: GetEnv('AUTH_FIREBASE_API_KEY', false) || '',
    AUTH_FIREBASE_MESSAGING_SENDER_ID: GetEnv('AUTH_FIREBASE_MESSAGING_SENDER_ID', false) || '',
    AUTH_FIREBASE_APP_ID: GetEnv('AUTH_FIREBASE_APP_ID', false) || '',
    AUTH_FIREBASE_AUTH_DOMAIN: GetEnv('AUTH_FIREBASE_AUTH_DOMAIN', false) || '',
    AUTH_FIREBASE_PROJECT_ID: GetEnv('AUTH_FIREBASE_PROJECT_ID', false) || '',
    AUTH_FIREBASE_STORAGE_BUCKET: GetEnv('AUTH_FIREBASE_STORAGE_BUCKET', false) || '',
    AUTH_FIREBASE_MEASUREMENT_ID: GetEnv('AUTH_FIREBASE_MEASUREMENT_ID', false) || '',
    FRONTEND_DOMAIN: GetEnv('FRONTEND_DOMAIN', true),
    WITH_AUTH: GetEnv('WITH_AUTH', true) === 'true',
    OPENAI_API_KEY: GetEnv('OPENAI_API_KEY', true),
    ANTHROPIC_API_KEY: GetEnv('ANTHROPIC_API_KEY', true),
    DEEPSEEK_API_KEY: GetEnv('DEEPSEEK_API_KEY', true),
    LANGFUSE_SECRET_KEY: GetEnv('LANGFUSE_SECRET_KEY', true),
    LANGFUSE_PUBLIC_KEY: GetEnv('LANGFUSE_PUBLIC_KEY', true),
    LANGFUSE_BASEURL: GetEnv('LANGFUSE_BASEURL', true),
    NEXT_PUBLIC_DUMMY_ADS: CheckEnv('NEXT_PUBLIC_DUMMY_ADS', process.env.NEXT_PUBLIC_DUMMY_ADS) === 'true',
    NEXT_PUBLIC_ADMOB_BANNER_ID: CheckEnv('NEXT_PUBLIC_ADMOB_BANNER_ID', process.env.NEXT_PUBLIC_ADMOB_BANNER_ID),
    NODE_ENV: CheckEnv('NODE_ENV', process.env.NODE_ENV),
    SLACK_WEBHOOK_URL: GetEnv('SLACK_WEBHOOK_URL', true),
    FIRECRAWL_API_KEY: GetEnv('FIRECRAWL_API_KEY', true),
    TAVILY_API_KEY: GetEnv('TAVILY_API_KEY', true),
};

export const Config = ((): ConfigType => {
    return config;
})();