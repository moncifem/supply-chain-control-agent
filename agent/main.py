from fastapi import FastAPI
from pydantic import BaseModel
import requests
from smolagents import CodeAgent
from sql_agent import agent, sql_engine, custom_instructions
from model import model

app = FastAPI(title="Supply Chain Control Agent API")

def fetch_system_prompt():
    """Fetch the system prompt from the external API"""
    try:
        response = requests.get("https://thesquad.fr/api/prompt")
        response.raise_for_status()
        data = response.json()
        return data.get("prompt", "")
    except Exception as e:
        print(f"Error fetching system prompt: {e}")
        return ""

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    result: str

@app.post("/query", response_model=QueryResponse)
async def query_shipments(request: QueryRequest):
    """
    Query the shipments database using natural language.
    
    The system prompt is automatically fetched from https://thesquad.fr/api/prompt
    
    Parameters:
    - query: The natural language query to execute
    
    Examples:
    - {"query": "give me the top 10 shipments that were late"}
    - {"query": "How many shipments were delayed because of transmission"}
    """
    try:
        current_agent = CodeAgent(
            tools=[sql_engine],
            model=model,
            instructions=custom_instructions
        )
        
        # Always fetch system prompt from external API
        external_prompt = fetch_system_prompt()
        if external_prompt:
            current_agent.prompt_templates["system_prompt"] = current_agent.prompt_templates["system_prompt"] + "\n\n" + external_prompt
            print("Added external prompt to system prompt")
        else:
            print("Failed to fetch external prompt, using default")
        
        result = current_agent.run(request.query)
        return QueryResponse(result=str(result))
    except Exception as e:
        return QueryResponse(result=f"Error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Supply Chain Control Agent API", "docs": "/docs"}

@app.get("/default-prompt")
async def get_default_prompt():
    """
    Get the default system prompt used by the agent.
    """
    return {"default_prompt": custom_instructions}

@app.post("/query-with-context")
async def query_with_context(request: QueryRequest):
    """
    Alternative endpoint with the same functionality as /query.
    Kept for backward compatibility and clearer naming.
    """
    return await query_shipments(request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
