CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS floors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    floor_number INTEGER,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    floor_id INTEGER REFERENCES floors(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    capacity INTEGER DEFAULT 1,
    monthly_rent_default REAL,
    status TEXT DEFAULT 'Vacant',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS beds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    bed_number TEXT NOT NULL,
    status TEXT DEFAULT 'Vacant',
    reserved_for TEXT,
    reserved_join_date TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
    bed_id INTEGER REFERENCES beds(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    alternate_mobile TEXT,
    aadhaar_number TEXT,
    occupation TEXT,
    company_name TEXT,
    emergency_contact_name TEXT,
    emergency_contact_number TEXT,
    family_member_count INTEGER DEFAULT 0,
    joining_date TEXT,
    vacating_date TEXT,
    monthly_rent REAL,
    security_deposit REAL,
    status TEXT DEFAULT 'Active',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS rent_dues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    rent_amount REAL NOT NULL,
    amount_paid REAL DEFAULT 0,
    pending_amount REAL,
    status TEXT DEFAULT 'Unpaid',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(tenant_id, month, year)
);

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    payment_date TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT,
    reference_number TEXT,
    remarks TEXT,
    rent_month TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    expense_date TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    deposit_amount REAL NOT NULL,
    received_date TEXT,
    refund_amount REAL DEFAULT 0,
    refund_date TEXT,
    status TEXT DEFAULT 'Held',
    remarks TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS tenant_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    document_url TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);
