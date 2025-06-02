// Mock AI Service - Simulates Gemini AI without API calls
// This creates a convincing demo with fake AI responses

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

export class GeminiAIService {
  async generateEmbedding(text: string): Promise<AIEmbedding> {
    await delay(300); // Simulate API call delay
    
    return {
      values: generateMockEmbedding(text)
    };
  }

  async suggestLinks(
    currentPageContent: string,
    currentPageTitle: string,
    existingPages: { id: string; title: string; content: string }[]
  ): Promise<AILinkSuggestion[]> {
    await delay(800); // Simulate AI processing
    
    if (existingPages.length === 0) return [];
    
    // Select 2-4 random pages as suggestions
    const shuffled = [...existingPages].sort(() => Math.random() - 0.5);
    const selectedPages = shuffled.slice(0, Math.min(4, existingPages.length));
    
    const reasons = [
      'Shares similar concepts and terminology',
      'Contains complementary information',
      'References related methodologies',
      'Part of the same project or topic',
      'Discusses similar challenges and solutions',
      'Contains relevant background context',
      'Builds upon concepts mentioned here'
    ];
    
    return selectedPages.map(page => ({
      pageId: page.id,
      title: page.title,
      confidence: 0.65 + Math.random() * 0.3, // 0.65-0.95
      reason: reasons[Math.floor(Math.random() * reasons.length)]
    }));
  }

  async suggestTags(content: string, title: string): Promise<AITagSuggestion[]> {
    await delay(600); // Simulate AI processing
    
    // Select 3-6 relevant tags based on content keywords
    const shuffled = [...mockTags].sort(() => Math.random() - 0.5);
    const selectedTags = shuffled.slice(0, 3 + Math.floor(Math.random() * 4));
    
    // Adjust confidence based on content relevance (mock logic)
    return selectedTags.map(tag => ({
      ...tag,
      confidence: Math.max(0.7, tag.confidence - Math.random() * 0.15)
    }));
  }

  async answerQuestion(
    question: string,
    workspacePages: { id: string; title: string; content: string; tags: string[] }[]
  ): Promise<AIAnswer> {
    await delay(1200); // Simulate AI processing
    
    if (workspacePages.length === 0) {
      return {
        answer: "I don't have enough information in your workspace to answer this question. Try adding more content first.",
        sources: [],
        confidence: 0
      };
    }
    
    // Analyze question for better contextual responses
    const questionLower = question.toLowerCase();
    let contextualAnswer = "";
    let relevantPages: typeof workspacePages = [];
    
    // Strategy-related questions
    if (questionLower.includes('strategy') || questionLower.includes('product')) {
      contextualAnswer = "Based on your AI product strategy documents, your approach focuses on user-centric design, scalable architecture, and ethical AI implementation. The strategy emphasizes iterative development with continuous user feedback loops and data-driven decision making to build intelligent systems that enhance user productivity.";
      relevantPages = workspacePages.filter(p => 
        p.title.toLowerCase().includes('strategy') || 
        p.tags.some(tag => tag.includes('strategy') || tag.includes('product'))
      );
    }
    // Architecture-related questions
    else if (questionLower.includes('architecture') || questionLower.includes('technical') || questionLower.includes('system')) {
      contextualAnswer = "Your AI system follows a microservices architecture with dedicated services for model inference, data processing, and user interaction management. The design prioritizes scalability, maintainability, and real-time performance with TensorFlow Serving, Kong API Gateway, and Apache Kafka for data processing.";
      relevantPages = workspacePages.filter(p => 
        p.title.toLowerCase().includes('architecture') || 
        p.tags.some(tag => tag.includes('architecture') || tag.includes('engineering'))
      );
    }
    // User research-related questions
    else if (questionLower.includes('user') || questionLower.includes('research') || questionLower.includes('adoption')) {
      contextualAnswer = "Your user research shows that 73% of users prefer AI suggestions that can be easily dismissed or modified, and 89% request explanations for AI recommendations. Speed matters with a 2-second response time threshold for user satisfaction, and trust increases with consistent performance over flashy features.";
      relevantPages = workspacePages.filter(p => 
        p.title.toLowerCase().includes('user') || 
        p.tags.some(tag => tag.includes('user') || tag.includes('research'))
      );
    }
    // Performance-related questions
    else if (questionLower.includes('performance') || questionLower.includes('metrics') || questionLower.includes('kpi')) {
      contextualAnswer = "Your AI system maintains strong performance metrics: 94.2% model accuracy (target >93%), 1.2s average response time (target <2s), 67% feature adoption rate, and 99.7% system uptime (target >99.5%). These metrics are monitored in real-time with automated alerts for degradation.";
      relevantPages = workspacePages.filter(p => 
        p.title.toLowerCase().includes('performance') || p.title.toLowerCase().includes('metrics') ||
        p.tags.some(tag => tag.includes('performance') || tag.includes('metrics'))
      );
    }
    // Security-related questions
    else if (questionLower.includes('security') || questionLower.includes('privacy') || questionLower.includes('compliance')) {
      contextualAnswer = "Your security approach includes end-to-end encryption for all user data, data anonymization for ML training, regular security audits, and GDPR/CCPA compliance. All AI models undergo security review before deployment, including adversarial testing and bias evaluation.";
      relevantPages = workspacePages.filter(p => 
        p.title.toLowerCase().includes('security') || p.title.toLowerCase().includes('privacy') ||
        p.tags.some(tag => tag.includes('security') || tag.includes('privacy'))
      );
    }
    // Development/best practices questions
    else if (questionLower.includes('development') || questionLower.includes('best') || questionLower.includes('practice')) {
      contextualAnswer = "Your development workflow includes feature experimentation in isolated notebooks, model validation with cross-validation, A/B testing for impact measurement, and gradual rollout with monitoring. All ML code requires comprehensive unit tests, model performance tests, and data validation checks.";
      relevantPages = workspacePages.filter(p => 
        p.title.toLowerCase().includes('development') || p.title.toLowerCase().includes('practice') ||
        p.tags.some(tag => tag.includes('development') || tag.includes('best-practices'))
      );
    }
    // Default response for other questions
    else {
      const randomIndex = Math.floor(Math.random() * mockAnswers.length);
      contextualAnswer = mockAnswers[randomIndex];
      // Select random relevant pages
      relevantPages = workspacePages
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(3, workspacePages.length));
    }
    
    // If no specific pages found, use some random ones
    if (relevantPages.length === 0) {
      relevantPages = workspacePages
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(3, workspacePages.length));
    }
    
    const sources = relevantPages.slice(0, 3).map(page => ({
      pageId: page.id,
      title: page.title,
      relevantContent: page.content.substring(0, 150) + "..."
    }));
    
    return {
      answer: contextualAnswer,
      sources,
      confidence: 0.75 + Math.random() * 0.2 // 0.75-0.95
    };
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