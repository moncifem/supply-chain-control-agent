from smolagents import CodeAgent
from smolagents import LiteLLMModel

model = LiteLLMModel(model_id="groq/llama-3.3-70b-versatile")

# Create an agent with no tools
agent = CodeAgent(tools=[], model=model)

# Run the agent with a task
result = agent.run("Calculate the sum of numbers from 1 to 10")
print(result)
