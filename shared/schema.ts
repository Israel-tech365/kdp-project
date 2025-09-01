import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  author: text("author").notNull(),
  genre: text("genre").notNull(),
  description: text("description"),
  keywords: json("keywords").$type<string[]>(),
  content: json("content").$type<BookChapter[]>(),
  coverUrl: text("cover_url"),
  images: json("images").$type<BookImage[]>(),
  sourceFile: text("source_file"),
  targetLength: text("target_length"),
  writingStyle: text("writing_style"),
  progress: integer("progress").default(0),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chapters = pgTable("chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").notNull().references(() => books.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  order: integer("order").notNull(),
  wordCount: integer("word_count").default(0),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const covers = pgTable("covers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").notNull().references(() => books.id),
  imageUrl: text("image_url").notNull(),
  style: text("style").notNull(),
  colorScheme: text("color_scheme").notNull(),
  isSelected: text("is_selected").notNull().default("false"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  apiKey: text("api_key"),
});

// Zod schemas
export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCoverSchema = createInsertSchema(covers).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Types
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;

export type Cover = typeof covers.$inferSelect;
export type InsertCover = z.infer<typeof insertCoverSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Additional utility types
export interface BookImage {
  name: string;
  url: string;
}

export interface BookChapter {
  title: string;
  content: string;
  order: number;
  wordCount: number;
}

export interface BookStats {
  booksInProgress: number;
  publishedBooks: number;
  aiWordsGenerated: number;
  monthlyRevenue: string;
}

export interface GenerationRequest {
  genre: string;
  topic: string;
  targetLength: string;
  writingStyle: string;
}

export interface BookOutline {
  chapters: {
    title: string;
    description: string;
  }[];
}
