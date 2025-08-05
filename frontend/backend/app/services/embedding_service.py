import os
from typing import List, Dict, Any, Optional
import openai
from openai import OpenAI
import tiktoken

class EmbeddingService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        self.model = "text-embedding-3-small"
        self.encoding = tiktoken.get_encoding("cl100k_base")
        self.max_tokens = 8191  # Max tokens for embedding-3-small

    def get_token_count(self, text: str) -> int:
        """Get the number of tokens in a text string"""
        return len(self.encoding.encode(text))

    def chunk_text(self, text: str, chunk_size: int = 1000) -> List[str]:
        """Split text into chunks based on token count"""
        tokens = self.encoding.encode(text)
        chunks = []
        
        for i in range(0, len(tokens), chunk_size):
            chunk = tokens[i:i + chunk_size]
            chunks.append(self.encoding.decode(chunk))
            
        return chunks

    async def get_embeddings(self, texts: List[str]) -> Optional[List[List[float]]]:
        """Generate embeddings for a list of text strings"""
        if not self.client:
            print("OpenAI API key not set")
            # Return mock embeddings in development mode
            if os.getenv("ENVIRONMENT") == "development":
                return [[0.1] * 1536 for _ in texts]
            return None
            
        try:
            # Check token counts and chunk if necessary
            processed_texts = []
            for text in texts:
                if self.get_token_count(text) > self.max_tokens:
                    chunks = self.chunk_text(text, self.max_tokens)
                    processed_texts.extend(chunks)
                else:
                    processed_texts.append(text)
                    
            response = self.client.embeddings.create(
                model=self.model,
                input=processed_texts
            )
            
            return [item.embedding for item in response.data]
            
        except Exception as e:
            print(f"Error generating embeddings: {str(e)}")
            # Return mock embeddings in development mode
            if os.getenv("ENVIRONMENT") == "development":
                return [[0.1] * 1536 for _ in texts]
            return None

# Singleton instance
embedding_service = EmbeddingService()