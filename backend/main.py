from fastapi import FastAPI, Request, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import uuid
import sqlite3
from db import get_db, dict_from_row

# Load env variables from .env file
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            if "=" in line and not line.strip().startswith("#"):
                key, val = line.strip().split("=", 1)
                os.environ[key] = val

import google.generativeai as genai
if os.environ.get("GEMINI_API_KEY"):
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

app = FastAPI(title="Property Ledger API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount uploads static directory
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

ALLOWED_TABLES = {
    "properties": "properties",
    "floors": "floors",
    "rooms": "rooms",
    "beds": "beds",
    "tenants": "tenants",
    "rent-dues": "rent_dues",
    "payments": "payments",
    "expenses": "expenses",
    "deposits": "deposits",
    "tenant-documents": "tenant_documents",
    "notes": "notes"
}

def get_table_columns(conn, table_name):
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name})")
    return [row['name'] for row in cursor.fetchall()]

@app.on_event("startup")
def startup():
    schema_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")
    with open(schema_path, "r") as f:
        schema_sql = f.read()
    with get_db() as conn:
        conn.executescript(schema_sql)

@app.post("/api/send-reminder")
async def send_reminder(request: Request):
    import subprocess
    body = await request.json()
    tenant_id = body.get("tenant_id")
    message = body.get("message")
    
    if not tenant_id:
        raise HTTPException(status_code=400, detail="tenant_id is required")
        
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT mobile_number, full_name, monthly_rent FROM tenants WHERE id = ?", (tenant_id,))
        tenant = cursor.fetchone()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
            
        mobile = tenant['mobile_number']
        name = tenant['full_name']
        rent = tenant['monthly_rent']
        
    # Clean up phone number for mudslide (needs country code, default to 91 if 10 digits)
    clean_mobile = str(mobile).strip().replace(" ", "").replace("-", "").replace("+", "")
    if len(clean_mobile) == 10:
        clean_mobile = f"91{clean_mobile}"
        
    if not message:
        # Check if API key is set, otherwise fall back to static template
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            try:
                prompt = f"""
                You are a polite, professional property manager.
                Draft a short, clear WhatsApp rent reminder message (under 60 words) for the tenant.
                - Tenant Name: {name}
                - Rent Due: ₹{rent}
                - Keep it friendly but firm. Use a few relevant emojis (like 🏠, 💰).
                - Do not include any subject lines or intro headers, just output the raw message.
                """
                model = genai.GenerativeModel("gemini-1.5-flash")
                response = model.generate_content(prompt)
                message = response.text.strip()
            except Exception as ai_err:
                print(f"Gemini generation failed: {ai_err}. Falling back to template.")
                message = f"Hi {name}, this is a friendly reminder that your monthly rent of ₹{rent} is pending. Please pay at the earliest. Thank you!"
        else:
            message = f"Hi {name}, this is a friendly reminder that your monthly rent of ₹{rent} is pending. Please pay at the earliest. Thank you!"
        
    try:
        # Command: npx mudslide send <phone> "<message>"
        # Using npx mudslide directly
        cmd = ["npx", "mudslide", "send", clean_mobile, message]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return {"ok": True, "output": result.stdout, "recipient": clean_mobile}
    except Exception as e:
        stderr_output = getattr(e, "stderr", "")
        print(f"Mudslide sending failed: {e}. Stderr: {stderr_output}")
        # Return success false but descriptive details so the user knows what to do
        return {
            "ok": False, 
            "error": str(e), 
            "detail": stderr_output,
            "tip": "Make sure you run 'npx mudslide login' in your local terminal to link WhatsApp."
        }

@app.get("/api/{entity}")
async def list_entities(entity: str, request: Request):
    if entity not in ALLOWED_TABLES:
        raise HTTPException(status_code=404, detail="Entity not found")
    table = ALLOWED_TABLES[entity]
    
    query_params = dict(request.query_params)
    sort = query_params.pop("sort", None)
    
    with get_db() as conn:
        columns = get_table_columns(conn, table)
        
        where_clauses = []
        params = []
        for key, val in query_params.items():
            # Translate frontend queries if any (e.g. property_id, room_id, bed_id, tenant_id etc.)
            if key in columns:
                # Handle numeric comparisons if values are numeric
                where_clauses.append(f"{key} = ?")
                params.append(val)
                
        sql = f"SELECT * FROM {table}"
        if where_clauses:
            sql += " WHERE " + " AND ".join(where_clauses)
            
        if sort:
            desc = False
            if sort.startswith("-"):
                desc = True
                sort_col = sort[1:]
            else:
                sort_col = sort
                
            if sort_col == "created_date":
                sort_col = "created_at"
                
            if sort_col in columns:
                sql += f" ORDER BY {sort_col} {'DESC' if desc else 'ASC'}"
        else:
            if "created_at" in columns:
                sql += " ORDER BY created_at DESC"
            elif "id" in columns:
                sql += " ORDER BY id DESC"
                
        cursor = conn.cursor()
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        return [dict_from_row(r) for r in rows]

@app.get("/api/{entity}/{id}")
async def get_entity(entity: str, id: int):
    if entity not in ALLOWED_TABLES:
        raise HTTPException(status_code=404, detail="Entity not found")
    table = ALLOWED_TABLES[entity]
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM {table} WHERE id = ?", (id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"{entity} with id {id} not found")
        return dict_from_row(row)

@app.post("/api/{entity}")
async def create_entity(entity: str, request: Request):
    if entity not in ALLOWED_TABLES:
        raise HTTPException(status_code=404, detail="Entity not found")
    table = ALLOWED_TABLES[entity]
    
    body = await request.json()
    
    with get_db() as conn:
        columns = get_table_columns(conn, table)
        insert_cols = []
        insert_vals = []
        for k, v in body.items():
            if k == "created_date":
                k = "created_at"
            if k in columns and k != 'id' and k != 'created_at':
                insert_cols.append(k)
                insert_vals.append(v)
                
        if not insert_cols:
            sql = f"INSERT INTO {table} DEFAULT VALUES"
            params = []
        else:
            placeholders = ", ".join(["?"] * len(insert_cols))
            sql = f"INSERT INTO {table} ({', '.join(insert_cols)}) VALUES ({placeholders})"
            params = insert_vals
            
        cursor = conn.cursor()
        cursor.execute(sql, params)
        new_id = cursor.lastrowid
        
        cursor.execute(f"SELECT * FROM {table} WHERE id = ?", (new_id,))
        row = cursor.fetchone()
        return dict_from_row(row)

@app.put("/api/{entity}/{id}")
async def update_entity(entity: str, id: int, request: Request):
    if entity not in ALLOWED_TABLES:
        raise HTTPException(status_code=404, detail="Entity not found")
    table = ALLOWED_TABLES[entity]
    
    body = await request.json()
    
    with get_db() as conn:
        columns = get_table_columns(conn, table)
        update_pairs = []
        params = []
        for k, v in body.items():
            if k == "created_date":
                k = "created_at"
            if k in columns and k != 'id' and k != 'created_at':
                update_pairs.append(f"{k} = ?")
                params.append(v)
                
        if not update_pairs:
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM {table} WHERE id = ?", (id,))
            row = cursor.fetchone()
            return dict_from_row(row)
            
        sql = f"UPDATE {table} SET {', '.join(update_pairs)} WHERE id = ?"
        params.append(id)
        
        cursor = conn.cursor()
        cursor.execute(sql, params)
        
        cursor.execute(f"SELECT * FROM {table} WHERE id = ?", (id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"{entity} with id {id} not found")
        return dict_from_row(row)

@app.delete("/api/{entity}/{id}")
async def delete_entity(entity: str, id: int):
    if entity not in ALLOWED_TABLES:
        raise HTTPException(status_code=404, detail="Entity not found")
    table = ALLOWED_TABLES[entity]
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(f"SELECT id FROM {table} WHERE id = ?", (id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"{entity} with id {id} not found")
            
        cursor.execute(f"DELETE FROM {table} WHERE id = ?", (id,))
        return {"ok": True}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as f:
        f.write(await file.read())
        
    return {"file_url": f"/uploads/{filename}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
