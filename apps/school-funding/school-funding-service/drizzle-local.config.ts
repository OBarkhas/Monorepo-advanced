import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/index.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/a5ba4da271942441121129b5a32a39b4e211951d05860c76dc78a576d4768983.sqlite',
  },
});
