from typing import List, Optional, Dict, Any
import os
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import Distance, VectorParams

class QdrantService:
    def __init__(self):
        self.client = QdrantClient(
            os.getenv("QDRANT_URL", "http://localhost:6333"),
            api_key=os.getenv("QDRANT_API_KEY")
        )
        self.collection_name = os.getenv("QDRANT_COLLECTION", "agents")

    async def init_collection(self, dimension: int = 1536):
        """Initialize the vector collection if it doesn't exist"""
        try:
            collections = self.client.get_collections()
            if not any(c.name == self.collection_name for c in collections.collections):
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(size=dimension, distance=Distance.COSINE)
                )
                return True
        except Exception as e:
            print(f"Error initializing collection: {str(e)}")
            return False

    async def upsert_vectors(
        self,
        vectors: List[List[float]],
        ids: List[str],
        payloads: Optional[List[Dict[str, Any]]] = None
    ):
        """Insert or update vectors in the collection"""
        try:
            points = []
            for i, vector in enumerate(vectors):
                point = models.PointStruct(
                    id=ids[i],
                    vector=vector,
                    payload=payloads[i] if payloads else None
                )
                points.append(point)

            operation_info = self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
            return True, operation_info
        except Exception as e:
            print(f"Error upserting vectors: {str(e)}")
            return False, str(e)

    async def search_vectors(
        self,
        query_vector: List[float],
        limit: int = 5,
        filter: Optional[Dict[str, Any]] = None
    ):
        """Search for similar vectors"""
        try:
            search_result = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=limit,
                query_filter=filter
            )
            return search_result
        except Exception as e:
            print(f"Error searching vectors: {str(e)}")
            return []

    async def delete_vectors(self, ids: List[str]):
        """Delete vectors by their IDs"""
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.PointIdsList(
                    points=ids
                )
            )
            return True
        except Exception as e:
            print(f"Error deleting vectors: {str(e)}")
            return False

    async def get_vectors(self, ids: List[str]):
        """Retrieve vectors by their IDs"""
        try:
            return self.client.retrieve(
                collection_name=self.collection_name,
                ids=ids
            )
        except Exception as e:
            print(f"Error retrieving vectors: {str(e)}")
            return []
            
    async def delete_collection(self, collection_name: Optional[str] = None):
        """Delete an entire collection"""
        try:
            coll_name = collection_name or self.collection_name
            self.client.delete_collection(collection_name=coll_name)
            return True
        except Exception as e:
            print(f"Error deleting collection: {str(e)}")
            return False

# Singleton instance
qdrant_service = QdrantService()