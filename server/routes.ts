import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertCategorySchema, insertExpenseSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    store: new MemoryStoreSession({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      req.session.userId = user.id;
      
      res.json({ user: { id: user.id, email: user.email, fullName: user.fullName } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.verifyPassword(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ user: { id: user.id, email: user.email, fullName: user.fullName } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user: { id: user.id, email: user.email, fullName: user.fullName } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Category routes
  app.get("/api/categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getCategories(req.session.userId!);
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/categories", requireAuth, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCategorySchema.partial().parse(req.body);
      
      const category = await storage.updateCategory(id, req.session.userId!, updates);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(id, req.session.userId!);
      
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json({ message: "Category deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Expense routes
  app.get("/api/expenses", requireAuth, async (req, res) => {
    try {
      const filters = {
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        search: req.query.search as string,
      };

      const expenses = await storage.getExpenses(req.session.userId!, filters);
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/expenses", requireAuth, async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/expenses/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertExpenseSchema.partial().parse(req.body);
      
      const expense = await storage.updateExpense(id, req.session.userId!, updates);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/expenses/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteExpense(id, req.session.userId!);
      
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json({ message: "Expense deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getExpenseStats(req.session.userId!);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add default categories for users who don't have any
  app.post("/api/categories/default", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getCategories(req.session.userId!);
      if (categories.length === 0) {
        const defaultCategories = [
          { name: "Food & Dining", icon: "utensils", color: "#EF4444" },
          { name: "Transportation", icon: "car", color: "#3B82F6" },
          { name: "Shopping", icon: "shopping-bag", color: "#8B5CF6" },
          { name: "Entertainment", icon: "film", color: "#F59E0B" },
          { name: "Bills & Utilities", icon: "receipt", color: "#10B981" },
          { name: "Healthcare", icon: "heart-pulse", color: "#EC4899" },
        ];

        for (const cat of defaultCategories) {
          await storage.createCategory({
            userId: req.session.userId!,
            ...cat
          });
        }
        res.json({ message: "Default categories created" });
      } else {
        res.json({ message: "Categories already exist" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
