#!/usr/bin/env python3
"""
Seed Suppliers Script
Adds sample suppliers to the database for testing purchase order functionality
"""

import sqlite3
import os
import uuid
from datetime import datetime

def seed_suppliers():
    """Add sample suppliers to the database"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), "data", "inventory.db")
    
    print(f"🌱 Starting supplier seeding...")
    print(f"📁 Database path: {db_path}")
    
    # Sample suppliers data
    suppliers_data = [
        {
            'id': str(uuid.uuid4()),
            'name': 'Fresh Foods Ltd',
            'company_name': 'Fresh Foods Limited',
            'contact_person': 'John Smith',
            'email': 'orders@freshfoods.com',
            'phone': '+44 20 1234 5678',
            'address': '123 Market Street, London, UK',
            'tax_id': 'GB123456789',
            'payment_terms': 'Net 30',
            'lead_time_days': 5,
            'minimum_order_value': 100.0,
            'rating': 4.5,
            'total_orders': 25,
            'on_time_delivery_rate': 95.0,
            'is_active': True,
            'is_preferred': True,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Dairy Direct',
            'company_name': 'Dairy Direct Supplies',
            'contact_person': 'Sarah Johnson',
            'email': 'supply@dairydirect.co.uk',
            'phone': '+44 161 555 0123',
            'address': '456 Farm Road, Manchester, UK',
            'tax_id': 'GB987654321',
            'payment_terms': 'Net 14',
            'lead_time_days': 3,
            'minimum_order_value': 50.0,
            'rating': 4.8,
            'total_orders': 40,
            'on_time_delivery_rate': 98.0,
            'is_active': True,
            'is_preferred': True,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Global Grocers',
            'company_name': 'Global Grocers International',
            'contact_person': 'Mike Chen',
            'email': 'procurement@globalgrocers.com',
            'phone': '+44 121 777 8888',
            'address': '789 Industrial Estate, Birmingham, UK',
            'tax_id': 'GB456789123',
            'payment_terms': 'Net 45',
            'lead_time_days': 10,
            'minimum_order_value': 200.0,
            'rating': 4.2,
            'total_orders': 15,
            'on_time_delivery_rate': 88.0,
            'is_active': True,
            'is_preferred': False,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Bakery Supplies Co',
            'company_name': 'Bakery Supplies Company',
            'contact_person': 'Emma Wilson',
            'email': 'orders@bakerysupplies.co.uk',
            'phone': '+44 113 999 0000',
            'address': '321 Baker Street, Leeds, UK',
            'tax_id': 'GB789123456',
            'payment_terms': 'Net 21',
            'lead_time_days': 7,
            'minimum_order_value': 75.0,
            'rating': 4.6,
            'total_orders': 32,
            'on_time_delivery_rate': 92.0,
            'is_active': True,
            'is_preferred': True,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
    ]
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if suppliers already exist
        cursor.execute("SELECT COUNT(*) FROM suppliers;")
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"📊 Found {existing_count} existing suppliers")
            print("🔄 Clearing existing suppliers to add fresh sample data...")
            cursor.execute("DELETE FROM suppliers;")
        
        # Insert sample suppliers
        insert_sql = """
        INSERT INTO suppliers (
            id, name, company_name, contact_person, email, phone, address, 
            tax_id, payment_terms, lead_time_days, minimum_order_value, 
            rating, total_orders, on_time_delivery_rate, is_active, is_preferred, 
            created_at, updated_at
        ) VALUES (
            :id, :name, :company_name, :contact_person, :email, :phone, :address,
            :tax_id, :payment_terms, :lead_time_days, :minimum_order_value,
            :rating, :total_orders, :on_time_delivery_rate, :is_active, :is_preferred,
            :created_at, :updated_at
        )
        """
        
        suppliers_added = 0
        for supplier in suppliers_data:
            try:
                cursor.execute(insert_sql, supplier)
                print(f"✅ Added supplier: {supplier['name']}")
                suppliers_added += 1
            except sqlite3.Error as e:
                print(f"❌ Error adding supplier {supplier['name']}: {e}")
        
        # Commit changes
        conn.commit()
        
        # Verify the seeding
        cursor.execute("SELECT name, company_name, contact_person FROM suppliers ORDER BY name;")
        final_suppliers = cursor.fetchall()
        
        print(f"\n📋 Final suppliers in database:")
        for supplier in final_suppliers:
            print(f"   • {supplier[0]} ({supplier[1]}) - Contact: {supplier[2]}")
        
        print(f"\n✅ Seeding completed successfully!")
        print(f"📊 Added {suppliers_added} suppliers to the database")
        
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
    print("🌱 Supplier Seeding Tool")
    print("=" * 50)
    
    success = seed_suppliers()
    
    if success:
        print("\n🎉 Seeding completed successfully!")
        print("You can now test the purchase order creation with sample suppliers.")
    else:
        print("\n💥 Seeding failed!")
        print("Please check the error messages above and try again.") 