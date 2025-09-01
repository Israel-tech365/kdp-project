import OpenAI from "openai";
import type { GenerationRequest, BookOutline } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function generateBookOutline(request: GenerationRequest): Promise<BookOutline> {
  const genreGuidelines = getGenreGuidelines(request.genre);
  const lengthSpec = getLengthSpecification(request.targetLength);
  
  const prompt = `Create a comprehensive ${request.genre} book outline for "${request.topic}".

TARGET SPECIFICATIONS:
- Length: ${request.targetLength} (${lengthSpec.chapters} chapters, ~${lengthSpec.wordsPerChapter} words each)
- Style: ${request.writingStyle}
- Genre: ${request.genre}

GENRE REQUIREMENTS:
${genreGuidelines}

OUTLINE STRUCTURE:
Create ${lengthSpec.chapters} engaging chapters that follow a compelling narrative arc. Each chapter should:
- Have a compelling hook and purpose
- Advance the overall story/argument
- End with momentum that leads to the next chapter
- Be substantial enough for ${lengthSpec.wordsPerChapter} words

Return ONLY valid JSON in this exact format:
{
  "chapters": [
    {
      "title": "Compelling Chapter Title",
      "description": "Detailed 2-3 sentence description covering main events, conflicts, and purpose"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert book editor and publishing consultant. Generate detailed, engaging book outlines that would appeal to readers in the specified genre."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as BookOutline;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Failed to generate book outline: " + errorMessage);
  }
}

export async function generateChapterContent(
  chapterTitle: string, 
  chapterDescription: string, 
  bookContext: string,
  writingStyle: string,
  targetWordCount: number = 2000
): Promise<string> {
  const prompt = `Write a complete chapter for a book with the following details:
  Chapter Title: ${chapterTitle}
  Chapter Description: ${chapterDescription}
  Book Context: ${bookContext}
  Writing Style: ${writingStyle}
  Target Word Count: ${targetWordCount} words
  
  Write engaging, well-structured content that flows naturally and fits the chapter description.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a professional author who writes engaging, well-structured chapters. Focus on creating compelling content that keeps readers engaged."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: Math.min(4000, Math.ceil(targetWordCount * 1.5))
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Failed to generate chapter content: " + errorMessage);
  }
}

export async function generateBookDescription(title: string, genre: string, outline: BookOutline): Promise<string> {
  const chapterSummary = outline.chapters.slice(0, 3).map(ch => ch.description).join(". ");
  
  const prompt = `Write a compelling book description for "${title}", a ${genre} book. 
  Here's a summary of the first few chapters: ${chapterSummary}
  
  Create an engaging description that would attract readers and work well for Amazon KDP. 
  Focus on the hook, main conflict, and what makes this book special.
  Keep it between 150-250 words.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a marketing expert specializing in book descriptions that convert browsers into buyers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Failed to generate book description: " + errorMessage);
  }
}

export async function generateKeywords(title: string, genre: string, description: string): Promise<string[]> {
  const prompt = `Generate SEO keywords for a ${genre} book titled "${title}".
  Book description: ${description}
  
  Provide 10-15 relevant keywords that would help this book be discovered on Amazon KDP.
  Return as JSON array: {"keywords": ["keyword1", "keyword2", ...]}.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an Amazon KDP marketing expert who specializes in keyword research for book discovery."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.keywords || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Failed to generate keywords: " + errorMessage);
  }
}

export async function generateBookCover(title: string, author: string, genre: string, style: string): Promise<{ url: string }> {
  const prompt = `Create a professional book cover for "${title}" by ${author}. 
  Genre: ${genre}
  Style: ${style}
  
  Design should be eye-catching, professional, and suitable for Amazon KDP. 
  Include the title prominently and author name. 
  Make it visually appealing for the ${genre} genre.`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return { url: response.data?.[0]?.url || "" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Failed to generate book cover: " + errorMessage);
  }
}

// Helper functions for enhanced AI generation

function getGenreGuidelines(genre: string): string {
  const guidelines: Record<string, string> = {
    "Fiction": `
- Strong character development and emotional arcs
- Compelling plot with rising action, climax, and resolution
- Rich dialogue and descriptive scenes
- Consistent point of view and narrative voice`,
    
    "Non-Fiction": `
- Clear thesis or central argument
- Well-researched facts and examples
- Logical progression of ideas
- Actionable insights and takeaways`,
    
    "Mystery": `
- Intriguing mystery introduced early
- Red herrings and clues planted throughout
- Gradual revelation of information
- Satisfying resolution that ties up loose ends`,
    
    "Romance": `
- Strong emotional connection between characters
- Romantic tension and obstacles
- Character growth through relationship
- Satisfying romantic resolution`,
    
    "Fantasy": `
- Rich world-building and magic systems
- Heroic journey or quest structure
- Supernatural elements integrated naturally
- Epic scope with high stakes`,
    
    "Sci-Fi": `
- Scientifically plausible technology
- Exploration of future implications
- Social commentary through futuristic lens
- Logical consequences of technological advancement`,
    
    "Thriller": `
- Fast-paced, high-stakes action
- Constant tension and suspense
- Life-or-death consequences
- Plot twists and unexpected revelations`,
    
    "Self-Help": `
- Practical, actionable advice
- Personal anecdotes and case studies
- Step-by-step methodologies
- Measurable outcomes and results`,
    
    "Business": `
- Industry insights and trends
- Real-world case studies
- Strategic frameworks and models
- Practical implementation guidance`
  };
  
  return guidelines[genre] || guidelines["Fiction"];
}

function getLengthSpecification(targetLength: string): { chapters: number; wordsPerChapter: number } {
  const specs: Record<string, { chapters: number; wordsPerChapter: number }> = {
    "Novella (20,000-40,000 words)": { chapters: 8, wordsPerChapter: 3500 },
    "Short Novel (40,000-60,000 words)": { chapters: 12, wordsPerChapter: 4500 },
    "Standard Novel (60,000-80,000 words)": { chapters: 16, wordsPerChapter: 4500 },
    "Long Novel (80,000+ words)": { chapters: 20, wordsPerChapter: 4500 },
    "Short Guide (5,000-15,000 words)": { chapters: 6, wordsPerChapter: 2000 },
    "Comprehensive Guide (15,000-30,000 words)": { chapters: 10, wordsPerChapter: 2500 }
  };
  
  return specs[targetLength] || { chapters: 12, wordsPerChapter: 3000 };
}

export async function extractTextFromDocument(fileContent: string, fileName: string): Promise<{ text: string; summary: string }> {
  const prompt = `Analyze and extract key information from this document content:
  File: ${fileName}
  Content: ${fileContent}
  
  Provide a summary of the main topics and themes.
  Return as JSON: {"text": "full cleaned text", "summary": "brief summary"}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a document analysis expert. Extract and summarize text content effectively."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      text: result.text || fileContent,
      summary: result.summary || "Document content extracted"
    };
  } catch (error) {
    return {
      text: fileContent,
      summary: "Document content extracted without AI processing"
    };
  }
}
