import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const weatherCache = sqliteTable('weather_cache', {
  centreId: text('centre_id').primaryKey(),
  data: text('data').notNull(),
  fetchedAt: integer('fetched_at').notNull(),
});
