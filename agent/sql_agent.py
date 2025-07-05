from smolagents import tool, CodeAgent
from db_connector import get_db, query_db
from sqlalchemy import text
from model import model

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

agent = CodeAgent(
    tools=[sql_engine],
    model=model,
)
agent.run("give me the top 10 shipments that were late")