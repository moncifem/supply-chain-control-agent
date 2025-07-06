from smolagents import LiteLLMModel
from langchain_openai import ChatOpenAI
import os

model = LiteLLMModel(model_id="groq/llama-3.3-70b-versatile", temperature=0.1)

chat_model = ChatOpenAI(
    model="llama-3.3-70b-versatile",
    temperature=0.3,
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY")
)

if __name__ == "__main__":
    print(chat_model.invoke("What is the name of the database?"))






