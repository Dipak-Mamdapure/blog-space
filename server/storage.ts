import { 
    type User, type InsertUser,
    type Blog, type InsertBlog,
    type Notification, type InsertNotification
  } from "@shared/schema";
  import session from "express-session";
  import createMemoryStore from "memorystore";
  import { UserModel } from "./models/user";
  import { BlogModel } from "./models/Blog";
  import { NotificationModel } from "./models/Notification";
  import mongoose from "mongoose";
  
  const MemoryStore = createMemoryStore(session);
  
  export interface IStorage {
    // User methods
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;
  
    // Blog methods
    getBlogs(): Promise<Blog[]>;
    getBlogById(id: number): Promise<Blog | undefined>;
    getBlogsByUserId(userId: number): Promise<Blog[]>;
    createBlog(blog: InsertBlog): Promise<Blog>;
  
    // Notification methods
    getNotifications(): Promise<Notification[]>;
    getNotificationsByUserId(userId: number): Promise<Notification[]>;
    createNotification(notification: InsertNotification): Promise<Notification>;
    markNotificationAsRead(id: number): Promise<Notification | undefined>;
  
    // Session store
    sessionStore: any; // Using any for session store to avoid type issues
  }
  
  export class MongoStorage implements IStorage {
    sessionStore: any;
  
    constructor() {
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      });
    }
  
    // User methods
    async getUser(id: number): Promise<User | undefined> {
      const user = await UserModel.findOne({ id }).lean();
      return user ? user as User : undefined;
    }
  
    async getUserByUsername(username: string): Promise<User | undefined> {
      const user = await UserModel.findOne({ username }).lean();
      return user ? user as User : undefined;
    }
  
    async createUser(insertUser: InsertUser): Promise<User> {
      // Get the maximum ID or start with 1
      const maxIdUser = await UserModel.findOne().sort({ id: -1 }).lean();
      const nextId = maxIdUser ? (maxIdUser.id as number) + 1 : 1;
      
      const user = new UserModel({
        ...insertUser,
        id: nextId
      });
      
      await user.save();
      return user.toObject() as User;
    }
  
    // Blog methods implementation
    async getBlogs(): Promise<Blog[]> {
      return await BlogModel.find()
        .sort({ createdAt: -1 })
        .lean() as Blog[];
    }
  
    async getBlogById(id: number): Promise<Blog | undefined> {
      const blog = await BlogModel.findOne({ id }).lean();
      return blog ? blog as Blog : undefined;
    }
  
    async getBlogsByUserId(userId: number): Promise<Blog[]> {
      return await BlogModel.find({ userId })
        .sort({ createdAt: -1 })
        .lean() as Blog[];
    }
  
    async createBlog(insertBlog: InsertBlog): Promise<Blog> {
      // Get the maximum ID or start with 1
      const maxIdBlog = await BlogModel.findOne().sort({ id: -1 }).lean();
      const nextId = maxIdBlog ? (maxIdBlog.id as number) + 1 : 1;
      
      const blog = new BlogModel({
        ...insertBlog,
        id: nextId,
        createdAt: new Date()
      });
      
      await blog.save();
      return blog.toObject() as Blog;
    }
  
    // Notification methods
    async getNotifications(): Promise<Notification[]> {
      return await NotificationModel.find()
        .sort({ createdAt: -1 })
        .lean() as Notification[];
    }
  
    async getNotificationsByUserId(userId: number): Promise<Notification[]> {
      return await NotificationModel.find({ userId })
        .sort({ createdAt: -1 })
        .lean() as Notification[];
    }
  
    async createNotification(insertNotification: InsertNotification): Promise<Notification> {
      // Get the maximum ID or start with 1
      const maxIdNotification = await NotificationModel.findOne().sort({ id: -1 }).lean();
      const nextId = maxIdNotification ? (maxIdNotification.id as number) + 1 : 1;
      
      const notification = new NotificationModel({
        ...insertNotification,
        id: nextId,
        read: false,
        createdAt: new Date()
      });
      
      await notification.save();
      return notification.toObject() as Notification;
    }
  
    async markNotificationAsRead(id: number): Promise<Notification | undefined> {
      const notification = await NotificationModel.findOneAndUpdate(
        { id },
        { read: true },
        { new: true }
      ).lean();
      
      return notification ? notification as Notification : undefined;
    }
  }
  
  // For fallback, keep the MemStorage class
  export class MemStorage implements IStorage {
    private users: Map<number, User>;
    private blogs: Map<number, Blog>;
    private notifications: Map<number, Notification>;
    
    sessionStore: any;
    currentUserId: number;
    currentBlogId: number;
    currentNotificationId: number;
  
    constructor() {
      this.users = new Map();
      this.blogs = new Map();
      this.notifications = new Map();
      this.currentUserId = 1;
      this.currentBlogId = 1;
      this.currentNotificationId = 1;
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      });
    }
  
    // Implement all interface methods with in-memory logic
    async getUser(id: number): Promise<User | undefined> {
      return this.users.get(id);
    }
  }
  
  // Function to get the storage implementation based on connection state
  export function getStorage(): IStorage {
    try {
      if (mongoose.connection.readyState === 1) {
        // Connected to MongoDB
        return new MongoStorage();
      } else {
        // Not connected, use in-memory storage
        console.log('Using in-memory storage');
        return new MemStorage();
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
      // Fallback to in-memory storage
      console.log('Fallback to in-memory storage due to error');
      return new MemStorage();
    }
  }
  
  // Use a lazy-loaded singleton pattern to avoid circular dependencies
  let storageInstance: IStorage | null = null;
  
  export const storage: IStorage = new Proxy({} as IStorage, {
    get: (target, prop) => {
      if (!storageInstance) {
        storageInstance = getStorage();
      }
      return storageInstance[prop as keyof IStorage];
    }
  });