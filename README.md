# AI Knowledge Workspace - Demo Version

A Notion-like AI-powered knowledge management system built with Next.js, Supabase, and **simulated AI capabilities**. This demo showcases intelligent auto-linking, semantic search, and visual knowledge graphs using mock data.

> **🎭 Demo Mode**: This version uses realistic mock AI responses instead of real API calls to provide a seamless demonstration experience.

## ✨ Features

### 🤖 Simulated AI Intelligence
- **AI Auto-Linker**: Demonstrates automatic page connection suggestions
- **Smart Tagging**: Shows AI-generated semantic tags for organization
- **Question Answering**: Simulates natural language questions about your workspace
- **Knowledge Graph**: Interactive visualization of document relationships

### 📝 Rich Content Creation
- **Rich Text Editor**: Tiptap-based editor with simulated AI suggestions
- **Real-time Linking**: Instant suggestions for related content
- **Hierarchical Pages**: Organize pages with parent-child relationships
- **Draft & Publish**: Status management for your content

### 🔍 Smart Discovery
- **Semantic Search**: Find content based on meaning, not just keywords
- **Tag-based Filtering**: Organize and filter by AI-generated tags
- **Similarity Matching**: Discover related content automatically
- **Full-text Search**: Traditional search capabilities

### 👥 Collaboration (Ready for Team Features)
- **Workspace Sharing**: Multi-user workspace support
- **Role Management**: Owner, admin, member permissions
- **Real-time Updates**: Live collaboration features ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- A Supabase account

### 1. Clone and Install
```bash
git clone <your-repo>
cd with-supabase-app
npm install
```

### 2. Set Up Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration (Already configured for this project)
NEXT_PUBLIC_SUPABASE_URL=https://xnfvhqwfbciczpfieiew.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.CJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZnZocXdmYmNpY3pwZmllaWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1MTE5MzUsImV4cCI6MjA1MzA4NzkzNX0.7MrsYn1qJPBj5wfMTJdCYKDVd7x-_oFg9c4xU4kI_ts

# Demo Mode - No API key needed
# GEMINI_API_KEY=demo_mode_no_api_needed
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## 📖 How to Use

### 1. Sign Up / Sign In
- Visit the landing page
- Click "Get Started" to create an account
- Or "Sign In" if you already have one

### 2. Explore the Demo Workspace
- After signing in, you'll see the "AI Product Strategy Hub" workspace
- This contains realistic demo content across multiple domains
- All AI features work with convincing mock responses

### 3. Experience AI Features
- **Editor Tab**: Write and edit with simulated AI suggestions
- **Graph Tab**: Visualize knowledge connections
- **AI Assistant Tab**: Ask questions and get intelligent responses

## 🎭 Demo Features

### Mock AI Responses
- **Link Suggestions**: Realistic suggestions between related pages
- **Tag Generation**: Contextual tags based on content themes
- **Question Answering**: Intelligent responses using workspace content
- **Processing Delays**: Simulated API response times for realism

### Pre-loaded Content
The demo includes a comprehensive knowledge base with:
- AI Strategy documentation
- Technical architecture designs
- User research insights
- Development best practices
- Security guidelines
- Performance metrics

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **AI Simulation**: Custom mock service (replaces Google Gemini)
- **Editor**: Tiptap (Rich text editing)
- **Visualization**: React Flow (Knowledge graphs)
- **UI Components**: shadcn/ui

### Database Schema
- **workspaces**: User workspaces
- **pages**: Individual pages with content
- **page_links**: Connections between pages
- **workspace_members**: User permissions
- **page_embeddings**: Mock vector embeddings
- **ai_suggestions**: Simulated AI suggestions

## 🔧 Converting to Production

To use real AI capabilities:

1. **Install Gemini AI package**:
   ```bash
   npm install @google/generative-ai
   ```

2. **Get Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create and configure your API key

3. **Replace mock service**:
   - Update `lib/ai/gemini.ts` with real Gemini integration
   - Remove mock delay functions
   - Implement real vector embeddings

4. **Update environment**:
   ```env
   GEMINI_API_KEY=your_real_api_key_here
   ```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key_for_production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the backend infrastructure
- [Google AI](https://ai.google.dev/) for Gemini AI capabilities (production)
- [Tiptap](https://tiptap.dev/) for the rich text editor
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components

---

**Ready to experience the future of AI-powered knowledge management?** 🎭

This demo showcases the full potential of intelligent content organization without requiring any API keys or external dependencies!
