from fastapi import FastAPI
from pydantic import BaseModel
from smolagents import CodeAgent
from sql_agent import sql_engine
from model import model

app = FastAPI(title="Supply Chain Control Agent API")

# Create the agent with SQL tools
agent = CodeAgent(
    tools=[sql_engine],
    model=model,
)

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    result: str

@app.post("/query", response_model=QueryResponse)
async def query_shipments(request: QueryRequest):
    """
    Query the shipments database using natural language.
    
    Examples:
    - "give me the top 10 shipments that were late"
    - "show me shipments to New York"
    - "what are the most common delivery delays?"
    """
    try:
        result = agent.run(request.query)
        return QueryResponse(result=str(result))
    except Exception as e:
        return QueryResponse(result=f"Error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Supply Chain Control Agent API", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
