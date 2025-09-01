import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookSchema, insertChapterSchema, insertCoverSchema, insertUserSchema } from "@shared/schema";
import { generateBookOutline, generateChapterContent, generateBookDescription, generateKeywords, generateBookCover, extractTextFromDocument } from "./services/openai";
import { processDocument, validateFileType, calculateWordCount } from "./services/documentProcessor";
import multer from "multer";
import bcrypt from "bcrypt";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Books routes
  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.post("/api/books", async (req, res) => {
    try {
      const validatedData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(validatedData);
      res.status(201).json(book);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ message: "Invalid book data", error: errorMessage });
    }
  });

  app.patch("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.updateBook(req.params.id, req.body);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  app.delete("/api/books/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBook(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Chapters routes
  app.get("/api/books/:bookId/chapters", async (req, res) => {
    try {
      const chapters = await storage.getChaptersByBookId(req.params.bookId);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chapters" });
    }
  });

  app.post("/api/books/:bookId/chapters", async (req, res) => {
    try {
      const validatedData = insertChapterSchema.parse({
        ...req.body,
        bookId: req.params.bookId
      });
      const chapter = await storage.createChapter(validatedData);
      res.status(201).json(chapter);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ message: "Invalid chapter data", error: errorMessage });
    }
  });

  app.patch("/api/chapters/:id", async (req, res) => {
    try {
      const chapter = await storage.updateChapter(req.params.id, req.body);
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error) {
      res.status(500).json({ message: "Failed to update chapter" });
    }
  });

  app.delete("/api/chapters/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteChapter(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete chapter" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getBookStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // AI Generation routes
  app.post("/api/generate/outline", async (req, res) => {
    try {
      const { genre, topic, targetLength, writingStyle } = req.body;
      
      if (!genre || !topic || !targetLength || !writingStyle) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const outline = await generateBookOutline({ genre, topic, targetLength, writingStyle });
      res.json(outline);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to generate outline", error: errorMessage });
    }
  });

  app.post("/api/generate/chapter", async (req, res) => {
    try {
      const { chapterTitle, chapterDescription, bookContext, writingStyle, targetWordCount } = req.body;
      
      if (!chapterTitle || !chapterDescription || !bookContext || !writingStyle) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const content = await generateChapterContent(
        chapterTitle, 
        chapterDescription, 
        bookContext, 
        writingStyle, 
        targetWordCount || 2000
      );
      
      const wordCount = calculateWordCount(content);
      
      res.json({ content, wordCount });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to generate chapter", error: errorMessage });
    }
  });

  app.post("/api/generate/description", async (req, res) => {
    try {
      const { title, genre, outline } = req.body;
      
      if (!title || !genre || !outline) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const description = await generateBookDescription(title, genre, outline);
      res.json({ description });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to generate description", error: errorMessage });
    }
  });

  app.post("/api/generate/keywords", async (req, res) => {
    try {
      const { title, genre, description } = req.body;
      
      if (!title || !genre || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const keywords = await generateKeywords(title, genre, description);
      res.json({ keywords });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to generate keywords", error: errorMessage });
    }
  });

  app.post("/api/generate/cover", async (req, res) => {
    try {
      const { title, author, genre, style } = req.body;
      
      if (!title || !author || !genre || !style) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const cover = await generateBookCover(title, author, genre, style);
      res.json(cover);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to generate cover", error: errorMessage });
    }
  });

  // Document upload and processing
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { originalname, buffer, mimetype } = req.file;
      
      if (!validateFileType(originalname)) {
        return res.status(400).json({ message: "Unsupported file type" });
      }

      const processed = await processDocument(buffer, originalname, mimetype);
      
      // Extract additional insights using AI
      const analysis = await extractTextFromDocument(processed.text, originalname);
      
      res.json({
        ...processed,
        text: analysis.text,
        summary: analysis.summary,
        wordCount: calculateWordCount(analysis.text)
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to process document", error: errorMessage });
    }
  });

  // Covers routes
  app.get("/api/books/:bookId/covers", async (req, res) => {
    try {
      const covers = await storage.getCoversByBookId(req.params.bookId);
      res.json(covers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch covers" });
    }
  });

  app.post("/api/books/:bookId/covers", async (req, res) => {
    try {
      const validatedData = insertCoverSchema.parse({
        ...req.body,
        bookId: req.params.bookId
      });
      const cover = await storage.createCover(validatedData);
      res.status(201).json(cover);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ message: "Invalid cover data", error: errorMessage });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      // Check if user already exists
      const existingUsers = await storage.getUsers();
      const existingUser = existingUsers.find(u => u.username === username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const validatedData = insertUserSchema.parse({
        username,
        email: email || null,
        password: hashedPassword
      });

      const user = await storage.createUser(validatedData);
      
      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ message: "Registration failed", error: errorMessage });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Find user
      const users = await storage.getUsers();
      const user = users.find(u => u.username === username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user session (simplified - in production use proper session management)
      (req as any).session = { userId: user.id, username: user.username };

      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Login failed", error: errorMessage });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      (req as any).session = null;
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const session = (req as any).session;
      if (!session || !session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const users = await storage.getUsers();
      const user = users.find(u => u.id === session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user info" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
