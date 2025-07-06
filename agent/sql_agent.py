from smolagents import tool, CodeAgent
from db_connector import get_db, query_db
from sqlalchemy import text
from model import model
from onboarding import onboarding_agent
from schema_prompt_agent import schema_prompt_agent

engine = get_db()

@tool
def sql_engine(query: str) -> str:
    """
    Allows you to perform SQL queries on the shipments table. Returns a string representation of the result.
    The table is named 'shipments' and contains supply chain shipment data. Its description is as follows:
        Columns:
        - Unnamed: 0: INTEGER (Row index)
        - Test: INTEGER (Test identifier)
        - Order Time: TEXT (Order timestamp)
        - Order Date: TEXT (Order date)
        - City: TEXT (Destination city)
        - Store: TEXT (Store identifier)
        - ShipmentID: TEXT (Unique shipment identifier)
        - Order Amount: INTEGER (Order value)
        - Transmission OnTime: INTEGER (Boolean: 1=on time, 0=late)
        - Transmission: TEXT (Transmission timestamp)
        - Start PickPack: TEXT (Pick & pack start time)
        - Pickpack: TEXT (Pick & pack completion time)
        - Loading: TEXT (Loading timestamp)
        - Expected Loading Date: TEXT (Expected loading date)
        - Loading OnTime: INTEGER (Boolean: 1=on time, 0=late)
        - Loading Date: TEXT (Actual loading date)
        - Loading Date+1: TEXT (Loading date + 1 day)
        - Airport Arrival: TEXT (Airport arrival timestamp)
        - Airport OnTime: INTEGER (Boolean: 1=on time, 0=late)
        - Airport Arrival Date: TEXT (Airport arrival date)
        - Airport Arrival Date+1: TEXT (Airport arrival date + 1 day)
        - Takeoff: TEXT (Flight takeoff timestamp)
        - Landing: TEXT (Flight landing timestamp)
        - Landing Date: TEXT (Landing date)
        - Landing Date+1: TEXT (Landing date + 1 day)
        - Landing Date+2: TEXT (Landing date + 2 days)
        - Landing OnTime: INTEGER (Boolean: 1=on time, 0=late)
        - Start Clearance: TEXT (Customs clearance start time)
        - End Clearance: TEXT (Customs clearance end time)
        - Leaving Airport: TEXT (Leaving airport timestamp)
        - City Arrival: TEXT (City arrival timestamp)
        - City Arrival Date: TEXT (City arrival date)
        - City Arrival Date+1: TEXT (City arrival date + 1 day)
        - Store Open: INTEGER (Boolean: 1=store open, 0=closed)
        - Delivery Time: TEXT (Delivery timestamp)
        - Delivery Date: TEXT (Delivery date)
        - Expected Delivery Time: TEXT (Expected delivery time)
        - On Time Delivery: INTEGER (Boolean: 1=on time, 0=late)

    Args:
        query: The query to perform. This should be correct SQL.
    """
    print(f"Executing query: {query}")
    return query_db(query)

# Custom system prompt for supply chain analysis
custom_instructions = """
You are an expert supply chain analyst. You are working with a structured table containing shipment records from a warehouse to various stores. Each shipment follows a multi-step process, and for each step, both actual timestamps and on-time status flags are provided. Your role is to analyse each shipment and explain whether it was delivered on time and, if not, which steps caused the delay.
Here is how the shipment process is structured (with timestamps and flags):
Transmission to WMS
Timestamp: Transmission
Flag: Transmission OnTime (TRUE = on time, FALSE = delayed)


Warehouse Preparation (Pick & Pack)
Timestamps: Start PickPack, Pickpack


Loading and Dispatch
Timestamp: Loading
Expected date: Expected Loading Date
Flag: Loading OnTime
Actual dates: Loading Date, Loading Date+1


Airport Arrival
Timestamp: Airport Arrival
Flag: Airport OnTime
Dates: Airport Arrival Date, Airport Arrival Date+1


Air Transport
Timestamps: Takeoff, Landing
Flag: Landing OnTime
Dates: Landing Date, Landing Date+1, Landing Date+2


Customs Clearance
Timestamps: Start Clearance, End Clearance


Last Mile (Road Delivery from Airport to Store)
Timestamps: Leaving Airport, City Arrival, Delivery Time
Dates: City Arrival Date, City Arrival Date+1, Delivery Date
Expected delivery: Expected Delivery Time
Final flag: On Time Delivery (TRUE = delivered on time, FALSE = delayed
A shipment is considered delivered late if `On Time Delivery` is False.
The flags for the other step can help us to find the root cause of the delay (if a flag is FALSE for Landing OnTime this means that landing was part of the cause of the delay).

Try to use sql as much as possible and try to avoid using python code.
At the end of the process, provide a full explanation of what was done to the user to understand the result, 
explain what column were used to get the result and why, give the user a maximum of details.
You need to be as detailed as possible in what you output to the user.

The last date in the database is May 26th, 2021. So take that into account when you are querying the database.

Always include numbers and statistics in your response.

Here is a detail of a SELECT * FROM shipments LIMIT 1:
[{'Unnamed: 0': 0, 'Test': 1, 'Order Time': '2021-05-02 17:00:00.000000', 'Order Date': '2021-05-02', 'City': 'CITY2', 'Store': 'CITY2/ST8', 'ShipmentID': '2021-05-02/CITY2/ST8/1', 'Order Amount': 5445, 'Transmission OnTime': 0, 'Transmission': '2021-05-03 17:00:00.000000', 'Start PickPack': '2021-05-04 07:00:00.000000', 'Pickpack': '2021-05-04 13:31:48.042144', 'Loading': '2021-05-04 19:00:00.000000', 'Expected Loading Date': '2021-05-04', 'Loading OnTime': 1, 'Loading Date': '2021-05-04', 'Loading Date+1': '2021-05-05', 'Airport Arrival': '2021-05-04 21:59:12.658318', 'Airport OnTime': 1, 'Airport Arrival Date': '2021-05-04', 'Airport Arrival Date+1': '2021-05-05', 'Takeoff': '2021-05-05 06:00:00.000000', 'Landing': '2021-05-05 19:11:16.791315', 'Landing Date': '2021-05-05', 'Landing Date+1': '2021-05-06', 'Landing Date+2': '2021-05-07', 'Landing OnTime': 1, 'Start Clearance': '2021-05-06 09:00:00.000000', 'End Clearance': '2021-05-06 11:32:50.282538', 'Leaving Airport': '2021-05-06 12:19:46.058471', 'City Arrival': '2021-05-06 17:08:54.687496', 'City Arrival Date': '2021-05-06', 'City Arrival Date+1': '2021-05-07', 'Store Open': 0, 'Delivery Time': '2021-05-07 16:30:00.000000', 'Delivery Date': '2021-05-07', 'Expected Delivery Time': '2021-05-07 13:45:00', 'On Time Delivery': 0}]
"""

agent = CodeAgent(
    tools=[sql_engine],
    model=model,
    instructions=custom_instructions,
    name="sql_agent",
    description="Runs sql queries on the shipments table.",
)
agent.prompt_templates["system_prompt"] = agent.prompt_templates["system_prompt"] + custom_instructions

if __name__ == "__main__":
    onboarding_agent.run("List all CSV files in the current directory and onboard the first one you find.")
    result = schema_prompt_agent.run("Generate system prompts for all tables in the database.")
    print(agent.prompt_templates["system_prompt"])
    # Test the agent
    result = agent.run("Analyse the reasons of delays for the last 10 days.")
    # result = query_db("SELECT * FROM shipments LIMIT 1")
    print(result)