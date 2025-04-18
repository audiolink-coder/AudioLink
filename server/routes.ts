import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertBotSettingsSchema, insertLogEntrySchema } from "@shared/schema";
import { setupBot } from "./bot";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize and setup the Discord bot
  const bot = await setupBot(storage);

  // API route to get bot status
  app.get("/api/bot/status", async (req, res) => {
    try {
      const settings = await storage.getBotSettings();
      res.json({ isActive: settings.isActive });
    } catch (error) {
      res.status(500).json({ message: "Failed to get bot status" });
    }
  });

  // API route to update bot status
  app.post("/api/bot/status", async (req, res) => {
    try {
      const validatedData = insertBotSettingsSchema.parse(req.body);
      const settings = await storage.updateBotSettings(validatedData);
      
      // Update bot state
      if (validatedData.isActive) {
        await bot.activate();
      } else {
        await bot.deactivate();
      }
      
      res.json({ isActive: settings.isActive });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update bot status" });
    }
  });

  // API route to get activity log entries
  app.get("/api/log", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const entries = await storage.getLogEntries(limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get log entries" });
    }
  });

  // API route to clear activity log
  app.delete("/api/log", async (req, res) => {
    try {
      await storage.clearLogEntries();
      res.json({ message: "Log cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear log" });
    }
  });

  // API route to manually activate the bot
  app.post("/api/bot/activate", async (req, res) => {
    try {
      await bot.activate();
      const settings = await storage.updateBotSettings({ isActive: true });
      res.json({ isActive: settings.isActive });
    } catch (error) {
      res.status(500).json({ message: "Failed to activate bot" });
    }
  });

  // API route to manually deactivate the bot
  app.post("/api/bot/deactivate", async (req, res) => {
    try {
      await bot.deactivate();
      const settings = await storage.updateBotSettings({ isActive: false });
      res.json({ isActive: settings.isActive });
    } catch (error) {
      res.status(500).json({ message: "Failed to deactivate bot" });
    }
  });

  return httpServer;
}
