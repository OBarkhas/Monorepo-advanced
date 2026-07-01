import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
};

export default defineConfig({
  out: './drizzle',
  schema: './src/db/index.ts',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: requireEnv('CLOUDFLARE_ACCOUNT_ID'),
    databaseId: requireEnv('CLOUDFLARE_DATABASE_ID'),
    token: requireEnv('CLOUDFLARE_D1_TOKEN'),
  },
});
