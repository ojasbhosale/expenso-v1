import { users, categories, expenses, type User, type InsertUser, type Category, type InsertCategory, type Expense, type InsertExpense, type ExpenseWithCategory, type CategoryWithStats } from "@shared/schema";
import { hash, compare } from "bcryptjs";

export interface IStorage {
  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  verifyPassword(email: string, password: string): Promise<User | null>;

  // Category methods
  getCategories(userId: number): Promise<CategoryWithStats[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, userId: number, updates: Partial<InsertCategory>): Promise<Category | null>;
  deleteCategory(id: number, userId: number): Promise<boolean>;

  // Expense methods
  getExpenses(userId: number, filters?: { categoryId?: number; startDate?: string; endDate?: string; search?: string }): Promise<ExpenseWithCategory[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, userId: number, updates: Partial<InsertExpense>): Promise<Expense | null>;
  deleteExpense(id: number, userId: number): Promise<boolean>;
  getExpenseStats(userId: number): Promise<{
    totalExpenses: number;
    weeklyExpenses: number;
    categoriesCount: number;
    dailyAverage: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private expenses: Map<number, Expense>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentExpenseId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.expenses = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentExpenseId = 1;

    // Add default user for testing
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create default user
    const defaultUser = await this.createUser({
      email: "demo@example.com",
      password: "password",
      fullName: "Demo User"
    });

    // Create default categories
    const defaultCategories = [
      { name: "Food & Dining", icon: "utensils", color: "#EF4444" },
      { name: "Transportation", icon: "car", color: "#3B82F6" },
      { name: "Shopping", icon: "shopping-bag", color: "#8B5CF6" },
      { name: "Entertainment", icon: "film", color: "#F59E0B" },
      { name: "Bills & Utilities", icon: "receipt", color: "#10B981" },
      { name: "Healthcare", icon: "heart-pulse", color: "#EC4899" },
    ];

    for (const cat of defaultCategories) {
      await this.createCategory({
        userId: defaultUser.id,
        ...cat
      });
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await hash(insertUser.password, 10);
    const user: User = {
      id: this.currentUserId++,
      email: insertUser.email,
      password: hashedPassword,
      fullName: insertUser.fullName,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await compare(password, user.password);
    return isValid ? user : null;
  }

  async getCategories(userId: number): Promise<CategoryWithStats[]> {
    const userCategories = Array.from(this.categories.values())
      .filter(cat => cat.userId === userId);

    return userCategories.map(category => {
      const categoryExpenses = Array.from(this.expenses.values())
        .filter(exp => exp.userId === userId && exp.categoryId === category.id);
      
      const totalAmount = categoryExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      
      return {
        ...category,
        expenseCount: categoryExpenses.length,
        totalAmount,
      };
    });
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = {
      id: this.currentCategoryId++,
      ...insertCategory,
      createdAt: new Date(),
    };
    this.categories.set(category.id, category);
    return category;
  }

  async updateCategory(id: number, userId: number, updates: Partial<InsertCategory>): Promise<Category | null> {
    const category = this.categories.get(id);
    if (!category || category.userId !== userId) return null;

    const updatedCategory = { ...category, ...updates };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number, userId: number): Promise<boolean> {
    const category = this.categories.get(id);
    if (!category || category.userId !== userId) return false;

    // Set all expenses with this category to null
    Array.from(this.expenses.values())
      .filter(exp => exp.categoryId === id)
      .forEach(exp => {
        this.expenses.set(exp.id, { ...exp, categoryId: null });
      });

    return this.categories.delete(id);
  }

  async getExpenses(
    userId: number, 
    filters?: { categoryId?: number; startDate?: string; endDate?: string; search?: string }
  ): Promise<ExpenseWithCategory[]> {
    let userExpenses = Array.from(this.expenses.values())
      .filter(exp => exp.userId === userId);

    if (filters) {
      if (filters.categoryId) {
        userExpenses = userExpenses.filter(exp => exp.categoryId === filters.categoryId);
      }
      if (filters.startDate) {
        userExpenses = userExpenses.filter(exp => exp.date >= filters.startDate!);
      }
      if (filters.endDate) {
        userExpenses = userExpenses.filter(exp => exp.date <= filters.endDate!);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        userExpenses = userExpenses.filter(exp => 
          exp.title.toLowerCase().includes(searchLower) ||
          exp.description?.toLowerCase().includes(searchLower)
        );
      }
    }

    // Sort by date (newest first)
    userExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return userExpenses.map(expense => ({
      ...expense,
      category: expense.categoryId ? this.categories.get(expense.categoryId) : undefined,
    }));
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const expense: Expense = {
      id: this.currentExpenseId++,
      ...insertExpense,
      createdAt: new Date(),
    };
    this.expenses.set(expense.id, expense);
    return expense;
  }

  async updateExpense(id: number, userId: number, updates: Partial<InsertExpense>): Promise<Expense | null> {
    const expense = this.expenses.get(id);
    if (!expense || expense.userId !== userId) return null;

    const updatedExpense = { ...expense, ...updates };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: number, userId: number): Promise<boolean> {
    const expense = this.expenses.get(id);
    if (!expense || expense.userId !== userId) return false;

    return this.expenses.delete(id);
  }

  async getExpenseStats(userId: number): Promise<{
    totalExpenses: number;
    weeklyExpenses: number;
    categoriesCount: number;
    dailyAverage: number;
  }> {
    const userExpenses = Array.from(this.expenses.values())
      .filter(exp => exp.userId === userId);

    const totalExpenses = userExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    // Calculate weekly expenses (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyExpenses = userExpenses
      .filter(exp => new Date(exp.date) >= oneWeekAgo)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    const categoriesCount = Array.from(this.categories.values())
      .filter(cat => cat.userId === userId).length;

    // Calculate daily average (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentExpenses = userExpenses
      .filter(exp => new Date(exp.date) >= thirtyDaysAgo)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const dailyAverage = recentExpenses / 30;

    return {
      totalExpenses,
      weeklyExpenses,
      categoriesCount,
      dailyAverage,
    };
  }
}

export const storage = new MemStorage();
