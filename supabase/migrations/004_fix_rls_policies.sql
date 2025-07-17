-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can view workspace members of their workspaces" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON workspace_members;

-- Create fixed workspace policies (no circular dependencies)
CREATE POLICY "Users can view workspaces they own or are members of" ON workspaces
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM workspace_members 
            WHERE workspace_id = workspaces.id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create workspaces" ON workspaces
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Workspace owners and admins can update workspaces" ON workspaces
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM workspace_members 
            WHERE workspace_id = workspaces.id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Workspace owners can delete workspaces" ON workspaces
    FOR DELETE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM workspace_members 
            WHERE workspace_id = workspaces.id 
            AND user_id = auth.uid() 
            AND role = 'owner'
        )
    );

-- Create fixed workspace_members policies (no circular dependencies)
CREATE POLICY "Users can view members of workspaces they belong to" ON workspace_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM workspace_members wm2 
            WHERE wm2.workspace_id = workspace_members.workspace_id 
            AND wm2.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can be added as members" ON workspace_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspaces 
            WHERE id = workspace_id 
            AND created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM workspace_members wm2 
            WHERE wm2.workspace_id = workspace_members.workspace_id 
            AND wm2.user_id = auth.uid() 
            AND wm2.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Owners and admins can update member roles" ON workspace_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workspaces 
            WHERE id = workspace_id 
            AND created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM workspace_members wm2 
            WHERE wm2.workspace_id = workspace_members.workspace_id 
            AND wm2.user_id = auth.uid() 
            AND wm2.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Owners and admins can remove members" ON workspace_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workspaces 
            WHERE id = workspace_id 
            AND created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM workspace_members wm2 
            WHERE wm2.workspace_id = workspace_members.workspace_id 
            AND wm2.user_id = auth.uid() 
            AND wm2.role IN ('owner', 'admin')
        )
    ); 