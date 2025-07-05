import sqlite3
import pandas as pd
import os

class ShipmentsDB:
    def __init__(self):
        # Create in-memory SQLite database
        self.conn = sqlite3.connect(':memory:')
        self.cursor = self.conn.cursor()
        self._load_csv_data()
    
    def _load_csv_data(self):
        """Load CSV data into the database"""
        try:
            # Read CSV file
            csv_path = os.path.join(os.path.dirname(__file__), 'shipments.csv')
            df = pd.read_csv(csv_path)
            
            # Create table from pandas DataFrame
            df.to_sql('shipments', self.conn, if_exists='replace', index=False)
            
            print(f"Loaded {len(df)} records into shipments table")
            print(f"Columns: {list(df.columns)}")
            
        except Exception as e:
            print(f"Error loading CSV: {e}")
            raise
    
    def execute_query(self, sql):
        """Execute SQL query and return results"""
        try:
            self.cursor.execute(sql)
            
            # Check if query returns results
            if self.cursor.description is None:
                # No results to fetch (INSERT, UPDATE, DELETE, etc.)
                return []
            
            # Get column names
            columns = [description[0] for description in self.cursor.description]
            
            # Fetch all results
            rows = self.cursor.fetchall()
            
            # Return as list of dictionaries
            result = []
            for row in rows:
                result.append(dict(zip(columns, row)))
            
            return result
        
        except Exception as e:
            print(f"Error executing query: {e}")
            print(f"Query was: {sql}")
            raise
    
    def get_table_info(self):
        """Get information about the shipments table"""
        return self.execute_query("PRAGMA table_info(shipments)")
    
    def get_sample_data(self, limit=5):
        """Get sample data from the table"""
        return self.execute_query(f"SELECT * FROM shipments LIMIT {limit}")
    
    def close(self):
        """Close database connection"""
        self.conn.close()

# Global instance
db = None

def get_db():
    """Get or create database instance"""
    global db
    if db is None:
        db = ShipmentsDB()
    return db

def query_db(sql):
    """Execute SQL query and return results"""
    database = get_db()
    return database.execute_query(sql)

def get_db_info():
    """Get database table information"""
    database = get_db()
    return database.get_table_info()

def get_sample():
    """Get sample data"""
    database = get_db()
    return database.get_sample_data()
