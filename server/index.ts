
import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { log, setupVite, serveStatic } from "./vite";
import { connectToDatabase, isConnected } from "./db";
import { storage } from "./storage";
import { registerRoutes } from "./routes";
import '../envConfig'

const app = express();

// Configure Express
app.use(express.json());

// Check if request is part of an API request or static
app.use((req, _, next) => {
  req.isApiRequest = req.url.startsWith("/api");
  next();
});

// Error handler for API requests
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (req.isApiRequest) {
    res.status(500).json({ error: err.message });
  } else {
    next(err);
  }
});

// Log all API requests
app.use((req, _, next) => {
  if (req.url.startsWith("/api")) {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

(async () => {
  try {
    // Attempt to connect to MongoDB 
    log('Starting database connection...', 'server');
    const dbConnection = await connectToDatabase();
    
    if (dbConnection && isConnected()) {
      log('MongoDB successfully connected, using MongoDB storage', 'server');
      // Using MongoDB storage through getStorage() function
    } else {
      log('Failed to connect to MongoDB, using in-memory storage', 'server-warn');
      // Storage variable is already initialized with in-memory storage as a fallback
    }
    
    const server = await registerRoutes(app);
  
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
  
      res.status(status).json({ message });
      throw err;
    });
  
    // Set up Vite in development mode
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
  
    // ALWAYS serve the app on port 5000
    const port = process.env.PORT || 5000;
    server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    log(`Error during server startup: ${error}`, 'error');
    
    // Try to create a minimal server with only static file serving
    try {
      const emergencyServer = createServer(app);
      
      // Serve static files in any case
      serveStatic(app);
      
      const port = process.env.PORT || 5000;
      emergencyServer.listen({
        port,
        host: "0.0.0.0",
      }, () => {
        log(`Emergency server running on port ${port} (frontend only)`, 'emergency');
      });
    } catch (fallbackError) {
      log(`Critical failure: ${fallbackError}`, 'critical');
      process.exit(1);
    }
  }
})();