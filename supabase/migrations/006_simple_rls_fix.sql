-- Temporarily disable RLS on problematic tables
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies completely
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Create VERY simple policies without ANY circular dependencies
-- Workspaces: Only allow users to see workspaces they created
CREATE POLICY "Users can manage their own workspaces" ON workspaces
    FOR ALL USING (created_by = auth.uid());

-- Workspace members: Simple ownership-based access
CREATE POLICY "Workspace creators can manage members" ON workspace_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workspaces 
            WHERE id = workspace_id 
            AND created_by = auth.uid()
        )
    );

-- Allow users to see their own membership
CREATE POLICY "Users can see their own memberships" ON workspace_members
    FOR SELECT USING (user_id = auth.uid());

-- Re-apply simple policies for other tables
CREATE POLICY "Users can manage pages in their workspaces" ON pages
    FOR ALL USING (
        created_by = auth.uid() OR
        workspace_id IN (
            SELECT id FROM workspaces WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can manage page links for their pages" ON page_links
    FOR ALL USING (
        from_page_id IN (
            SELECT id FROM pages WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can manage AI suggestions for their pages" ON ai_suggestions
    FOR ALL USING (
        page_id IN (
            SELECT id FROM pages WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can manage embeddings for their pages" ON page_embeddings
    FOR ALL USING (
        page_id IN (
            SELECT id FROM pages WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can manage knowledge nodes in their workspaces" ON knowledge_nodes
    FOR ALL USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can manage knowledge links in their workspaces" ON knowledge_links
    FOR ALL USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE created_by = auth.uid()
        )
    ); 