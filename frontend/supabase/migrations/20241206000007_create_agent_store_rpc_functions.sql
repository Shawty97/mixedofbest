
-- RPC Functions for Agent Store to bypass TypeScript type issues

-- Get published agents with sorting
CREATE OR REPLACE FUNCTION get_published_agents(sort_by text DEFAULT 'popular')
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  category text,
  author_id uuid,
  workflow_definition jsonb,
  price_type text,
  price_amount decimal,
  downloads_count integer,
  rating_average decimal,
  rating_count integer,
  is_featured boolean,
  is_approved boolean,
  tags text[],
  preview_images text[],
  created_at timestamptz,
  updated_at timestamptz,
  author jsonb
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.id,
    pa.name,
    pa.description,
    pa.category,
    pa.author_id,
    pa.workflow_definition,
    pa.price_type,
    pa.price_amount,
    pa.downloads_count,
    pa.rating_average,
    pa.rating_count,
    pa.is_featured,
    pa.is_approved,
    pa.tags,
    pa.preview_images,
    pa.created_at,
    pa.updated_at,
    jsonb_build_object(
      'id', p.id,
      'email', p.email,
      'full_name', p.full_name
    ) as author
  FROM published_agents pa
  LEFT JOIN profiles p ON pa.author_id = p.id
  WHERE pa.is_approved = true
  ORDER BY 
    CASE 
      WHEN sort_by = 'popular' THEN pa.downloads_count
      WHEN sort_by = 'rating' THEN pa.rating_average
      WHEN sort_by = 'recent' THEN EXTRACT(EPOCH FROM pa.created_at)
      ELSE EXTRACT(EPOCH FROM pa.created_at)
    END DESC;
END;
$$;

-- Get user favorites
CREATE OR REPLACE FUNCTION get_user_favorites(user_id uuid)
RETURNS TABLE (agent_id uuid) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT af.agent_id 
  FROM agent_favorites af
  WHERE af.user_id = get_user_favorites.user_id;
END;
$$;

-- Add agent to favorites
CREATE OR REPLACE FUNCTION add_agent_favorite(p_agent_id uuid, p_user_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO agent_favorites (agent_id, user_id)
  VALUES (p_agent_id, p_user_id)
  ON CONFLICT (agent_id, user_id) DO NOTHING;
END;
$$;

-- Remove agent from favorites
CREATE OR REPLACE FUNCTION remove_agent_favorite(p_agent_id uuid, p_user_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM agent_favorites 
  WHERE agent_id = p_agent_id AND user_id = p_user_id;
END;
$$;

-- Download agent
CREATE OR REPLACE FUNCTION download_agent(p_agent_id uuid, p_user_id uuid, p_download_type text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO agent_downloads (agent_id, user_id, download_type)
  VALUES (p_agent_id, p_user_id, p_download_type);
END;
$$;
