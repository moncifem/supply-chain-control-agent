from smolagents import tool, CodeAgent
from db_connector import get_db, query_db, load_csv
from model import model
import pandas as pd
import os

@tool
def read_csv_sample(csv_path: str, rows: int = 5) -> str:
    """
    Read the first few rows of a CSV file to analyze its structure.
    
    Args:
        csv_path: Path to the CSV file
        rows: Number of rows to read (default 5)
    """
    try:
        df = pd.read_csv(csv_path, nrows=rows)
        result = {
            "columns": list(df.columns),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "sample_data": df.to_dict('records'),
            "shape": df.shape
        }
        return str(result)
    except Exception as e:
        return f"Error reading CSV: {e}"

@tool
def execute_sql(query: str) -> str:
    """
    Execute SQL query on the database.
    
    Args:
        query: SQL query to execute
    """
    try:
        result = query_db(query)
        return str(result)
    except Exception as e:
        return f"Error executing SQL: {e}"

@tool
def load_csv_to_db(csv_path: str, table_name: str) -> str:
    """
    Load CSV file into database table.
    
    Args:
        csv_path: Path to the CSV file
        table_name: Name for the database table
    """
    try:
        result = load_csv(csv_path, table_name)
        return result
    except Exception as e:
        return f"Error loading CSV: {e}"

@tool
def list_files(directory: str = ".") -> str:
    """
    List files in a directory.
    
    Args:
        directory: Directory path (default current directory)
    """
    try:
        files = [f for f in os.listdir(directory) if f.endswith('.csv')]
        return str(files)
    except Exception as e:
        return f"Error listing files: {e}"



onboarding_instructions = """
You are a CSV onboarding specialist. Your job is to analyze CSV files and integrate them into the database.

When given a CSV file:
1. Use read_csv_sample to analyze the structure and data types
2. Create an appropriate SQL table schema based on the data types
3. Use execute_sql to create the table
4. Use load_csv_to_db to load the data
5. Verify the data was loaded correctly

Always be thorough in analyzing data types and choose appropriate SQL column types.
"""

onboarding_agent = CodeAgent(
    tools=[read_csv_sample, execute_sql, load_csv_to_db, list_files],
    model=model,
    instructions=onboarding_instructions
)

if __name__ == "__main__":
    result = onboarding_agent.run("List all CSV files in the current directory and onboard the first one you find.")
    print(result) 