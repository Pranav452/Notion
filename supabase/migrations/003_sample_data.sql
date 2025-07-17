-- Insert sample workspace (note: this will only work after a user is authenticated)
-- This migration will be run manually or through the application

-- Sample workspace data for demonstration
-- You can run these INSERT statements after creating your first user account

-- Example workspace
-- INSERT INTO workspaces (id, name, description, type, created_by) 
-- VALUES (
--     'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
--     'AI Product Strategy Hub',
--     'Comprehensive workspace for AI product development and strategy',
--     'project',
--     'your-user-id-here'
-- );

-- Example workspace member
-- INSERT INTO workspace_members (workspace_id, user_id, role)
-- VALUES (
--     'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
--     'your-user-id-here',
--     'owner'
-- );

-- Example pages
-- INSERT INTO pages (id, workspace_id, title, content, content_text, status, tags, created_by) VALUES
-- ('11111111-2222-3333-4444-555555555555', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'AI Strategy Overview', 
--  '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"AI Strategy Overview"}]},{"type":"paragraph","content":[{"type":"text","text":"This document outlines our comprehensive AI strategy for the upcoming quarters."}]}]}',
--  'AI Strategy Overview This document outlines our comprehensive AI strategy for the upcoming quarters.',
--  'published', 
--  ARRAY['ai', 'strategy', 'planning'], 
--  'your-user-id-here'
-- ),
-- ('22222222-3333-4444-5555-666666666666', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Technical Architecture', 
--  '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Technical Architecture"}]},{"type":"paragraph","content":[{"type":"text","text":"Our AI platform architecture leverages modern cloud-native technologies."}]}]}',
--  'Technical Architecture Our AI platform architecture leverages modern cloud-native technologies.',
--  'published', 
--  ARRAY['architecture', 'technical', 'ai'], 
--  'your-user-id-here'
-- );

-- Example page links
-- INSERT INTO page_links (from_page_id, to_page_id, link_type) VALUES
-- ('11111111-2222-3333-4444-555555555555', '22222222-3333-4444-5555-666666666666', 'reference');

-- Function to create sample data for a user (call this after user signup)
CREATE OR REPLACE FUNCTION create_sample_workspace_for_user(user_id UUID)
RETURNS UUID AS $$
DECLARE
    workspace_id UUID;
    page1_id UUID;
    page2_id UUID;
    page3_id UUID;
    page4_id UUID;
BEGIN
    -- Create sample workspace
    INSERT INTO workspaces (name, description, type, created_by)
    VALUES (
        'AI Product Strategy Hub',
        'Comprehensive workspace for AI product development and strategy',
        'project',
        user_id
    ) RETURNING id INTO workspace_id;
    
    -- Add user as workspace owner
    INSERT INTO workspace_members (workspace_id, user_id, role)
    VALUES (workspace_id, user_id, 'owner');
    
    -- Create sample pages
    INSERT INTO pages (workspace_id, title, content, content_text, status, tags, created_by)
    VALUES (
        workspace_id,
        'AI Strategy Overview',
        '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"AI Strategy Overview"}]},{"type":"paragraph","content":[{"type":"text","text":"This document outlines our comprehensive AI strategy for the upcoming quarters. Our focus areas include machine learning model development, data infrastructure, and user experience optimization."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Key Objectives"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Develop robust AI models"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Implement scalable data pipelines"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Enhance user experience with AI features"}]}]}]}]}',
        'AI Strategy Overview This document outlines our comprehensive AI strategy for the upcoming quarters. Our focus areas include machine learning model development, data infrastructure, and user experience optimization.',
        'published',
        ARRAY['ai', 'strategy', 'planning', 'overview'],
        user_id
    ) RETURNING id INTO page1_id;
    
    INSERT INTO pages (workspace_id, title, content, content_text, status, tags, created_by)
    VALUES (
        workspace_id,
        'Technical Architecture',
        '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Technical Architecture"}]},{"type":"paragraph","content":[{"type":"text","text":"Our AI platform architecture leverages modern cloud-native technologies including Kubernetes, microservices, and vector databases for optimal performance and scalability."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Core Components"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Vector Database for embeddings"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"API Gateway for service orchestration"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Real-time processing pipeline"}]}]}]}]}',
        'Technical Architecture Our AI platform architecture leverages modern cloud-native technologies including Kubernetes, microservices, and vector databases for optimal performance and scalability.',
        'published',
        ARRAY['architecture', 'technical', 'ai', 'infrastructure'],
        user_id
    ) RETURNING id INTO page2_id;
    
    INSERT INTO pages (workspace_id, title, content, content_text, status, tags, created_by)
    VALUES (
        workspace_id,
        'User Research Insights',
        '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"User Research Insights"}]},{"type":"paragraph","content":[{"type":"text","text":"Key findings from our latest user research sessions reveal important patterns in how users interact with AI-powered knowledge systems."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Main Findings"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Users prefer contextual AI suggestions"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Visual knowledge graphs enhance understanding"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Real-time collaboration is essential"}]}]}]}]}',
        'User Research Insights Key findings from our latest user research sessions reveal important patterns in how users interact with AI-powered knowledge systems.',
        'published',
        ARRAY['research', 'users', 'insights', 'ai'],
        user_id
    ) RETURNING id INTO page3_id;
    
    INSERT INTO pages (workspace_id, title, content, content_text, status, tags, created_by)
    VALUES (
        workspace_id,
        'Development Roadmap',
        '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Development Roadmap"}]},{"type":"paragraph","content":[{"type":"text","text":"Our development roadmap for the next 6 months focuses on core AI capabilities, user experience improvements, and platform scalability."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Q1 Milestones"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"AI auto-linking system"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Enhanced knowledge graph visualization"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Real-time collaboration features"}]}]}]}]}',
        'Development Roadmap Our development roadmap for the next 6 months focuses on core AI capabilities, user experience improvements, and platform scalability.',
        'draft',
        ARRAY['roadmap', 'development', 'planning', 'milestones'],
        user_id
    ) RETURNING id INTO page4_id;
    
    -- Create sample page links
    INSERT INTO page_links (from_page_id, to_page_id, link_type) VALUES
    (page1_id, page2_id, 'reference'),
    (page1_id, page4_id, 'reference'),
    (page2_id, page3_id, 'ai_suggested'),
    (page3_id, page4_id, 'reference');
    
    -- Create sample AI suggestions
    INSERT INTO ai_suggestions (page_id, suggestion_type, suggestion_data, confidence) VALUES
    (page1_id, 'tag', '{"tag": "machine-learning", "reason": "Content discusses ML model development"}', 0.85),
    (page2_id, 'link', '{"target_page": "' || page3_id || '", "reason": "User research insights relate to technical architecture"}', 0.78),
    (page3_id, 'tag', '{"tag": "ux-research", "reason": "Focus on user experience patterns"}', 0.92);
    
    RETURN workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 