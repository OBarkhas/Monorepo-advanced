import { drizzle } from 'drizzle-orm/d1';

import * as schema from '../db';

export const drizzleProvider = (d1: D1Database) => {
  return drizzle(d1, { schema });
};
