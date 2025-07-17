-- Enable Row Level Security on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_links ENABLE ROW LEVEL SECURITY;

-- Workspaces policies
CREATE POLICY "Users can view workspaces they are members of" ON workspaces
    FOR SELECT USING (
        id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create workspaces" ON workspaces
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Workspace owners can update their workspaces" ON workspaces
    FOR UPDATE USING (
        id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Workspace owners can delete their workspaces" ON workspaces
    FOR DELETE USING (
        id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Workspace members policies
CREATE POLICY "Users can view workspace members of their workspaces" ON workspace_members
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace owners can manage members" ON workspace_members
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Pages policies
CREATE POLICY "Users can view pages in their workspaces" ON pages
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create pages in their workspaces" ON pages
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid()
        ) AND auth.uid() = created_by
    );

CREATE POLICY "Users can update pages they created or in workspaces they admin" ON pages
    FOR UPDATE USING (
        created_by = auth.uid() OR
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can delete pages they created or in workspaces they admin" ON pages
    FOR DELETE USING (
        created_by = auth.uid() OR
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Page links policies
CREATE POLICY "Users can view page links in their workspaces" ON page_links
    FOR SELECT USING (
        from_page_id IN (
            SELECT id FROM pages WHERE workspace_id IN (
                SELECT workspace_id FROM workspace_members 
                WHERE user_id = auth.uid()
            )
        ) AND to_page_id IN (
            SELECT id FROM pages WHERE workspace_id IN (
                SELECT workspace_id FROM workspace_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create page links in their workspaces" ON page_links
    FOR INSERT WITH CHECK (
        from_page_id IN (
            SELECT id FROM pages WHERE workspace_id IN (
                SELECT workspace_id FROM workspace_members 
                WHERE user_id = auth.uid()
            )
        ) AND to_page_id IN (
            SELECT id FROM pages WHERE workspace_id IN (
                SELECT workspace_id FROM workspace_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete page links in their workspaces" ON page_links
    FOR DELETE USING (
        from_page_id IN (
            SELECT id FROM pages WHERE workspace_id IN (
                SELECT workspace_id FROM workspace_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- AI suggestions policies
CREATE POLICY "Users can view AI suggestions for their pages" ON ai_suggestions
    FOR SELECT USING (
        page_id IN (
            SELECT id FROM pages WHERE workspace_id IN (
                SELECT workspace_id FROM workspace_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "System can create AI suggestions" ON ai_suggestions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update AI suggestions for their pages" ON ai_suggestions
    FOR UPDATE USING (
        page_id IN (
            SELECT id FROM pages WHERE workspace_id IN (
                SELECT workspace_id FROM workspace_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Page embeddings policies
CREATE POLICY "Users can view embeddings for their pages" ON page_embeddings
    FOR SELECT USING (
        page_id IN (
            SELECT id FROM pages WHERE workspace_id IN (
                SELECT workspace_id FROM workspace_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "System can manage page embeddings" ON page_embeddings
    FOR ALL WITH CHECK (true);

-- Knowledge nodes policies
CREATE POLICY "Users can view knowledge nodes in their workspaces" ON knowledge_nodes
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage knowledge nodes in their workspaces" ON knowledge_nodes
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid()
        )
    );

-- Knowledge links policies
CREATE POLICY "Users can view knowledge links in their workspaces" ON knowledge_links
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage knowledge links in their workspaces" ON knowledge_links
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid()
        )
    ); 