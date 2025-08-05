
-- Module 4: Agent Store - Community Marktplatz

-- Veröffentlichte Agenten
CREATE TABLE published_agents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text, -- 'business', 'creative', 'technical', 'educational'
  author_id uuid REFERENCES auth.users(id),
  workflow_definition jsonb, -- Exportiertes Workflow JSON
  price_type text DEFAULT 'free', -- 'free', 'one_time', 'subscription'
  price_amount decimal(10,2),
  downloads_count integer DEFAULT 0,
  rating_average decimal(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  tags text[],
  preview_images text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Agent-Bewertungen
CREATE TABLE agent_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid REFERENCES published_agents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(agent_id, user_id)
);

-- Downloads/Käufe
CREATE TABLE agent_downloads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid REFERENCES published_agents(id),
  user_id uuid REFERENCES auth.users(id),
  download_type text, -- 'free', 'purchased'
  transaction_id text, -- Für Zahlungen
  downloaded_at timestamp with time zone DEFAULT now()
);

-- Agent-Favoriten
CREATE TABLE agent_favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid REFERENCES published_agents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(agent_id, user_id)
);

-- RLS Policies
ALTER TABLE published_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_favorites ENABLE ROW LEVEL SECURITY;

-- Published agents are publicly viewable, only authors can edit
CREATE POLICY "Published agents are viewable by everyone" ON published_agents
FOR SELECT USING (is_approved = true);

CREATE POLICY "Authors can manage their agents" ON published_agents
FOR ALL USING (auth.uid() = author_id);

-- Reviews are viewable by everyone, users can manage their own reviews
CREATE POLICY "Reviews are viewable by everyone" ON agent_reviews
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reviews" ON agent_reviews
FOR ALL USING (auth.uid() = user_id);

-- Downloads are private to the user
CREATE POLICY "Users can view their own downloads" ON agent_downloads
FOR ALL USING (auth.uid() = user_id);

-- Favorites are private to the user
CREATE POLICY "Users can manage their own favorites" ON agent_favorites
FOR ALL USING (auth.uid() = user_id);

-- Functions for statistics
CREATE OR REPLACE FUNCTION update_agent_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE published_agents 
  SET 
    rating_average = (
      SELECT AVG(rating)::decimal(3,2) 
      FROM agent_reviews 
      WHERE agent_id = COALESCE(NEW.agent_id, OLD.agent_id)
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM agent_reviews 
      WHERE agent_id = COALESCE(NEW.agent_id, OLD.agent_id)
    )
  WHERE id = COALESCE(NEW.agent_id, OLD.agent_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agent_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON agent_reviews
  FOR EACH ROW EXECUTE FUNCTION update_agent_rating();

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE published_agents 
  SET downloads_count = downloads_count + 1
  WHERE id = NEW.agent_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_download_count_trigger
  AFTER INSERT ON agent_downloads
  FOR EACH ROW EXECUTE FUNCTION increment_download_count();
