import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertBlogSchema, insertNotificationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Set up HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message) => {
      console.log('Received:', message.toString());
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Broadcast to all clients
  function broadcastNotification(notification: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
      }
    });
  }

  // Blog routes
  app.get("/api/blogs", async (req, res) => {
    try {
      const blogs = await storage.getBlogs();
      // Get user info for each blog
      const blogsWithUserInfo = await Promise.all(
        blogs.map(async (blog) => {
          const user = await storage.getUser(blog.userId);
          return {
            ...blog,
            user: user ? { id: user.id, username: user.username } : null,
          };
        })
      );
      res.json(blogsWithUserInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blogs" });
    }
  });

  app.get("/api/blogs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const blog = await storage.getBlogById(id);
      
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      
      const user = await storage.getUser(blog.userId);
      const blogWithUser = {
        ...blog,
        user: user ? { id: user.id, username: user.username } : null,
      };
      
      res.json(blogWithUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog" });
    }
  });

  app.get("/api/user/blogs", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userBlogs = await storage.getBlogsByUserId(req.user!.id);
      res.json(userBlogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user blogs" });
    }
  });

  app.post("/api/blogs", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = req.user!.id;
      const validatedData = insertBlogSchema.parse({
        ...req.body,
        userId,
      });
      
      const newBlog = await storage.createBlog(validatedData);
      
      // Get the user info
      const user = await storage.getUser(userId);
      
      // Create notification
      if (user) {
        const notification = await storage.createNotification(insertNotificationSchema.parse({
          message: `${user.username} published a new blog post "${newBlog.title}"`,
          blogId: newBlog.id,
          userId: userId,
        }));
        
        // Broadcast notification to all connected clients
        broadcastNotification({
          type: 'NEW_BLOG',
          data: {
            notification,
            blog: newBlog,
            user: { id: user.id, username: user.username },
          }
        });
      }
      
      res.status(201).json(newBlog);
    } catch (error) {
      res.status(400).json({ message: "Invalid blog data", error });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(id);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  return httpServer;
}