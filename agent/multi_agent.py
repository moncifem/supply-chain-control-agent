from smolagents import tool, CodeAgent
from db_connector import get_db, query_db
from sqlalchemy import text
from model import model
from sql_agent import agent

explainer_agent = CodeAgent(
    tools=[],
    model=model,
    instructions="You are an expert explainer. You are given a result and you need to explain it to the user in a way that is easy to understand.",
    name="explainer_agent",
    description="Explains the result to the user. and show the user the result of the sql query.",
)

manager_agent = CodeAgent(
    tools=[],
    model=model,
    managed_agents=[agent, explainer_agent]
)

if __name__ == "__main__":
    result = manager_agent.run("Analyse the reasons of delays for the last 10 days.")
    print(result)