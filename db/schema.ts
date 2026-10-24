import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const cases = sqliteTable('cases', { id: text('id').primaryKey(), body: text('body').notNull(), status: text('status').notNull().default('Waiting'), created: integer('created').notNull() });
export const events = sqliteTable('events', { seq: integer('seq').primaryKey({autoIncrement:true}), id: text('id').notNull().unique(), caseId: text('case_id').notNull(), kind: text('kind').notNull(), role: text('role').notNull(), body: text('body').notNull(), created: integer('created').notNull() });
