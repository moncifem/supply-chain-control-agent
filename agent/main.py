from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import requests
from smolagents import CodeAgent
from sql_agent import sql_engine, custom_instructions
from model import model
from prompting import get_prompt

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

def load_schema_prompt(file_path="table_schema_prompt.txt"):
    """Load schema prompt from file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error loading schema prompt: {e}")
        return ""

class QueryRequest(BaseModel):
    query: str
    prompt: Optional[str] = None

class QueryResponse(BaseModel):
    result: str

class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    response: str

@app.post("/query", response_model=QueryResponse)
async def query_shipments(request: QueryRequest):
    """
    Query the shipments database using natural language.
    
    Parameters:
    - query: The natural language query to execute
    - prompt: Optional custom prompt. If not provided, fetches from https://thesquad.fr/api/prompt
    
    Examples:
    - {"query": "give me the top 10 shipments that were late"}
    - {"query": "How many shipments were delayed because of transmission", "prompt": "custom prompt"}
    """
    try:
        current_agent = CodeAgent(
            tools=[sql_engine],
            model=model,
            instructions=custom_instructions
        )
        
        # Use provided prompt or fetch from external API
        if request.prompt:
            external_prompt = request.prompt
            print(f"Using provided prompt: {external_prompt[:100]}...")
        else:
            external_prompt = fetch_system_prompt()
            print("Fetching prompt from external API")
        
        if external_prompt:
            current_agent.prompt_templates["system_prompt"] = current_agent.prompt_templates["system_prompt"] + "\n\n" + external_prompt
            print("Added external prompt to system prompt")
        else:
            print("No external prompt available, using default")
        
        schema_prompt = load_schema_prompt()
        if schema_prompt:
            current_agent.prompt_templates["system_prompt"] = current_agent.prompt_templates["system_prompt"] + "\n\n" + schema_prompt
            print("Added schema prompt to system prompt")
        
        result = current_agent.run(request.query)
        return QueryResponse(result=str(result))
    except Exception as e:
        return QueryResponse(result=f"Error: {str(e)}")

@app.post("/generate-prompt", response_model=ChatResponse)
async def generate_prompt(request: ChatRequest):
    """
    Simple chat endpoint using the Groq model directly.
    
    Parameters:
    - message: The message to send to the LLM
    
    Examples:
    - {"message": "What is 2+2?"}
    - {"message": "Explain supply chain management"}
    """
    try:
        response = get_prompt(request.prompt)
        return ChatResponse(response=response.content)
    except Exception as e:
        return ChatResponse(response=f"Error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Supply Chain Control Agent API", "docs": "/docs"}

@app.get("/default-prompt")
async def get_default_prompt():
    """
    Get the default system prompt used by the agent.
    """
    return {"default_prompt": custom_instructions}

@app.get("/schema-prompt")
async def get_schema_prompt():
    """
    Get the generated schema prompt if available.
    """
    schema_prompt = load_schema_prompt()
    return {"schema_prompt": schema_prompt if schema_prompt else "No schema prompt found"}

@app.post("/generate-schema")
async def generate_schema():
    """
    Generate schema prompt for all available tables.
    """
    try:
        from schema_prompt_agent import get_available_tables, generate_system_prompt, generate_combined_prompt
        
        tables = eval(get_available_tables())
        if not tables:
            return {"message": "No tables found in database"}
        
        results = []
        for table in tables:
            result = generate_system_prompt(table, f"{table}_schema_prompt.txt")
            results.append(result)
        
        combined_result = generate_combined_prompt()
        results.append(combined_result)
        
        return {"message": f"Generated schema prompts for {len(tables)} tables", "results": results}
    except Exception as e:
        return {"error": f"Error generating schema: {str(e)}"}

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
