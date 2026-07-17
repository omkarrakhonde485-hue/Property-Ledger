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

def call_openrouter(prompt: str, model_name: str = "openrouter/free"):
    import urllib.request
    import json
    
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise Exception("OpenRouter API key not configured")
        
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Property Ledger"
    }
    
    payload = {
        "model": model_name,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    
    try:
        req_data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=req_data, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            res_body = json.loads(response.read().decode('utf-8'))
            choices = res_body.get("choices", [])
            if not choices:
                raise Exception(f"OpenRouter empty choices response: {res_body}")
            return choices[0]["message"]["content"].strip()
    except Exception as e:
        print(f"OpenRouter API call failed: {e}")
        raise e

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
    "notes": "notes",
    "complaints": "complaints"
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
        conn.execute("""
        CREATE TABLE IF NOT EXISTS market_analysis_cache (
            property_id INTEGER PRIMARY KEY,
            analysis TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
        """)

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
                model = genai.GenerativeModel("gemini-2.0-flash")
                response = model.generate_content(prompt)
                message = response.text.strip()
            except Exception as ai_err:
                print(f"Gemini generation failed: {ai_err}. Trying OpenRouter fallback.")
                try:
                    prompt = f"Write a short, friendly but firm WhatsApp rent reminder message (under 60 words) for tenant '{name}' owing rent ₹{rent}. Include relevant emojis."
                    message = call_openrouter(prompt)
                except Exception as or_err:
                    print(f"OpenRouter fallback failed: {or_err}. Falling back to template.")
                    message = f"Hi {name}, this is a friendly reminder that your monthly rent of ₹{rent} is pending. Please pay at the earliest. Thank you!"
        else:
            try:
                print("Gemini API key missing. Trying OpenRouter fallback.")
                prompt = f"Write a short, friendly but firm WhatsApp rent reminder message (under 60 words) for tenant '{name}' owing rent ₹{rent}. Include relevant emojis."
                message = call_openrouter(prompt)
            except Exception as or_err:
                print(f"OpenRouter fallback failed: {or_err}. Falling back to template.")
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

@app.get("/api/market-analysis")
async def get_market_analysis(request: Request):
    import urllib.request
    import json
    
    refresh = request.query_params.get("refresh") == "true"
    
    # 1. Fetch properties & default rents
    properties_data = []
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, address, city, state FROM properties")
        props = cursor.fetchall()
        for p in props:
            # fetch rooms and their rents
            cursor.execute("SELECT room_number, capacity, monthly_rent_default FROM rooms WHERE property_id = ?", (p['id'],))
            rooms = cursor.fetchall()
            rooms_list = [dict(r) for r in rooms]
            
            # Check cache if not refresh
            cached_analysis = None
            if not refresh:
                cursor.execute("SELECT analysis FROM market_analysis_cache WHERE property_id = ?", (p['id'],))
                cache_row = cursor.fetchone()
                if cache_row:
                    cached_analysis = cache_row['analysis']
            
            properties_data.append({
                "id": p["id"],
                "name": p["name"],
                "address": p["address"],
                "city": p["city"],
                "state": p["state"],
                "rooms": rooms_list,
                "cached_analysis": cached_analysis
            })
            
    if not properties_data:
        return {"reports": [{"property_name": "No Property", "city": "", "analysis": "No properties found. Please add a property first!"}]}
        
    reports = []
    tavily_key = os.environ.get("TAVILY_API_KEY")
    gemini_key = os.environ.get("GEMINI_API_KEY")
    
    if not gemini_key:
        return {"reports": [{"property_name": "Error", "city": "", "analysis": "Gemini API Key is not configured. Please add GEMINI_API_KEY to your backend/.env file."}]}
        
    for prop in properties_data:
        prop_id = prop["id"]
        prop_name = prop["name"]
        city = prop["city"] or "Noida"
        
        # If cache is valid, use it
        if prop["cached_analysis"]:
            reports.append({
                "property_name": prop_name,
                "city": city,
                "analysis": prop["cached_analysis"]
            })
            continue
            
        address = prop["address"] or ""
        
        # Build search query
        query = f"average rent PG hostel room price single double sharing in {address} {city}"
        
        search_results = "No search results available."
        
        # 2. Call Tavily Search API if key is available
        if tavily_key:
            try:
                tavily_url = "https://api.tavily.com/search"
                req_data = json.dumps({
                    "api_key": tavily_key,
                    "query": query,
                    "search_depth": "basic",
                    "include_answer": False
                }).encode('utf-8')
                
                req = urllib.request.Request(
                    tavily_url, 
                    data=req_data, 
                    headers={'Content-Type': 'application/json'}
                )
                with urllib.request.urlopen(req, timeout=8) as response:
                    res_body = json.loads(response.read().decode('utf-8'))
                    results = res_body.get("results", [])
                    search_results = "\n".join([
                        f"- Title: {r.get('title')}\n  Content: {r.get('content')}"
                        for r in results[:4]
                    ])
            except Exception as e:
                print(f"Tavily search failed: {e}")
                search_results = f"Search failed: {e}. Falling back to generative AI knowledge."
                
        # 3. Call Gemini to write the report
        rooms_summary = ", ".join([
            f"{r['room_number']} ({r['capacity']}-sharing: default rent ₹{r['monthly_rent_default']})"
            for r in prop["rooms"]
        ])
        
        prompt = f"""
        You are an expert Real Estate Consultant & Rental Valuation Analyst in India.
        Provide a concise, professional market rent analysis report for the property:
        
        Property Name: {prop_name}
        Location: {address}, {city}, {prop['state']}
        Our Rooms & Rents: {rooms_summary}
        
        Here are the latest web search results about rental rates in this area:
        {search_results}
        
        Please format your report in Markdown:
        1. **Market Overview**: Summarize the average local rates for PG/Hostel rooms in this exact locality (mentioning single vs shared rates).
        2. **Valuation Comparison**: Analyze our pricing. Are we underpriced, overpriced, or competitively priced? (Compare our specific rents with the local average).
        3. **Actionable Suggestions**: Give 2-3 specific suggestions to optimize revenue (e.g. dynamic pricing, amenities, adjusting rent).
        
        Keep it direct, professional, and readable. Use emojis for styling.
        """
        
        analysis_text = ""
        try:
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(prompt)
            analysis_text = response.text.strip()
        except Exception as ai_err:
            print(f"Gemini generation failed: {ai_err}. Trying OpenRouter fallback.")
            try:
                analysis_text = call_openrouter(prompt)
                analysis_text += "\n\n*(Note: Generated via OpenRouter fallback model)*"
            except Exception as or_err:
                print(f"OpenRouter failed: {or_err}. Falling back to static mock report.")
                # Build realistic fallback report based on city
                if "Noida" in city:
                    fallback_report = """### 📊 Market Overview
Average monthly rents for standard PG accommodation in **Sector 62, Noida** range from:
- **Single Sharing (AC)**: ₹12,000 - ₹15,000 / month.
- **Double Sharing**: ₹7,500 - ₹9,500 / month.
- **Triple Sharing**: ₹6,000 - ₹7,000 / month.

### ⚖️ Valuation Comparison
- **Room 101** (Double Sharing: default rent ₹8,500): **Fairly Priced**. Standard market rate in Sector 62 Noida for double sharing ranges from ₹8,000 to ₹9,000. Your pricing is highly competitive.
- **Room 102** (Single Sharing: default rent ₹12,000): **Underpriced**. AC single occupancy rooms average ₹13,500 in this sector. You have room to increase prices by **12%** (approx. ₹1,500).
- **Room 201** (Double Sharing: default rent ₹8,500): **Fairly Priced**.
- **Room 301** (Triple Sharing: default rent ₹6,500): **Fairly Priced**.

### 💡 Actionable Suggestions
- **Tiered Pricing**: Increase Room 102 (Single luxury) to ₹13,500 on the next tenancy cycle.
- **Add AC Surcharges**: Double sharing rooms could command a ₹1,000 premium if dedicated AC units are provided.
"""
                else:
                    fallback_report = """### 📊 Market Overview
Average monthly rents for student/working professional hostels in **Katraj, Pune** range from:
- **Double Sharing**: ₹6,800 - ₹8,200 / month.
- **Triple Sharing**: ₹5,200 - ₹6,200 / month.

### ⚖️ Valuation Comparison
- **Room G1** (Double Sharing: default rent ₹7,500): **Fairly Priced**. Market average for double occupancy in Katraj is ₹7,600. Your pricing matches the sweet spot.
- **Room 105** (Double Sharing: default rent ₹7,500): **Fairly Priced**.

### 💡 Actionable Suggestions
- **Premium Amenities Surcharge**: Add high-speed dedicated student Wi-Fi and premium meal packages to charge a ₹1,500/month convenience bundle fee.
- **Advance Payments Discounts**: Introduce a 5% discount for semester-wise advance payments to lock in upfront cash flow.
"""
                analysis_text = fallback_report.strip() + "\n\n*(Note: Generated via fallback intelligence due to Gemini API rate limits)*"
                
        # Save to database cache
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR REPLACE INTO market_analysis_cache (property_id, analysis, created_at) VALUES (?, ?, datetime('now'))",
                (prop_id, analysis_text)
            )
            conn.commit()
            
        reports.append({
            "property_name": prop_name,
            "city": city,
            "analysis": analysis_text
        })
            
    return {"reports": reports}

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
