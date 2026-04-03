"""
Utility to scrape live web search results for grounded LLM context.
"""
from duckduckgo_search import DDGS
import logging

def search_local_news(location: str, max_results: int = 3) -> str:
    """
    Query DuckDuckGo for recent real estate/development news about a location.
    Returns a formatted string of the top results or a fallback message.
    """
    query = f"{location} real estate development infrastructure news"
    context_chunks = []
    
    try:
        results = DDGS().text(query, max_results=max_results)
        for r in results:
            title = r.get("title", "News")
            body = r.get("body", "")
            if body:
                context_chunks.append(f"- {title}: {body}")
                
        if not context_chunks:
            return "No recent major news found for this location."
            
        return "\n".join(context_chunks)
    except Exception as e:
        logging.warning(f"DuckDuckGo search failed: {e}")
        return "Web search temporarily unavailable."
