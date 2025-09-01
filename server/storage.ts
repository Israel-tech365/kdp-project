import { type Book, type InsertBook, type Chapter, type InsertChapter, type Cover, type InsertCover, type User, type InsertUser, type BookStats, type BookChapter } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Books
  getBook(id: string): Promise<Book | undefined>;
  getBooks(): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, book: Partial<InsertBook>): Promise<Book | undefined>;
  deleteBook(id: string): Promise<boolean>;
  
  // Chapters
  getChaptersByBookId(bookId: string): Promise<Chapter[]>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: string, chapter: Partial<InsertChapter>): Promise<Chapter | undefined>;
  deleteChapter(id: string): Promise<boolean>;
  
  // Covers
  getCoversByBookId(bookId: string): Promise<Cover[]>;
  createCover(cover: InsertCover): Promise<Cover>;
  updateCover(id: string, cover: Partial<InsertCover>): Promise<Cover | undefined>;
  deleteCover(id: string): Promise<boolean>;
  
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Stats
  getBookStats(): Promise<BookStats>;
}

export class MemStorage implements IStorage {
  private books: Map<string, Book>;
  private chapters: Map<string, Chapter>;
  private covers: Map<string, Cover>;
  private users: Map<string, User>;

  constructor() {
    this.books = new Map();
    this.chapters = new Map();
    this.covers = new Map();
    this.users = new Map();
  }

  // Books
  async getBook(id: string): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBooks(): Promise<Book[]> {
    return Array.from(this.books.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = randomUUID();
    const now = new Date();
    const book: Book = { 
      title: insertBook.title,
      author: insertBook.author,
      genre: insertBook.genre,
      description: insertBook.description || null,
      keywords: insertBook.keywords || null,
      content: insertBook.content || null,
      coverUrl: insertBook.coverUrl || null,
      images: insertBook.images || null,
      sourceFile: insertBook.sourceFile || null,
      targetLength: insertBook.targetLength || null,
      writingStyle: insertBook.writingStyle || null,
      progress: insertBook.progress ?? 0,
      status: insertBook.status || "draft",
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.books.set(id, book);
    return book;
  }

  async updateBook(id: string, updateBook: Partial<InsertBook>): Promise<Book | undefined> {
    const existing = this.books.get(id);
    if (!existing) return undefined;
    
    const updated: Book = { 
      ...existing, 
      ...updateBook, 
      updatedAt: new Date() 
    };
    this.books.set(id, updated);
    return updated;
  }

  async deleteBook(id: string): Promise<boolean> {
    // Also delete related chapters and covers
    const chaptersToDelete = Array.from(this.chapters.values())
      .filter(chapter => chapter.bookId === id);
    chaptersToDelete.forEach(chapter => this.chapters.delete(chapter.id));
    
    const coversToDelete = Array.from(this.covers.values())
      .filter(cover => cover.bookId === id);
    coversToDelete.forEach(cover => this.covers.delete(cover.id));
    
    return this.books.delete(id);
  }

  // Chapters
  async getChaptersByBookId(bookId: string): Promise<Chapter[]> {
    return Array.from(this.chapters.values())
      .filter(chapter => chapter.bookId === bookId)
      .sort((a, b) => a.order - b.order);
  }

  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const id = randomUUID();
    const now = new Date();
    const chapter: Chapter = { 
      ...insertChapter, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.chapters.set(id, chapter);
    return chapter;
  }

  async updateChapter(id: string, updateChapter: Partial<InsertChapter>): Promise<Chapter | undefined> {
    const existing = this.chapters.get(id);
    if (!existing) return undefined;
    
    const updated: Chapter = { 
      ...existing, 
      ...updateChapter, 
      updatedAt: new Date() 
    };
    this.chapters.set(id, updated);
    return updated;
  }

  async deleteChapter(id: string): Promise<boolean> {
    return this.chapters.delete(id);
  }

  // Covers
  async getCoversByBookId(bookId: string): Promise<Cover[]> {
    return Array.from(this.covers.values())
      .filter(cover => cover.bookId === bookId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createCover(insertCover: InsertCover): Promise<Cover> {
    const id = randomUUID();
    const cover: Cover = { 
      ...insertCover, 
      id,
      isSelected: insertCover.isSelected || "false",
      createdAt: new Date() 
    };
    this.covers.set(id, cover);
    return cover;
  }

  async updateCover(id: string, updateCover: Partial<InsertCover>): Promise<Cover | undefined> {
    const existing = this.covers.get(id);
    if (!existing) return undefined;
    
    const updated: Cover = { ...existing, ...updateCover };
    this.covers.set(id, updated);
    return updated;
  }

  async deleteCover(id: string): Promise<boolean> {
    return this.covers.delete(id);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email ?? null,
      apiKey: insertUser.apiKey ?? null,
      id
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated: User = { ...existing, ...updateUser };
    this.users.set(id, updated);
    return updated;
  }

  // Stats
  async getBookStats(): Promise<BookStats> {
    const books = Array.from(this.books.values());
    const booksInProgress = books.filter(book => book.status === "draft" || book.status === "in-progress").length;
    const publishedBooks = books.filter(book => book.status === "published").length;
    
    // Calculate AI words generated (sum of all chapter word counts)
    const allChapters = Array.from(this.chapters.values());
    const aiWordsGenerated = allChapters.reduce((total, chapter) => total + (chapter.wordCount || 0), 0);
    
    return {
      booksInProgress,
      publishedBooks,
      aiWordsGenerated,
      monthlyRevenue: "$0" // Mock value for now
    };
  }
}

export const storage = new MemStorage();
