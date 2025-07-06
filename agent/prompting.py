from model import chat_model

def get_prompt(prompt: str):
    system_prompt = """
You are a prompt engineering assistant helping to generate part of a system prompt for a text-to-SQL AI agent.

The target AI agent is a **supply chain analyst** that queries a structured database table containing **shipment records** from a central warehouse to various destination stores. The table includes timestamps, flags, and metadata describing each step of the delivery process.

You will be given:
- A JSON schema describing the fields of the table, including:
  - Field names
  - Descriptions
  - Data types (e.g. Timestamp, Date, Location, Flag, ID, Quantity)
- A few sample rows from the dataset, to help contextualise the sequence

Your task is to generate **only the following section** of the system prompt starting with:
"Here is how the shipment process is structured (with timestamps and flags): Step 1: ..."

This section should:
- List the **sequence of operations** in the shipment process (from order transmission to final delivery)
- Organize fields into logical steps (e.g., Transmission, Pick & Pack, Loading, Transport, Customs, Last Mile)
- For each step, group the relevant fields:
  - Timestamps
  - Dates (actual and expected)
  - Flags indicating if the step was on time
- Use the `type` and `description` in the schema to assign roles to each field
- Keep field names and flags exactly as written in the schema (e.g., `Transmission OnTime`)
- Always include the **final delivery step**, using the field `On Time Delivery` to define whether the shipment was late
- Include logic that explains how delay flags (e.g., `Landing OnTime = FALSE`) help identify root causes of late deliveries

You must also include both the **technical field name** (e.g., `Delivery Time`) and its human-readable role (from the description), organized under each step.

The result should be ready to plug into a full system prompt. Keep the tone clear, technical, and structured for downstream use in analytical reasoning and SQL generation.
Be as detailed as possible.
DO NOT include any other text or comments.
Today is may 08 2025, use this date when comparing last dates. 
"""
    result = chat_model.invoke(system_prompt + prompt)
    header = """
You are an expert supply chain analyst. You are working with a structured table containing shipment records from a warehouse to various stores. Each shipment follows a multi-step process, and for each step, both actual timestamps and on-time status flags are provided. Your role is to analyse each shipment and explain whether it was delivered on time and, if not, which steps caused the delay.
\n\n
"""
    return header + result.content

if __name__ == "__main__":
    print(get_prompt("""Please generate the shipment structure block for a supply chain AI agent system prompt.

The section must start with:
"Here is how the shipment process is structured (with timestamps and flags):"

Use the JSON schema below to identify:
- Step names
- Relevant timestamps and flags
- Expected and actual dates
- Final delivery condition
- Any fields that help explain delays

Here is the JSON schema:
{
  "Test": {
    "description": "",
    "type": ""
  },
  "Order Time": {
    "description": "Order Creation Time",
    "type": "Timestamp"
  },
  "Order Date": {
    "description": "Order Creation Date",
    "type": "Date"
  },
  "City": {
    "description": "City destination",
    "type": "Location"
  },
  "Store": {
    "description": "Store destination",
    "type": "Location"
  },
  "ShipmentID": {
    "description": "ID of the shipment",
    "type": "ID"
  },
  "Order Amount": {
    "description": "Order amount in euros",
    "type": "Quantity"
  },
  "Transmission OnTime": {
    "description": "Flag of transmission on time",
    "type": "Flag"
  },
  "Transmission": {
    "description": "Transmission time",
    "type": "Timestamp"
  },
  "Start PickPack": {
    "description": "Start of the Pick and Pack Process in the warehouse",
    "type": "Timestamp"
  },
  "Pickpack": {
    "description": "End of the Pick and Pack Process in the warehouse",
    "type": "Timestamp"
  },
  "Loading": {
    "description": "Actual loading time at the warehouse",
    "type": "Timestamp"
  },
  "Expected Loading Date": {
    "description": "Expected loading time at the warehouse",
    "type": "Date"
  },
  "Loading OnTime": {
    "description": "Flag of the loading on time",
    "type": "Flag"
  },
  "Loading Date": {
    "description": "Loading date",
    "type": "Date"
  },
  "Airport Arrival": {
    "description": "Time of arrival at the airport from the warehouse",
    "type": "Timestamp"
  },
  "Airport OnTime": {
    "description": "Flag of arrival on time",
    "type": "Flag"
  },
  "Airport Arrival Date": {
    "description": "Airport arrival date",
    "type": "Date"
  },
  "Takeoff": {
    "description": "Flight takeoff time",
    "type": "Timestamp"
  },
  "Landing": {
    "description": "Flight landing time",
    "type": "Timestamp"
  },
  "Landing Date": {
    "description": "Landing date",
    "type": "Date"
  },
  "Landing OnTime": {
    "description": "Flag of landing on time",
    "type": "Flag"
  },
  "Start Clearance": {
    "description": "Start time of the clearance process",
    "type": "Timestamp"
  },
  "End Clearance": {
    "description": "End time of the clearance process",
    "type": "Timestamp"
  },
  "Leaving Airport": {
    "description": "Time when the truck leaves the airport",
    "type": "Timestamp"
  },
  "City Arrival": {
    "description": "Time when the truck arrives in the city",
    "type": "Timestamp"
  },
  "City Arrival Date": {
    "description": "Date when the truck arrives in the city",
    "type": "Date"
  },
  "Store Open": {
    "description": "Flag if the store is open when the truck arrives",
    "type": "Flag"
  },
  "Delivery Time": {
    "description": "Actual store delivery time",
    "type": "Timestamp"
  },
  "Delivery Date": {
    "description": "Actual store delivery date",
    "type": "Date"
  },
  "Expected Delivery Time": {
    "description": "Expected store delivery time",
    "type": "Timestamp"
  },
  "On Time Delivery": {
    "description": "Flag of the on time delivery",
    "type": "Flag"
  }
}

Here is a sample of the dataset (first 2–3 rows):
0,1,2021-05-02 17:00:00.000000,2021-05-02,CITY2,CITY2/ST8,2021-05-02/CITY2/ST8/1,5445,False,2021-05-03 17:00:00.000000,2021-05-04 07:00:00.000000,2021-05-04 13:31:48.042144,2021-05-04 19:00:00.000000,2021-05-04,True,2021-05-04,2021-05-05,2021-05-04 21:59:12.658318,True,2021-05-04,2021-05-05,2021-05-05 06:00:00.000000,2021-05-05 19:11:16.791315,2021-05-05,2021-05-06,2021-05-07,True,2021-05-06 09:00:00.000000,2021-05-06 11:32:50.282538,2021-05-06 12:19:46.058471,2021-05-06 17:08:54.687496,2021-05-06,2021-05-07,False,2021-05-07 16:30:00.000000,2021-05-07,2021-05-07 13:45:00,False
1,2,2021-05-09 12:00:00.000000,2021-05-09,CITY3,CITY3/ST9,2021-05-09/CITY3/ST9/2,2054,True,2021-05-09 13:10:20.919487,2021-05-10 07:00:00.000000,2021-05-10 12:38:30.320130,2021-05-10 19:00:00.000000,2021-05-10,True,2021-05-10,2021-05-11,2021-05-10 21:53:39.835069,True,2021-05-10,2021-05-11,2021-05-11 06:00:00.000000,2021-05-11 17:49:13.720279,2021-05-11,2021-05-12,2021-05-13,True,2021-05-12 09:00:00.000000,2021-05-12 10:11:07.947605,2021-05-12 10:40:00.403568,2021-05-12 15:40:02.394369,2021-05-12,2021-05-13,True,2021-05-12 15:40:02.394369,2021-05-12,2021-05-13 13:45:00,True
Return only the structured steps explanation block.
    """))