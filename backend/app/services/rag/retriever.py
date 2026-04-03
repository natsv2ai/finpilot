"""
RAG Retriever — Retrieval Augmented Generation for stock analysis.
Combines vector store retrieval with LLM synthesis.
"""

import hashlib
from app.services.rag.vectorstore import Document, get_vector_store
from app.services.llm.llm_registry import get_provider


def ingest_earnings_call(symbol: str, call_data: dict):
    """Ingest an earnings call transcript into the vector store."""
    store = get_vector_store()
    doc_id = hashlib.md5(f"{symbol}_{call_data.get('date', '')}".encode()).hexdigest()
    content = f"""
Earnings Call: {symbol}
Date: {call_data.get('date', 'N/A')}
Summary: {call_data.get('summary', '')}
Key Promises: {', '.join(call_data.get('promises', []))}
Delivery Status: {call_data.get('delivery', 'N/A')}
Highlights: {', '.join(call_data.get('highlights', []))}
""".strip()

    store.add_documents([Document(
        id=doc_id,
        content=content,
        source=symbol,
        doc_type="earnings_call",
        metadata={"symbol": symbol, "date": call_data.get("date", "")},
    )])


def ingest_balance_sheet(symbol: str, quarterly: list[dict], yearly: list[dict]):
    """Ingest balance sheet data into the vector store."""
    store = get_vector_store()

    # Quarterly
    for i, q in enumerate(quarterly):
        doc_id = hashlib.md5(f"{symbol}_q_{i}".encode()).hexdigest()
        content = f"Balance Sheet Quarterly - {symbol}\n" + "\n".join(f"{k}: {v}" for k, v in q.items())
        store.add_documents([Document(
            id=doc_id, content=content, source=symbol,
            doc_type="balance_sheet", metadata={"symbol": symbol, "period": "quarterly"},
        )])

    # Yearly
    for i, y in enumerate(yearly):
        doc_id = hashlib.md5(f"{symbol}_y_{i}".encode()).hexdigest()
        content = f"Balance Sheet Annual - {symbol}\n" + "\n".join(f"{k}: {v}" for k, v in y.items())
        store.add_documents([Document(
            id=doc_id, content=content, source=symbol,
            doc_type="balance_sheet", metadata={"symbol": symbol, "period": "yearly"},
        )])


def ingest_news(symbol: str, articles: list[dict]):
    """Ingest news articles into the vector store."""
    store = get_vector_store()
    for i, article in enumerate(articles):
        doc_id = hashlib.md5(f"{symbol}_news_{article.get('title', i)}".encode()).hexdigest()
        content = f"News: {article.get('title', '')}\nSource: {article.get('source', '')}\n{article.get('summary', '')}"
        store.add_documents([Document(
            id=doc_id, content=content, source=symbol,
            doc_type="news", metadata={"symbol": symbol, "title": article.get("title", "")},
        )])


async def retrieve_and_analyze(symbol: str, query: str, provider_name: str | None = None) -> dict:
    """
    RAG pipeline: Retrieve relevant documents → synthesize with LLM.
    """
    store = get_vector_store()

    # Retrieve relevant documents
    docs = store.query(f"{symbol} {query}", n_results=10)

    if not docs:
        # No documents in store, provide a basic analysis
        context = f"No historical data found in the knowledge base for {symbol}."
    else:
        context = "\n\n---\n\n".join([
            f"[{doc.doc_type}] {doc.content}" for doc in docs
        ])

    # Synthesize with LLM
    prompt = f"""Based on the following retrieved documents about {symbol}, answer this query:

Query: {query}

Retrieved Context:
{context}

Provide a well-structured analysis with:
1. Direct answer to the query
2. Supporting evidence from the documents
3. Any caveats or missing information
4. Actionable recommendation if applicable

If the context doesn't contain enough information, acknowledge that and provide what analysis you can."""

    system = "You are a financial research analyst. Use the provided context to give accurate, data-driven answers."
    provider = get_provider(provider_name)
    result = await provider.chat(prompt, system_prompt=system, temperature=0.3)

    return {
        "query": query,
        "symbol": symbol,
        "analysis": result.content,
        "sources_used": len(docs),
        "documents": [{"type": doc.doc_type, "source": doc.source, "preview": doc.content[:200]} for doc in docs],
        "provider": result.provider,
        "error": result.error,
    }
