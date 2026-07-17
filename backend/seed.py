import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.db")

def seed_db():
    print(f"Connecting to database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    cursor = conn.cursor()

    # Clear existing data in correct dependency order
    tables = [
        "tenant_documents", "deposits", "payments", "rent_dues", 
        "tenants", "beds", "rooms", "floors", "expenses", "properties", "notes"
    ]
    for table in tables:
        cursor.execute(f"DELETE FROM {table};")
        cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}';")
    print("Cleared existing data.")

    # 1. Properties
    properties = [
        ("Apex Residency PG", "Sector 62, Noida", "Noida", "Uttar Pradesh", "201301", "Premium student & professional PG"),
        ("Elite Stay Hostel", "Katraj, Pune", "Pune", "Maharashtra", "411046", "Co-living space close to engineering colleges")
    ]
    prop_ids = []
    for p in properties:
        cursor.execute("""
            INSERT INTO properties (name, address, city, state, pincode, description) 
            VALUES (?, ?, ?, ?, ?, ?);
        """, p)
        prop_ids.append(cursor.lastrowid)
    print("Inserted 2 properties.")

    # 2. Floors
    # Apex Residency Floors (id index 0)
    # Elite Stay Floors (id index 1)
    floors = [
        (prop_ids[0], "Ground Floor", 0, "Common lounge and dining area"),
        (prop_ids[0], "First Floor", 1, "Premium single sharing rooms"),
        (prop_ids[0], "Second Floor", 2, "Double sharing rooms"),
        (prop_ids[1], "Ground Floor", 0, "Reception and double sharing rooms"),
        (prop_ids[1], "First Floor", 1, "Triple sharing rooms with balcony")
    ]
    floor_ids = []
    for f in floors:
        cursor.execute("""
            INSERT INTO floors (property_id, name, floor_number, notes) 
            VALUES (?, ?, ?, ?);
        """, f)
        floor_ids.append(cursor.lastrowid)
    print("Inserted 5 floors.")

    # 3. Rooms
    # room_number, capacity, rent, status, floor_id, property_id
    rooms = [
        (prop_ids[0], floor_ids[0], "Room 101", 2, 8500.0, "Partially Occupied", "Double sharing next to garden window"),
        (prop_ids[0], floor_ids[0], "Room 102", 1, 12000.0, "Fully Occupied", "Single luxury room with AC"),
        (prop_ids[0], floor_ids[1], "Room 201", 2, 8500.0, "Vacant", "Standard double sharing room"),
        (prop_ids[0], floor_ids[2], "Room 301", 3, 6500.0, "Vacant", "Triple sharing budget room"),
        (prop_ids[1], floor_ids[3], "Room G1", 2, 7500.0, "Fully Occupied", "Double sharing close to entrance"),
        (prop_ids[1], floor_ids[4], "Room 105", 2, 7500.0, "Vacant", "Balcony room facing street")
    ]
    room_ids = []
    for r in rooms:
        cursor.execute("""
            INSERT INTO rooms (property_id, floor_id, room_number, capacity, monthly_rent_default, status, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?);
        """, r)
        room_ids.append(cursor.lastrowid)
    print("Inserted 6 rooms.")

    # 4. Beds (generated automatically for rooms)
    # Room 101 -> 2 beds (A, B)
    # Room 102 -> 1 bed (A)
    # Room 201 -> 2 beds (A, B)
    # Room 301 -> 3 beds (A, B, C)
    # Room G1 -> 2 beds (A, B)
    # Room 105 -> 2 beds (A, B)
    bed_mapping = {} # (room_id, bed_number) -> id
    for r_id in room_ids:
        # get room info
        cursor.execute("SELECT room_number, capacity, status FROM rooms WHERE id = ?", (r_id,))
        room = cursor.fetchone()
        room_number = room[0]
        capacity = room[1]
        
        # generate beds
        for i in range(capacity):
            bed_num = chr(65 + i) # A, B, C...
            # Mark some beds as Occupied or Reserved based on seed target
            status = "Vacant"
            if room_number == "Room 101" and bed_num == "A":
                status = "Occupied"
            elif room_number == "Room 102" and bed_num == "A":
                status = "Occupied"
            elif room_number == "Room G1":
                status = "Occupied"
                
            cursor.execute("""
                INSERT INTO beds (room_id, bed_number, status) 
                VALUES (?, ?, ?);
            """, (r_id, bed_num, status))
            bed_mapping[(r_id, bed_num)] = cursor.lastrowid
    print("Inserted all beds.")

    # 5. Tenants
    # full_name, mobile_number, alt_mobile, aadhaar, occupation, company, emergency_name, emergency_phone, family_count, joining, status, rent, deposit, bed_id, room_id, property_id
    tenants = [
        (prop_ids[0], room_ids[0], bed_mapping[(room_ids[0], "A")], "Amit Sharma", "9876543210", "9988776655", "123456789012", "Software Engineer", "TCS", "Rajesh Sharma", "9876543211", 0, "2026-01-10", 8500.0, 10000.0, "Active"),
        (prop_ids[0], room_ids[1], bed_mapping[(room_ids[1], "A")], "Sneha Patil", "9900112233", None, "987654321098", "Student", "Symbiosis Institute", "Sunil Patil", "9900112234", 0, "2026-03-01", 12000.0, 15000.0, "Active"),
        (prop_ids[1], room_ids[4], bed_mapping[(room_ids[4], "A")], "Rahul Deshmukh", "8877665544", "8877665500", "246813579012", "Business Analyst", "Infosys", "Anil Deshmukh", "8877665545", 0, "2025-08-15", 7500.0, 10000.0, "Notice Given"),
        (prop_ids[1], room_ids[4], bed_mapping[(room_ids[4], "B")], "Vikram Singh", "7766554433", None, "135792468013", "UX Designer", "Cognizant", "Mahendra Singh", "7766554434", 0, "2025-06-01", 7500.0, 10000.0, "Vacated")
    ]
    
    tenant_ids = []
    for t in tenants:
        cursor.execute("""
            INSERT INTO tenants (property_id, room_id, bed_id, full_name, mobile_number, alternate_mobile, aadhaar_number, occupation, company_name, emergency_contact_name, emergency_contact_number, family_member_count, joining_date, monthly_rent, security_deposit, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, t)
        tenant_ids.append(cursor.lastrowid)
    print("Inserted 4 tenants.")

    # Update vacating date for Vikram Singh (Vacated)
    cursor.execute("UPDATE tenants SET vacating_date = '2026-04-30' WHERE id = ?", (tenant_ids[3],))

    # 6. Deposits
    deposits = [
        (tenant_ids[0], 10000.0, "2026-01-10", 0.0, None, "Held", "Initial security deposit"),
        (tenant_ids[1], 15000.0, "2026-03-01", 0.0, None, "Held", "Initial security deposit for AC Single sharing"),
        (tenant_ids[2], 10000.0, "2025-08-15", 0.0, None, "Held", "Deposit held"),
        (tenant_ids[3], 10000.0, "2025-06-01", 10000.0, "2026-04-30", "Refunded", "Fully refunded on exit")
    ]
    for d in deposits:
        cursor.execute("""
            INSERT INTO deposits (tenant_id, deposit_amount, received_date, refund_amount, refund_date, status, remarks) 
            VALUES (?, ?, ?, ?, ?, ?, ?);
        """, d)
    print("Inserted 4 deposit ledger items.")

    # 7. Rent Dues & Payments
    # Tenant 1 (Amit Sharma, 8500 rent, joined Jan 2026)
    # May, June, July rent dues
    dues = [
        # Amit Sharma (Tenant 1)
        (tenant_ids[0], prop_ids[0], 5, 2026, 8500.0, 8500.0, 0.0, "Paid"),
        (tenant_ids[0], prop_ids[0], 6, 2026, 8500.0, 8500.0, 0.0, "Paid"),
        (tenant_ids[0], prop_ids[0], 7, 2026, 8500.0, 0.0, 8500.0, "Unpaid"),
        
        # Sneha Patil (Tenant 2, 12000 rent)
        (tenant_ids[1], prop_ids[0], 5, 2026, 12000.0, 12000.0, 0.0, "Paid"),
        (tenant_ids[1], prop_ids[0], 6, 2026, 12000.0, 12000.0, 0.0, "Paid"),
        (tenant_ids[1], prop_ids[0], 7, 2026, 12000.0, 6000.0, 6000.0, "Partially Paid"),
        
        # Rahul Deshmukh (Tenant 3, 7500 rent)
        (tenant_ids[2], prop_ids[1], 6, 2026, 7500.0, 7500.0, 0.0, "Paid"),
        (tenant_ids[2], prop_ids[1], 7, 2026, 7500.0, 0.0, 7500.0, "Unpaid")
    ]
    for d in dues:
        cursor.execute("""
            INSERT INTO rent_dues (tenant_id, property_id, month, year, rent_amount, amount_paid, pending_amount, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, d)
    print("Inserted 8 rent due entries.")

    # 8. Payments logs
    payments = [
        # Amit Sharma
        (tenant_ids[0], prop_ids[0], "2026-05-02", 8500.0, "UPI", "UPI987654321", "May 2026 Rent", "2026-05"),
        (tenant_ids[0], prop_ids[0], "2026-06-03", 8500.0, "Cash", None, "June 2026 Rent", "2026-06"),
        
        # Sneha Patil
        (tenant_ids[1], prop_ids[0], "2026-05-01", 12000.0, "Bank Transfer", "TXN102391203", "May 2026 Rent", "2026-05"),
        (tenant_ids[1], prop_ids[0], "2026-06-02", 12000.0, "UPI", "UPI123491823", "June 2026 Rent", "2026-06"),
        (tenant_ids[1], prop_ids[0], "2026-07-04", 6000.0, "UPI", "UPI111222333", "July Partial Rent", "2026-07"),
        
        # Rahul Deshmukh
        (tenant_ids[2], prop_ids[1], "2026-06-05", 7500.0, "UPI", "UPI000999888", "June Rent", "2026-06")
    ]
    for p in payments:
        cursor.execute("""
            INSERT INTO payments (tenant_id, property_id, payment_date, amount, payment_method, reference_number, remarks, rent_month) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, p)
    print("Inserted 6 payment records.")

    # 9. Expenses
    expenses = [
        (prop_ids[0], "Electricity", 4800.0, "2026-06-25", "June 2026 Main AC Electricity bill"),
        (prop_ids[0], "Internet", 999.0, "2026-07-01", "Monthly Wifi Broadband renewal"),
        (prop_ids[0], "Repairs", 1200.0, "2026-07-05", "Plumbing repair in Room 101 bathroom"),
        (prop_ids[1], "Water", 1500.0, "2026-06-28", "Water tanker supply delivery charges"),
        (prop_ids[1], "Security", 12000.0, "2026-07-01", "Guard salary for July month")
    ]
    for e in expenses:
        cursor.execute("""
            INSERT INTO expenses (property_id, category, amount, expense_date, description) 
            VALUES (?, ?, ?, ?, ?);
        """, e)
    print("Inserted 5 expense logs.")

    # 10. Tenant Documents
    docs = [
        (tenant_ids[0], "Aadhaar Card Front", "/uploads/aadhaar_dummy.jpg", "Aadhaar front verified"),
        (tenant_ids[1], "Rental Agreement", "/uploads/agreement_dummy.pdf", "11 Months contract signed")
    ]
    for doc in docs:
        cursor.execute("""
            INSERT INTO tenant_documents (tenant_id, document_name, document_url, notes) 
            VALUES (?, ?, ?, ?);
        """, doc)
    print("Inserted dummy documents.")

    conn.commit()
    conn.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_db()
