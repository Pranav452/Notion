import { createClient } from './client';
import { aiService } from '../ai/gemini';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  workspace_id: string;
  parent_id?: string;
  title: string;
  content: any; // Tiptap JSON
  content_text?: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  order_index: number;
}

export interface PageLink {
  id: string;
  from_page_id: string;
  to_page_id: string;
  link_type: 'reference' | 'backlink' | 'ai_suggested';
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
}

export class WorkspaceService {
  private supabase = createClient();

  // Workspace operations
  async createWorkspace(name: string, description?: string): Promise<Workspace> {
    try {
      console.log('Creating workspace with name:', name, 'description:', description);
      
      const { data: user, error: userError } = await this.supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user.user) {
        throw new Error('Not authenticated - user object is null');
      }

      console.log('Authenticated user:', user.user.id);

      const { data: workspace, error } = await this.supabase
        .from('workspaces')
        .insert({
          name,
          description,
          created_by: user.user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating workspace:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Created workspace:', workspace);

      // Add user as owner
      const { error: memberError } = await this.supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user.user.id,
          role: 'owner'
        });

      if (memberError) {
        console.error('Error adding workspace member:', memberError);
        throw new Error(`Error adding workspace member: ${memberError.message}`);
      }

      return workspace;
    } catch (error) {
      console.error('Full error in createWorkspace:', error);
      throw error;
    }
  }

  async getWorkspaces(): Promise<Workspace[]> {
    try {
      console.log('Loading workspaces...');
      
      const { data: user, error: userError } = await this.supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user.user) {
        throw new Error('Not authenticated - user object is null');
      }

      const { data, error } = await this.supabase
        .from('workspaces')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Database error loading workspaces:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Loaded workspaces:', data);
      return data || [];
    } catch (error) {
      console.error('Full error in getWorkspaces:', error);
      throw error;
    }
  }

  async getWorkspace(id: string): Promise<Workspace | null> {
    try {
      const { data, error } = await this.supabase
        .from('workspaces')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Database error loading workspace:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Full error in getWorkspace:', error);
      return null;
    }
  }

  // Page operations
  async createPage(
    workspaceId: string,
    title: string = 'Untitled',
    content: any = { type: 'doc', content: [] },
    parentId?: string
  ): Promise<Page> {
    const { data: user } = await this.supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Extract plain text for search and AI
    const contentText = await aiService.extractPlainText(content);

    const { data: page, error } = await this.supabase
      .from('pages')
      .insert({
        workspace_id: workspaceId,
        parent_id: parentId,
        title,
        content,
        content_text: contentText,
        created_by: user.user.id
      })
      .select()
      .single();

    if (error) throw error;

    // Generate AI tags and embeddings
    this.processPageAI(page.id, title, contentText);

    return page;
  }

  async updatePage(pageId: string, updates: Partial<Page>): Promise<Page> {
    // If content is updated, extract plain text
    if (updates.content) {
      updates.content_text = await aiService.extractPlainText(updates.content);
    }

    const { data: page, error } = await this.supabase
      .from('pages')
      .update(updates)
      .eq('id', pageId)
      .select()
      .single();

    if (error) throw error;

    // Update AI processing if content changed
    if (updates.content || updates.title) {
      this.processPageAI(page.id, page.title, page.content_text || '');
    }

    return page;
  }

  async getPages(workspaceId: string): Promise<Page[]> {
    const { data, error } = await this.supabase
      .from('pages')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getPage(pageId: string): Promise<Page | null> {
    const { data, error } = await this.supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .single();

    if (error) return null;
    return data;
  }

  async deletePage(pageId: string): Promise<void> {
    const { error } = await this.supabase
      .from('pages')
      .delete()
      .eq('id', pageId);

    if (error) throw error;
  }

  // Page linking operations
  async createPageLink(fromPageId: string, toPageId: string, linkType: PageLink['link_type'] = 'reference'): Promise<void> {
    const { error } = await this.supabase
      .from('page_links')
      .insert({
        from_page_id: fromPageId,
        to_page_id: toPageId,
        link_type: linkType
      });

    if (error && !error.message.includes('duplicate')) {
      throw error;
    }
  }

  async getPageLinks(pageId: string): Promise<{ outgoing: PageLink[]; incoming: PageLink[] }> {
    const [outgoingResult, incomingResult] = await Promise.all([
      this.supabase
        .from('page_links')
        .select('*')
        .eq('from_page_id', pageId),
      this.supabase
        .from('page_links')
        .select('*')
        .eq('to_page_id', pageId)
    ]);

    return {
      outgoing: outgoingResult.data || [],
      incoming: incomingResult.data || []
    };
  }

  // AI-powered features
  async getSuggestedLinks(pageId: string): Promise<any[]> {
    const page = await this.getPage(pageId);
    if (!page) return [];

    const pages = await this.getPages(page.workspace_id);
    const otherPages = pages.filter(p => p.id !== pageId);

    const suggestions = await aiService.suggestLinks(
      page.content_text || '',
      page.title,
      otherPages.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content_text || ''
      }))
    );

    // Store suggestions in database
    for (const suggestion of suggestions) {
      await this.supabase
        .from('ai_suggestions')
        .upsert({
          page_id: pageId,
          suggestion_type: 'link',
          suggestion_data: suggestion,
          confidence: suggestion.confidence
        });
    }

    return suggestions;
  }

  async generateTags(pageId: string): Promise<any[]> {
    const page = await this.getPage(pageId);
    if (!page) return [];

    const suggestions = await aiService.suggestTags(
      page.content_text || '',
      page.title
    );

    // Store suggestions
    for (const suggestion of suggestions) {
      await this.supabase
        .from('ai_suggestions')
        .upsert({
          page_id: pageId,
          suggestion_type: 'tag',
          suggestion_data: suggestion,
          confidence: suggestion.confidence
        });
    }

    return suggestions;
  }

  async answerQuestion(workspaceId: string, question: string): Promise<any> {
    const pages = await this.getPages(workspaceId);
    
    return await aiService.answerQuestion(
      question,
      pages.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content_text || '',
        tags: p.tags
      }))
    );
  }

  async getKnowledgeGraph(workspaceId: string): Promise<{
    nodes: Array<{ id: string; title: string; type: string }>;
    edges: Array<{ from: string; to: string; type: string }>;
  }> {
    const pages = await this.getPages(workspaceId);
    const pageIds = pages.map(p => p.id);
    
    console.log(`Getting knowledge graph for workspace ${workspaceId} with ${pages.length} pages`);
    
    // Get all links where both from_page_id and to_page_id are in this workspace
    const { data: links, error } = await this.supabase
      .from('page_links')
      .select('*')
      .in('from_page_id', pageIds)
      .in('to_page_id', pageIds);

    if (error) {
      console.error('Error fetching page links:', error);
    }

    console.log(`Found ${links?.length || 0} page links`);

    // If no links exist and we have pages, create some sample links for better demo
    if ((!links || links.length === 0) && pages.length > 1) {
      await this.createSamplePageLinks(pages);
      // Refetch the links
      const { data: newLinks } = await this.supabase
        .from('page_links')
        .select('*')
        .in('from_page_id', pageIds)
        .in('to_page_id', pageIds);
      
      const nodes = pages.map(page => ({
        id: page.id,
        title: page.title,
        type: 'page'
      }));

      const edges = (newLinks || []).map((link: any) => ({
        from: link.from_page_id,
        to: link.to_page_id,
        type: link.link_type
      }));

      return { nodes, edges };
    }

    const nodes = pages.map(page => ({
      id: page.id,
      title: page.title,
      type: 'page'
    }));

    const edges = (links || []).map((link: any) => ({
      from: link.from_page_id,
      to: link.to_page_id,
      type: link.link_type
    }));

    console.log(`Returning ${nodes.length} nodes and ${edges.length} edges`);
    
    return { nodes, edges };
  }

  // Helper method to create sample links for demonstration
  private async createSamplePageLinks(pages: Page[]): Promise<void> {
    try {
      const links = [];
      
      // Create links based on shared tags
      for (let i = 0; i < pages.length; i++) {
        for (let j = i + 1; j < pages.length; j++) {
          const page1 = pages[i];
          const page2 = pages[j];
          
          // Check if pages share tags
          const sharedTags = page1.tags?.filter(tag => page2.tags?.includes(tag)) || [];
          
          if (sharedTags.length > 0) {
            links.push({
              from_page_id: page1.id,
              to_page_id: page2.id,
              link_type: 'reference'
            });
          } else if (Math.random() > 0.6) {
            // Random AI suggested links
            links.push({
              from_page_id: page1.id,
              to_page_id: page2.id,
              link_type: 'ai_suggested'
            });
          }
        }
      }

      // Ensure at least some connections exist
      if (links.length === 0 && pages.length >= 2) {
        // Create a simple chain
        for (let i = 0; i < Math.min(pages.length - 1, 3); i++) {
          links.push({
            from_page_id: pages[i].id,
            to_page_id: pages[i + 1].id,
            link_type: 'reference'
          });
        }
      }

      // Insert the links
      if (links.length > 0) {
        const { error } = await this.supabase
          .from('page_links')
          .insert(links);
        
        if (error && !error.message.includes('duplicate')) {
          console.error('Error creating sample links:', error);
        } else {
          console.log(`Created ${links.length} sample page links`);
        }
      }
    } catch (error) {
      console.error('Error in createSamplePageLinks:', error);
    }
  }

  // Search functionality
  async searchPages(workspaceId: string, query: string): Promise<Page[]> {
    const { data, error } = await this.supabase
      .from('pages')
      .select('*')
      .eq('workspace_id', workspaceId)
      .or(`title.ilike.%${query}%,content_text.ilike.%${query}%,tags.cs.{${query}}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Private methods
  private async processPageAI(pageId: string, title: string, contentText: string): Promise<void> {
    try {
      // Generate and store embedding
      const embedding = await aiService.generateEmbedding(contentText);
      
      await this.supabase
        .from('page_embeddings')
        .upsert({
          page_id: pageId,
          embedding: embedding.values
        });

      // Generate tags automatically
      this.generateTags(pageId);
      
      // Generate link suggestions
      this.getSuggestedLinks(pageId);
    } catch (error) {
      console.error('Error processing page AI:', error);
    }
  }
}

export const workspaceService = new WorkspaceService(); 