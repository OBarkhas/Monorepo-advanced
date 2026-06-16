import { BaseContext } from '@apollo/server';
import { db } from '../src/config/db';

export interface Context extends BaseContext {
  db: typeof db;
}
