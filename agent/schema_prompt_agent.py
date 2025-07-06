from smolagents import tool, CodeAgent
from db_connector import get_db, query_db
from model import model
from onboarding import onboarding_agent

@tool
def get_available_tables() -> str:
    """
    List all available tables in the database.
    """
    try:
        db = get_db()
        tables = db.get_tables()
        return str([table['name'] for table in tables])
    except Exception as e:
        return f"Error getting tables: {e}"

@tool
def analyze_table_schema(table_name: str) -> str:
    """
    Get detailed schema information for a table.
    
    Args:
        table_name: Name of the table to analyze
    """
    try:
        db = get_db()
        table_info = db.get_table_info(table_name)
        sample_data = db.get_sample_data(table_name, 3)
        
        return str({
            "table_name": table_name,
            "columns": table_info,
            "sample_data": sample_data,
            "total_columns": len(table_info)
        })
    except Exception as e:
        return f"Error analyzing table: {e}"

@tool
def generate_system_prompt(table_name: str, output_file: str = "table_schema_prompt.txt") -> str:
    """
    Generate a system prompt with table schema and examples.
    
    Args:
        table_name: Name of the table to analyze
        output_file: File to save the prompt (default: table_schema_prompt.txt)
    """
    try:
        db = get_db()
        
        table_info = db.get_table_info(table_name)
        sample_data = db.get_sample_data(table_name, 3)
        
        prompt = f"""Database Table: {table_name}

Schema:
"""
        for col in table_info:
            prompt += f"- {col['name']}: {col['type']}\n"
        
        prompt += f"\nSample Data (showing {len(sample_data)} records):\n"
        for i, record in enumerate(sample_data, 1):
            prompt += f"Record {i}: {record}\n"
        
        prompt += f"""
Total columns: {len(table_info)}
Table contains data about: {table_name}

Use this schema when writing SQL queries for the {table_name} table.
"""
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(prompt)
        
        return f"System prompt saved to {output_file}. Prompt length: {len(prompt)} characters."
    except Exception as e:
        return f"Error generating system prompt: {e}"

@tool
def generate_combined_prompt(output_file: str = "combined_schema_prompt.txt") -> str:
    """
    Generate a combined system prompt for all tables in the database.
    
    Args:
        output_file: File to save the combined prompt
    """
    try:
        db = get_db()
        tables = db.get_tables()
        
        if not tables:
            return "No tables found in database"
        
        combined_prompt = "Database Schema Information:\n\n"
        
        for table in tables:
            table_name = table['name']
            table_info = db.get_table_info(table_name)
            sample_data = db.get_sample_data(table_name, 2)
            
            combined_prompt += f"TABLE: {table_name}\n"
            combined_prompt += "Columns:\n"
            for col in table_info:
                combined_prompt += f"  - {col['name']}: {col['type']}\n"
            
            combined_prompt += f"Sample records: {len(sample_data)}\n"
            if sample_data:
                combined_prompt += f"Example: {sample_data[0]}\n"
            combined_prompt += "\n"
        
        combined_prompt += "Use this schema information when writing SQL queries."
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(combined_prompt)
        
        return f"Combined schema prompt saved to {output_file}. Covers {len(tables)} tables."
    except Exception as e:
        return f"Error generating combined prompt: {e}"

schema_instructions = """
You are a database schema analyst and prompt generator. Your job is to analyze database tables and create comprehensive system prompts for other agents.

Your capabilities:
1. List all available tables in the database
2. Analyze table schemas including column types and sample data
3. Generate individual table prompts with detailed schema information
4. Create combined prompts covering multiple tables
5. Format prompts for optimal use by other AI agents

Always provide detailed schema information including column names, types, and representative sample data.
"""

schema_prompt_agent = CodeAgent(
    tools=[get_available_tables, analyze_table_schema, generate_system_prompt, generate_combined_prompt],
    model=model,
    instructions=schema_instructions
)

if __name__ == "__main__":
    onboarding_agent.run("List all CSV files in the current directory and onboard the first one you find.")
    result = schema_prompt_agent.run("Generate system prompts for all tables in the database.")
    # Import agent locally to avoid circular import
    from sql_agent import agent
    agent.run("List all CSV files in the current directory and onboard the first one you find.")
    # print(result) 