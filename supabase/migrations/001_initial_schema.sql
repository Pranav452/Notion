-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create enum types
CREATE TYPE workspace_type AS ENUM ('personal', 'team', 'project', 'department', 'other');
CREATE TYPE page_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE link_type AS ENUM ('reference', 'backlink', 'ai_suggested');
CREATE TYPE suggestion_type AS ENUM ('link', 'tag', 'content');

-- Create workspaces table
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type workspace_type DEFAULT 'other',
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace_members table
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role member_role DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- Create pages table
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES pages(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Untitled',
    content JSONB DEFAULT '{"type": "doc", "content": []}',
    content_text TEXT,
    status page_status DEFAULT 'draft',
    tags TEXT[] DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page_links table
CREATE TABLE page_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    to_page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    link_type link_type DEFAULT 'reference',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_page_id, to_page_id)
);

-- Create ai_suggestions table
CREATE TABLE ai_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    suggestion_type suggestion_type NOT NULL,
    suggestion_data JSONB NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 0.5,
    applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page_embeddings table (for AI vector search)
CREATE TABLE page_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE UNIQUE,
    embedding VECTOR(1536), -- OpenAI embedding dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_nodes table (alternative knowledge graph approach)
CREATE TABLE knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'concept',
    properties JSONB DEFAULT '{}',
    position_x DECIMAL,
    position_y DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_links table (alternative knowledge graph approach)
CREATE TABLE knowledge_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    source_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    target_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    relationship_type TEXT DEFAULT 'relates_to',
    weight DECIMAL DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_id, target_id)
);

-- Create indexes for better performance
CREATE INDEX idx_workspaces_created_by ON workspaces(created_by);
CREATE INDEX idx_workspaces_updated_at ON workspaces(updated_at);
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_pages_workspace_id ON pages(workspace_id);
CREATE INDEX idx_pages_parent_id ON pages(parent_id);
CREATE INDEX idx_pages_created_by ON pages(created_by);
CREATE INDEX idx_pages_updated_at ON pages(updated_at);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_content_text ON pages USING gin(to_tsvector('english', content_text));
CREATE INDEX idx_pages_tags ON pages USING gin(tags);
CREATE INDEX idx_page_links_from_page ON page_links(from_page_id);
CREATE INDEX idx_page_links_to_page ON page_links(to_page_id);
CREATE INDEX idx_ai_suggestions_page_id ON ai_suggestions(page_id);
CREATE INDEX idx_knowledge_nodes_workspace_id ON knowledge_nodes(workspace_id);
CREATE INDEX idx_knowledge_links_workspace_id ON knowledge_links(workspace_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_page_embeddings_updated_at
    BEFORE UPDATE ON page_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_knowledge_nodes_updated_at
    BEFORE UPDATE ON knowledge_nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at(); 