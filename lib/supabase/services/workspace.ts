import { createClient } from '@supabase/supabase-js';

export class WorkspaceService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async getKnowledgeGraph(workspaceId: string) {
    try {
      // Fetch nodes
      const { data: nodes, error: nodesError } = await this.supabase
        .from('knowledge_nodes')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (nodesError) throw nodesError;

      // Fetch links
      const { data: links, error: linksError } = await this.supabase
        .from('knowledge_links')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (linksError) throw linksError;

      return {
        data: {
          nodes: nodes || [],
          links: links || []
        },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'An error occurred while fetching the knowledge graph'
        }
      };
    }
  }
} 