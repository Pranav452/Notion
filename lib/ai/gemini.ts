// Mock AI Service - Simulates Gemini AI without API calls
// This creates a convincing demo with fake AI responses

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export interface AIEmbedding {
  values: number[];
}

export interface AILinkSuggestion {
  pageId: string;
  title: string;
  confidence: number;
  reason: string;
}

export interface AITagSuggestion {
  tag: string;
  confidence: number;
  reason: string;
}

export interface AIAnswer {
  answer: string;
  sources: {
    pageId: string;
    title: string;
    relevantContent: string;
  }[];
  confidence: number;
}

// Mock data for realistic AI responses
const mockTags = [
  { tag: 'project-management', confidence: 0.95, reason: 'Content discusses project planning and management' },
  { tag: 'technical-documentation', confidence: 0.88, reason: 'Contains technical specifications and documentation' },
  { tag: 'strategy', confidence: 0.92, reason: 'Focuses on strategic planning and decision making' },
  { tag: 'design-system', confidence: 0.87, reason: 'Related to UI/UX design principles and systems' },
  { tag: 'engineering', confidence: 0.91, reason: 'Discusses engineering practices and methodologies' },
  { tag: 'user-research', confidence: 0.89, reason: 'Contains user research findings and insights' },
  { tag: 'product-development', confidence: 0.93, reason: 'Related to product development lifecycle' },
  { tag: 'team-collaboration', confidence: 0.85, reason: 'Discusses team workflows and collaboration' },
  { tag: 'best-practices', confidence: 0.90, reason: 'Documents best practices and standards' },
  { tag: 'architecture', confidence: 0.86, reason: 'Covers system architecture and design patterns' }
];

const mockAnswers = [
  "Based on your knowledge base, I found several relevant insights. The documents discuss comprehensive approaches to project management and technical implementation strategies.",
  "Your workspace contains detailed information about design systems and user experience principles. This knowledge can help guide decision-making processes.",
  "I've analyzed the available content and found patterns related to team collaboration and engineering best practices across multiple documents.",
  "The information in your workspace suggests a focus on scalable architecture and modern development methodologies.",
  "From the documents I reviewed, there's a strong emphasis on user-centered design and research-driven product development."
];

// Generate mock embedding (random but consistent for same input)
function generateMockEmbedding(text: string): number[] {
  const seed = text.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const embedding: number[] = [];
  
  for (let i = 0; i < 512; i++) {
    // Use seed to make embeddings consistent for same text
    const value = Math.sin(seed + i) * 0.5;
    embedding.push(value);
  }
  
  return embedding;
}

// Simulate processing delay for realistic feel
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const MODEL_NAME = "gemini-1.5-flash-latest";
const EMBEDDING_MODEL_NAME = "text-embedding-004"; // Or other available embedding model

export class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private apiKeyStatus: string;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      this.apiKeyStatus = "NEXT_PUBLIC_GEMINI_API_KEY not found in environment variables.";
      console.error(this.apiKeyStatus);
      // Fallback or throw error, depending on desired behavior
      // For now, we'll let it proceed, but API calls will fail.
      this.genAI = new GoogleGenerativeAI("INVALID_KEY_PLACEHOLDER"); // Prevents crash if key is missing
    } else {
      this.apiKeyStatus = "NEXT_PUBLIC_GEMINI_API_KEY loaded successfully.";
      console.log(this.apiKeyStatus);
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    // Test API key (optional, can be a lightweight call)
    this.testApiKey();
  }

  private async testApiKey() {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) return;
    try {
      // Example: list models or a very simple prompt to check connectivity
      // This is a placeholder for an actual lightweight test call if needed.
      // For now, the constructor log will indicate if key was found.
      // A real test might involve a specific Gemini API call.
      console.log("Attempting to initialize Gemini client with key...");
      // const model = this.genAI.getGenerativeModel({ model: MODEL_NAME });
      // await model.countTokens("test"); // Example lightweight call
      console.log("Gemini client initialized. Further checks depend on actual API calls.");
    } catch (error) {
      console.error("Error testing Gemini API key:", error);
      this.apiKeyStatus = "Error testing Gemini API key. Calls may fail.";
    }
  }
  
  async generateEmbedding(text: string): Promise<AIEmbedding> {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.error("Cannot generate embedding: API key not configured.");
      return { values: [] }; // Return empty embedding or throw error
    }
    try {
      const model = this.genAI.getGenerativeModel({ model: EMBEDDING_MODEL_NAME });
      const result = await model.embedContent(text);
      const embedding = result.embedding;
      return { values: embedding.values || [] };
    } catch (error) {
      console.error("Error generating embedding:", error);
      // Consider how to handle errors, e.g., return a zero vector or throw
      return { values: Array(768).fill(0) }; // Example: return zero vector of typical size
    }
  }

  async suggestLinks(
    currentPageContent: string,
    currentPageTitle: string,
    existingPages: { id: string; title: string; content?: string }[] // content is optional for context
  ): Promise<AILinkSuggestion[]> {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY || existingPages.length === 0) {
      return [];
    }
    try {
      const model = this.genAI.getGenerativeModel({ model: MODEL_NAME });
      const pageTitles = existingPages.map(p => `- "${p.title}" (ID: ${p.id})`).join("\\n");

      const prompt = `\
Given the current page titled "${currentPageTitle}" with the following content:
---
${currentPageContent.substring(0, 1500)} 
---
And a list of other available pages in the workspace:
---
${pageTitles}
---
Suggest up to 3 pages from the list that would be relevant to link to from the current page. For each suggestion, provide the page title, its ID, and a brief reason (max 10 words) for the suggestion.
Format your response as a JSON array, where each object has "pageId", "title", and "reason" keys. For example:
[
  { "pageId": "some-id-1", "title": "Relevant Page Title 1", "reason": "Explains a related concept mentioned." },
  { "pageId": "some-id-2", "title": "Relevant Page Title 2", "reason": "Provides background information." }
]
If no pages are particularly relevant, return an empty array [].`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean the response to ensure it's valid JSON
      let cleanedResponseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const suggestions: { pageId: string; title: string; reason: string }[] = JSON.parse(cleanedResponseText);
      return suggestions.map(s => ({ ...s, confidence: 0.85 })); // Assign fixed confidence
    } catch (error) {
      console.error("Error suggesting links:", error);
      return [];
    }
  }

  async suggestTags(content: string, title: string): Promise<AITagSuggestion[]> {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return [];
    }
    try {
      const model = this.genAI.getGenerativeModel({ model: MODEL_NAME });
      const prompt = `\
Analyze the following page content and title to suggest 3 to 5 relevant tags.
Page Title: "${title}"
Page Content:
---
${content.substring(0, 2000)}
---
Tags should be concise, lowercase, and use hyphens for multi-word tags (e.g., "project-management"). For each tag, provide a brief reason (max 10 words) why it's relevant.
Format your response as a JSON array, where each object has "tag" and "reason" keys. For example:
[
  { "tag": "main-topic", "reason": "Content focuses on this topic." },
  { "tag": "related-concept", "reason": "Discusses this related idea." }
]`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      let cleanedResponseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const suggestions: { tag: string; reason: string }[] = JSON.parse(cleanedResponseText);
      return suggestions.map(s => ({ ...s, confidence: 0.8 })); // Assign fixed confidence
    } catch (error) {
      console.error("Error suggesting tags:", error);
      return [];
    }
  }

  async answerQuestion(
    question: string,
    workspacePages: { id: string; title: string; content: string; tags?: string[] }[]
  ): Promise<AIAnswer> {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY || workspacePages.length === 0) {
      return {
        answer: "AI Service not configured or no content in workspace to search.",
        sources: [],
        confidence: 0,
      };
    }

    // Simplified context creation: use titles and first ~300 chars of content from up to 5 pages
    // A more advanced RAG would use embeddings for similarity search here.
    let context = "";
    const relevantPagesForContext = workspacePages.slice(0, 5); // Limiting for now
    
    relevantPagesForContext.forEach((page, index) => {
      const pageContentPlainText = typeof page.content === 'string' 
        ? page.content 
        : this.extractTextFromJson(page.content); // Assuming content can be Tiptap JSON
      context += `Page ${index + 1} (ID: ${page.id}, Title: "${page.title}"):\n${pageContentPlainText.substring(0, 500)}...\n\n`;
    });
    
    const prompt = `\
You are an AI assistant for a knowledge workspace.
Based ONLY on the following context from various pages, answer the user's question.
If the answer cannot be found in the context, state that clearly.
After providing the answer, list the Page IDs and Titles of the pages from the context that were most relevant to forming your answer.

Context:
---
${context.substring(0, 15000)} 
---
User Question: "${question}"

Format your response as a JSON object with three keys: "answer", "relevantSourceIds", and "confidence".
"answer": Your answer to the question.
"relevantSourceIds": An array of Page IDs (strings) from the provided context that you used to formulate the answer. If no specific pages were used, provide an empty array.
"confidence": A float between 0.0 and 1.0 indicating your confidence in the answer based *only* on the provided context.

Example JSON response:
{
  "answer": "The pricing strategy involves freemium onboarding and premium tiers.",
  "relevantSourceIds": ["page-id-1", "page-id-3"],
  "confidence": 0.9
}
`;

    try {
      const model = this.genAI.getGenerativeModel({ model: MODEL_NAME });
      const generationConfig = {
        // temperature: 0.3, // Adjust for more factual/less creative
        // topK: 1,
        // topP: 1,
        // maxOutputTokens: 1024,
        responseMimeType: "application/json", // Request JSON output
      };
      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ];

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{text: prompt}] }],
        generationConfig,
        safetySettings,
      });
      const responseText = result.response.text();
      const parsedResponse: { answer: string; relevantSourceIds: string[]; confidence: number; } = JSON.parse(responseText);

      const sources = parsedResponse.relevantSourceIds
        .map(id => {
          const page = workspacePages.find(p => p.id === id);
          return page ? { pageId: page.id, title: page.title, relevantContent: `Used as a source for the answer.` } : null;
        })
        .filter(source => source !== null) as AIAnswer['sources'];

      return {
        answer: parsedResponse.answer,
        sources: sources,
        confidence: parsedResponse.confidence || 0.75, // Default if not provided
      };

    } catch (error) {
      console.error("Error answering question with Gemini:", error);
      let errorMessage = "I encountered an issue processing your request with the AI service.";
      if (error instanceof Error && error.message.includes("SAFETY")) {
        errorMessage = "The response was blocked due to safety settings. Please rephrase your question or adjust the content.";
      } else if (error instanceof Error && error.message.includes("API key not valid")) {
        errorMessage = "The AI API key is not valid. Please check your configuration.";
        this.apiKeyStatus = "API Key is invalid or expired.";
      }
      return {
        answer: errorMessage,
        sources: [],
        confidence: 0.1,
      };
    }
  }

  // Utility to extract plain text from Tiptap JSON, if needed
  private extractTextFromJson(jsonContent: any): string {
    if (!jsonContent || !jsonContent.content) return '';
    
    let text = '';
    function recurse(node: any) {
      if (node.type === 'text') {
        text += node.text;
      }
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(recurse);
      }
      text += ' '; // Add space between elements
    }
    jsonContent.content.forEach(recurse);
    return text.replace(/\s+/g, ' ').trim();
  }

  async extractPlainText(jsonContent: any): Promise<string> {
    // Extract plain text from Tiptap JSON content
    if (!jsonContent || !jsonContent.content) return '';
    
    const extractText = (node: any): string => {
      if (node.type === 'text') {
        return node.text || '';
      }
      
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join(' ');
      }
      
      return '';
    };
    
    return jsonContent.content.map(extractText).join('\n').trim();
  }

  async findSimilarPages(
    pageContent: string,
    workspacePages: { id: string; title: string; content: string; embedding?: number[] }[]
  ): Promise<{ pageId: string; title: string; similarity: number }[]> {
    await delay(500); // Simulate processing
    
    if (workspacePages.length === 0) return [];
    
    // Generate mock similarities
    const similarities = workspacePages
      .filter(page => page.id) // Exclude current page if needed
      .map(page => ({
        pageId: page.id,
        title: page.title,
        similarity: 0.5 + Math.random() * 0.45 // 0.5-0.95
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);
    
    return similarities;
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] ** 2;
      normB += vecB[i] ** 2;
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const aiService = new GeminiAIService(); 