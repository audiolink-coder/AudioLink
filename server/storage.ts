import { 
  BotSettings, 
  LogEntry, 
  InsertBotSettings, 
  InsertLogEntry, 
  LogEntryType,
  LogEntryTypeValue
} from "@shared/schema";

export interface IStorage {
  // Bot Settings
  getBotSettings(): Promise<BotSettings>;
  updateBotSettings(settings: InsertBotSettings): Promise<BotSettings>;
  
  // Activity Log
  addLogEntry(entry: InsertLogEntry): Promise<LogEntry>;
  getLogEntries(limit?: number): Promise<LogEntry[]>;
  clearLogEntries(): Promise<void>;
}

export class MemStorage implements IStorage {
  private botSettings: BotSettings;
  private logEntries: LogEntry[];
  private currentLogId: number;

  constructor() {
    // Initialize with default settings
    this.botSettings = {
      id: 1,
      isActive: false,
      lastUpdated: new Date(),
    };
    
    this.logEntries = [];
    this.currentLogId = 1;
  }

  async getBotSettings(): Promise<BotSettings> {
    return { ...this.botSettings };
  }

  async updateBotSettings(settings: InsertBotSettings): Promise<BotSettings> {
    this.botSettings = {
      ...this.botSettings,
      ...settings,
      lastUpdated: new Date(),
    };
    
    return { ...this.botSettings };
  }

  async addLogEntry(entry: InsertLogEntry): Promise<LogEntry> {
    const newEntry: LogEntry = {
      id: this.currentLogId++,
      timestamp: new Date(),
      ...entry,
    };
    
    this.logEntries.unshift(newEntry); // Add to the beginning of the array
    
    // Keep only the most recent 100 entries to prevent memory overflow
    if (this.logEntries.length > 100) {
      this.logEntries = this.logEntries.slice(0, 100);
    }
    
    return newEntry;
  }

  async getLogEntries(limit = 50): Promise<LogEntry[]> {
    return this.logEntries.slice(0, limit);
  }

  async clearLogEntries(): Promise<void> {
    this.logEntries = [];
  }
}

export const storage = new MemStorage();
