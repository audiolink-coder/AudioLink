import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Bot status model
export const botSettings = pgTable("botSettings", {
  id: serial("id").primaryKey(),
  isActive: boolean("isActive").notNull().default(false),
  lastUpdated: timestamp("lastUpdated").notNull().defaultNow(),
});

export const insertBotSettingsSchema = createInsertSchema(botSettings).pick({
  isActive: true,
});

// Activity log model
export const logEntries = pgTable("logEntries", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  type: text("type").notNull(), // BOT_ACTION, DETECTED, ERROR
  message: text("message").notNull(),
  channelId: text("channelId"),
  userId: text("userId"),
  fileName: text("fileName"),
  fileSize: integer("fileSize"),
  downloadUrl: text("downloadUrl"),
});

export const insertLogEntrySchema = createInsertSchema(logEntries).pick({
  type: true,
  message: true,
  channelId: true,
  userId: true,
  fileName: true,
  fileSize: true,
  downloadUrl: true,
});

// Type definitions
export type BotSettings = typeof botSettings.$inferSelect;
export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;

export type LogEntry = typeof logEntries.$inferSelect;
export type InsertLogEntry = z.infer<typeof insertLogEntrySchema>;

// Define log entry types for type safety
export const LogEntryType = {
  BOT_ACTION: "BOT_ACTION",
  DETECTED: "DETECTED",
  ERROR: "ERROR",
} as const;

export type LogEntryTypeValue = (typeof LogEntryType)[keyof typeof LogEntryType];

// Audio formats supported by the bot
export const SUPPORTED_AUDIO_FORMATS = [
  ".mp3",
  ".wav",
  ".ogg",
  ".m4a",
  ".flac",
  ".aac",
  ".aiff",
  ".wma",
];
