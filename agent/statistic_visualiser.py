from smolagents import CodeAgent
from model import model
from sql_agent import sql_engine

visual_agent = CodeAgent(
    tools=[sql_engine],
    model=model,
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