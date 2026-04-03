"""
Vector Store for RAG (Retrieval Augmented Generation).
Uses ChromaDB for storing and querying document embeddings.
If ChromaDB is not installed, falls back to a simple in-memory store.
"""

import hashlib
from dataclasses import dataclass, field


@dataclass
class Document:
    """A document chunk for the vector store."""
    id: str
    content: str
    metadata: dict = field(default_factory=dict)
    source: str = ""
    doc_type: str = ""  # earnings_call, filing, news, balance_sheet


class VectorStore:
    """ChromaDB-backed vector store with in-memory fallback."""

    def __init__(self, collection_name: str = "finpilot"):
        self.collection_name = collection_name
        self._chroma_client = None
        self._collection = None
        self._fallback_store: list[Document] = []
        self._use_fallback = False
        self._init_store()

    def _init_store(self):
        try:
            import chromadb
            self._chroma_client = chromadb.Client()
            self._collection = self._chroma_client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"},
            )
        except ImportError:
            self._use_fallback = True
        except Exception:
            self._use_fallback = True

    def add_documents(self, documents: list[Document]):
        """Add documents to the vector store."""
        if self._use_fallback:
            self._fallback_store.extend(documents)
            return

        ids = [doc.id for doc in documents]
        contents = [doc.content for doc in documents]
        metadatas = [
            {**doc.metadata, "source": doc.source, "doc_type": doc.doc_type}
            for doc in documents
        ]
        self._collection.upsert(ids=ids, documents=contents, metadatas=metadatas)

    def query(self, query_text: str, n_results: int = 5, doc_type: str | None = None) -> list[Document]:
        """Query the vector store for relevant documents."""
        if self._use_fallback:
            return self._fallback_query(query_text, n_results, doc_type)

        where_filter = {"doc_type": doc_type} if doc_type else None
        results = self._collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where=where_filter,
        )

        docs = []
        if results and results.get("documents"):
            for i, content in enumerate(results["documents"][0]):
                meta = results["metadatas"][0][i] if results.get("metadatas") else {}
                doc_id = results["ids"][0][i] if results.get("ids") else str(i)
                docs.append(Document(
                    id=doc_id,
                    content=content,
                    metadata=meta,
                    source=meta.get("source", ""),
                    doc_type=meta.get("doc_type", ""),
                ))
        return docs

    def _fallback_query(self, query_text: str, n_results: int, doc_type: str | None) -> list[Document]:
        """Simple keyword-based fallback when ChromaDB isn't available."""
        query_words = set(query_text.lower().split())
        scored = []
        for doc in self._fallback_store:
            if doc_type and doc.doc_type != doc_type:
                continue
            doc_words = set(doc.content.lower().split())
            overlap = len(query_words & doc_words)
            if overlap > 0:
                scored.append((overlap, doc))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored[:n_results]]

    def delete_by_source(self, source: str):
        """Delete all documents from a specific source."""
        if self._use_fallback:
            self._fallback_store = [d for d in self._fallback_store if d.source != source]
            return
        # ChromaDB doesn't support delete by metadata easily, so we query and delete by ID
        try:
            results = self._collection.get(where={"source": source})
            if results and results.get("ids"):
                self._collection.delete(ids=results["ids"])
        except Exception:
            pass

    @property
    def count(self) -> int:
        if self._use_fallback:
            return len(self._fallback_store)
        try:
            return self._collection.count()
        except Exception:
            return 0


# Singleton instance
_store: VectorStore | None = None


def get_vector_store() -> VectorStore:
    global _store
    if _store is None:
        _store = VectorStore()
    return _store
