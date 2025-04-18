import { LogEntryTypeValue } from "@shared/schema";

export interface LogEntry {
  id: number;
  timestamp: string | Date;
  type: LogEntryTypeValue;
  message: string;
  channelId?: string;
  userId?: string;
  fileName?: string;
  fileSize?: number;
  downloadUrl?: string;
}

export interface BotSettings {
  id: number;
  isActive: boolean;
  lastUpdated: string | Date;
}
