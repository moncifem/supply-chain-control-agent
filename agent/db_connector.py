import sqlite3
import pandas as pd
import os

class GenericDB:
    def __init__(self):
        self.conn = sqlite3.connect(':memory:')
        self.cursor = self.conn.cursor()
    
    def load_csv_to_table(self, csv_path, table_name):
        df = pd.read_csv(csv_path)
        df.to_sql(table_name, self.conn, if_exists='replace', index=False)
        return f"Loaded {len(df)} records into {table_name} table"
    
    def execute_query(self, sql):
        try:
            self.cursor.execute(sql)
            
            if self.cursor.description is None:
                return []
            
            columns = [description[0] for description in self.cursor.description]
            rows = self.cursor.fetchall()
            
            result = []
            for row in rows:
                result.append(dict(zip(columns, row)))
            
            return result
        
        except Exception as e:
            print(f"Error executing query: {e}")
            print(f"Query was: {sql}")
            raise
    
    def get_table_info(self, table_name):
        return self.execute_query(f"PRAGMA table_info({table_name})")
    
    def get_sample_data(self, table_name, limit=5):
        return self.execute_query(f"SELECT * FROM {table_name} LIMIT {limit}")
    
    def get_tables(self):
        return self.execute_query("SELECT name FROM sqlite_master WHERE type='table'")
    
    def close(self):
        self.conn.close()

db = None

def get_db():
    global db
    if db is None:
        db = GenericDB()
        if os.path.exists(os.path.join(os.path.dirname(__file__), 'shipments.csv')):
            db.load_csv_to_table(os.path.join(os.path.dirname(__file__), 'shipments.csv'), 'shipments')
    return db

def query_db(sql):
    database = get_db()
    return database.execute_query(sql)

def load_csv(csv_path, table_name):
    database = get_db()
    return database.load_csv_to_table(csv_path, table_name)

def get_tables():
    database = get_db()
    return database.get_tables()
