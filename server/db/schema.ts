import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const weatherCache = sqliteTable('weather_cache', {
  centreId: text('centre_id').primaryKey(),
  data: text('data').notNull(),
  fetchedAt: integer('fetched_at').notNull(),
});

export const geologyCache = sqliteTable('geology_cache', {
  centreId: text('centre_id').primaryKey(),
  drainageFactor: real('drainage_factor').notNull(),
  rockDescription: text('rock_description').notNull(),
  fetchedAt: integer('fetched_at').notNull(),
});
