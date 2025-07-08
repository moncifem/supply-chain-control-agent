from smolagents import CodeAgent
from model import model
from sql_agent import sql_engine
import os
import base64
VISUAL_SYSTEM_PROMPT_PATH = os.path.join(
    os.path.dirname(__file__), "visual_prompt.txt"
)
custom_visual_prompt = open(VISUAL_SYSTEM_PROMPT_PATH, encoding="utf-8").read()

visual_agent = CodeAgent(
    tools=[sql_engine],
    model=model,
    instructions=custom_visual_prompt,
    additional_authorized_imports=[
        "matplotlib",
        "matplotlib.pyplot",
        "seaborn",
        "plotly",
        "plotly.graph_objects",
        "plotly.express",
        "plotly.offline",
        "numpy",
        "pandas",
        "scipy",
        "datetime",
        "math",
        "random",
    ],
    name="visual_agent",
    description="Creates beautiful, professional visualizations and saves them locally. Always uses proper code format and saves files correctly.",
)
if __name__ == "__main__":
    result = visual_agent.run("Please create a bar visualisation of the number of deliveries by day. Avoid select * from an entire table to avoid rate limite on LLM tokens. Return only the the file name of the visualisation and NOTHING ELSE.")
    print(result)