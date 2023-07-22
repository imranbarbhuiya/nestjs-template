declare namespace NodeJS {
	interface ProcessEnv {
		readonly API_URL: string;
		readonly CLOUDFLARE_TOKEN: string;
		readonly DASHBOARD_CALLBACK_URL: string;
		readonly DASHBOARD_CLIENT_ID: string;
		readonly DASHBOARD_CLIENT_SECRET: string;
		readonly DB_URI: string;
		readonly DEV_DB_URI: string;
		readonly DISABLE_SWAGGER: 'false' | 'true';
		readonly IP_API_KEY: string;
		readonly MAIN_URL: string;
		readonly NODE_ENV: 'development' | 'production' | 'test';
		readonly PORT: string;
		readonly PROFILE_DB_URI: string;
		readonly S3_ACCESS_KEY_ID: string;
		readonly S3_SECRET_ACCESS_KEY: string;
		readonly TOPGG_TOKEN: string;
	}
}
