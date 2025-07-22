
export interface PublishedAgent {
  id: string;
  name: string;
  description?: string;
  category: 'business' | 'creative' | 'technical' | 'educational';
  author_id: string;
  workflow_definition: any; // Complete workflow JSON
  price_type: 'free' | 'one_time' | 'subscription';
  price_amount?: number;
  downloads_count: number;
  rating_average: number;
  rating_count: number;
  is_featured: boolean;
  is_approved: boolean;
  tags: string[];
  preview_images: string[];
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface AgentReview {
  id: string;
  agent_id: string;
  user_id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface AgentDownload {
  id: string;
  agent_id: string;
  user_id: string;
  download_type: 'free' | 'purchased';
  transaction_id?: string;
  downloaded_at: string;
  agent?: PublishedAgent;
}

export interface AgentFavorite {
  id: string;
  agent_id: string;
  user_id: string;
  created_at: string;
  agent?: PublishedAgent;
}

export interface AgentSearchFilters {
  category?: string;
  priceType?: 'free' | 'paid' | 'all';
  rating?: number;
  tags?: string[];
  sortBy?: 'popular' | 'recent' | 'rating' | 'name';
  searchQuery?: string;
}

export interface AgentUploadData {
  name: string;
  description: string;
  category: 'business' | 'creative' | 'technical' | 'educational';
  workflow_definition: any;
  price_type: 'free' | 'one_time' | 'subscription';
  price_amount?: number;
  tags: string[];
  preview_images?: string[];
}
