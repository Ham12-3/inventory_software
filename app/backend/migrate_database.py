#!/usr/bin/env python3
"""
Database Migration Script
Adds missing columns to the suppliers table for purchase order functionality
"""

import sqlite3
import os
from datetime import datetime

def migrate_database():
    """Add missing columns to suppliers table"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), "data", "inventory.db")
    
    print(f"🔄 Starting database migration...")
    print(f"📁 Database path: {db_path}")
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if suppliers table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='suppliers';")
        if not cursor.fetchone():
            print("❌ Suppliers table does not exist. Please run the main application first to create tables.")
            return False
        
        # Get current table schema
        cursor.execute("PRAGMA table_info(suppliers);")
        existing_columns = [column[1] for column in cursor.fetchall()]
        print(f"📋 Existing columns: {existing_columns}")
        
        # Define the columns we need to add
        new_columns = [
            ("company_name", "TEXT"),
            ("payment_terms", "TEXT DEFAULT 'Net 30'"),
            ("lead_time_days", "INTEGER DEFAULT 7"),
            ("minimum_order_value", "REAL DEFAULT 0.0"),
            ("rating", "REAL DEFAULT 0.0"),
            ("total_orders", "INTEGER DEFAULT 0"),
            ("on_time_delivery_rate", "REAL DEFAULT 0.0"),
            ("is_preferred", "BOOLEAN DEFAULT 0"),
        ]
        
        # Add missing columns
        columns_added = 0
        for column_name, column_type in new_columns:
            if column_name not in existing_columns:
                try:
                    sql = f"ALTER TABLE suppliers ADD COLUMN {column_name} {column_type};"
                    cursor.execute(sql)
                    print(f"✅ Added column: {column_name}")
                    columns_added += 1
                except sqlite3.Error as e:
                    print(f"❌ Error adding column {column_name}: {e}")
        
        # Commit changes
        conn.commit()
        
        # Verify the migration
        cursor.execute("PRAGMA table_info(suppliers);")
        final_columns = [column[1] for column in cursor.fetchall()]
        print(f"📋 Final columns: {final_columns}")
        
        print(f"✅ Migration completed successfully!")
        print(f"📊 Added {columns_added} new columns to suppliers table")
        
        # Close connection
        conn.close()
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Database Migration Tool")
    print("=" * 50)
    
    success = migrate_database()
    
    if success:
        print("\n🎉 Migration completed successfully!")
        print("You can now restart your application to use the new purchase order features.")
    else:
        print("\n💥 Migration failed!")
        print("Please check the error messages above and try again.") 