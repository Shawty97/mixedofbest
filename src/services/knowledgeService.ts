import { supabase } from '@/integrations/supabase/client';

interface EmbedKnowledgeParams {
  text: string;
  title?: string;
  metadata?: Record<string, any>;
}

interface SearchKnowledgeParams {
  query: string;
  limit?: number;
  threshold?: number;
}

export const knowledgeAPI = {
  // Embed text into knowledge base
  embed: async ({ text, title, metadata }: EmbedKnowledgeParams) => {
    const { data, error } = await supabase.functions.invoke('knowledge-embed', {
      body: { text, title, metadata }
    });
    
    if (error) throw error;
    return data;
  },

  // Search knowledge base
  search: async ({ query, limit = 10, threshold = 0.78 }: SearchKnowledgeParams) => {
    const { data, error } = await supabase.functions.invoke('knowledge-search', {
      body: { query, limit, threshold }
    });
    
    if (error) throw error;
    return data;
  },

  // Get user's knowledge documents
  getDocuments: async () => {
    const { data, error } = await supabase
      .from('knowledge_documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Delete a knowledge document
  deleteDocument: async (documentId: string) => {
    const { error } = await supabase
      .from('knowledge_documents')
      .delete()
      .eq('id', documentId);
    
    if (error) throw error;
  }
};