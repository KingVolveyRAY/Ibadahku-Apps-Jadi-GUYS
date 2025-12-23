from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'bedahni_db')]

# JWT Configuration
SECRET_KEY = os.environ.get('SECRET_KEY', 'bedahni-secret-key-2025-very-secure')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# Resend Email Configuration
resend.api_key = os.environ.get('RESEND_API_KEY')

# Create the main app
app = FastAPI(title="IbadahKu API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== EMAIL HELPER ====================

def send_reset_email(to_email: str, reset_code: str):
    """Send password reset email using Resend"""
    try:
        params = {
            "from": "IbadahKu <onboarding@resend.dev>",
            "to": [to_email],
            "subject": "🕌 Kode Reset Password - IbadahKu",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #22c55e; margin: 0;">🕌 IbadahKu</h1>
                    <p style="color: #666;">Aplikasi Ibadah Harian</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
                    <h2 style="color: white; margin: 0 0 10px 0;">Kode Reset Password</h2>
                    <p style="color: rgba(255,255,255,0.9); margin: 0 0 20px 0;">Gunakan kode berikut untuk mereset password Anda:</p>
                    <div style="background: white; padding: 20px; border-radius: 10px; display: inline-block;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #22c55e;">{reset_code}</span>
                    </div>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <p style="color: #666; margin: 0; font-size: 14px;">
                        ⚠️ Kode ini akan kadaluarsa dalam <strong>15 menit</strong>.<br><br>
                        Jika Anda tidak meminta reset password, abaikan email ini.
                    </p>
                </div>
                
                <div style="text-align: center; color: #999; font-size: 12px;">
                    <p>Assalamu'alaikum Warahmatullahi Wabarakatuh</p>
                    <p>© 2025 IbadahKu. All rights reserved.</p>
                </div>
            </div>
            """
        }
        
        email_response = resend.Emails.send(params)
        logger.info(f"Reset email sent to {to_email}: {email_response}")
        return True
    except Exception as e:
        logger.error(f"Failed to send reset email to {to_email}: {e}")
        return False

# ==================== MODELS ====================

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = "Indonesia"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

# Amal/Activity Models
class AmalCreate(BaseModel):
    name: str
    notes: Optional[str] = None
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    repeat_daily: bool = False

class Amal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    notes: Optional[str] = None
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    repeat_daily: bool = False
    completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AmalUpdate(BaseModel):
    name: Optional[str] = None
    notes: Optional[str] = None
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    repeat_daily: Optional[bool] = None
    completed: Optional[bool] = None

# Daily Note Model
class DailyNoteCreate(BaseModel):
    date: str  # YYYY-MM-DD
    notes: Optional[str] = None
    reflections: Optional[str] = None

class DailyNote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: str
    notes: Optional[str] = None
    reflections: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Prayer Tracking
class PrayerTrackCreate(BaseModel):
    date: str  # YYYY-MM-DD
    subuh: bool = False
    dzuhur: bool = False
    ashar: bool = False
    maghrib: bool = False
    isya: bool = False

class PrayerTrack(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: str
    subuh: bool = False
    dzuhur: bool = False
    ashar: bool = False
    maghrib: bool = False
    isya: bool = False

# ==================== HELPER FUNCTIONS ====================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "hashed_password": 0})
    if user is None:
        raise credentials_exception
    return user

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = str(uuid.uuid4())
    user_dict = {
        "id": user_id,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "hashed_password": get_password_hash(user_data.password),
        "phone": None,
        "address": None,
        "city": None,
        "country": "Indonesia",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Insert without getting the result with _id
    await db.users.insert_one(user_dict.copy())
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    # Return user without password and _id
    user_response = {k: v for k, v in user_dict.items() if k not in ["hashed_password", "_id"]}
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    
    user_response = {k: v for k, v in user.items() if k not in ["hashed_password", "_id"]}
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    user = await db.users.find_one({"email": request.email})
    if not user:
        # Don't reveal if email exists or not for security
        return {"message": "Jika email terdaftar, kode reset telah dikirim", "email_sent": False}
    
    # Generate reset code
    reset_code = str(uuid.uuid4())[:6].upper()
    
    # Save reset code to database with expiration
    await db.password_resets.update_one(
        {"email": request.email},
        {
            "$set": {
                "code": reset_code, 
                "created_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
            }
        },
        upsert=True
    )
    
    # Send email using Resend
    email_sent = send_reset_email(request.email, reset_code)
    
    if email_sent:
        logger.info(f"Password reset email sent to {request.email}")
        return {
            "message": "Kode reset telah dikirim ke email Anda",
            "email_sent": True
        }
    else:
        # Fallback: return code for development/testing when email fails
        # In production with verified domain, this won't happen
        logger.warning(f"Email failed, returning code directly for {request.email}")
        return {
            "message": "Email gagal terkirim. Gunakan kode berikut:",
            "email_sent": False,
            "code": reset_code,
            "note": "Untuk mengirim email ke alamat lain, verifikasi domain di resend.com/domains"
        }

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    reset_record = await db.password_resets.find_one({
        "email": request.email,
        "code": request.code
    })
    
    if not reset_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kode reset tidak valid"
        )
    
    # Check if code expired
    if reset_record.get("expires_at"):
        expires_at = datetime.fromisoformat(reset_record["expires_at"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > expires_at:
            await db.password_resets.delete_one({"email": request.email})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Kode reset sudah kadaluarsa. Silakan minta kode baru."
            )
    
    # Update password
    await db.users.update_one(
        {"email": request.email},
        {"$set": {"hashed_password": get_password_hash(request.new_password)}}
    )
    
    # Delete reset record
    await db.password_resets.delete_one({"email": request.email})
    
    return {"message": "Password berhasil direset"}

# ==================== USER ROUTES ====================

@api_router.get("/user/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@api_router.put("/user/me")
async def update_me(user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in user_update.model_dump().items() if v is not None}
    
    if update_data:
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$set": update_data}
        )
    
    updated_user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0, "hashed_password": 0})
    return updated_user

# ==================== PRAYER TIMES ROUTES ====================

@api_router.get("/prayer-times")
async def get_prayer_times(latitude: float = -6.2088, longitude: float = 106.8456, method: int = 20):
    """Get prayer times from Aladhan API. Default location is Jakarta."""
    try:
        today = datetime.now().strftime("%d-%m-%Y")
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.aladhan.com/v1/timings/{today}",
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "method": method  # 20 = Kemenag Indonesia
                }
            )
            data = response.json()
            
            if data["code"] == 200:
                timings = data["data"]["timings"]
                date_info = data["data"]["date"]
                
                return {
                    "timings": {
                        "Subuh": timings["Fajr"],
                        "Terbit": timings["Sunrise"],
                        "Dzuhur": timings["Dhuhr"],
                        "Ashar": timings["Asr"],
                        "Maghrib": timings["Maghrib"],
                        "Isya": timings["Isha"]
                    },
                    "date": {
                        "gregorian": date_info["gregorian"],
                        "hijri": date_info["hijri"]
                    }
                }
            else:
                raise HTTPException(status_code=500, detail="Failed to fetch prayer times")
    except Exception as e:
        logger.error(f"Error fetching prayer times: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/prayer-times/monthly")
async def get_monthly_prayer_times(
    year: int = None,
    month: int = None,
    latitude: float = -6.2088,
    longitude: float = 106.8456,
    method: int = 20
):
    """Get monthly prayer times calendar."""
    if year is None:
        year = datetime.now().year
    if month is None:
        month = datetime.now().month
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.aladhan.com/v1/calendar/{year}/{month}",
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "method": method
                }
            )
            data = response.json()
            
            if data["code"] == 200:
                return data["data"]
            else:
                raise HTTPException(status_code=500, detail="Failed to fetch calendar")
    except Exception as e:
        logger.error(f"Error fetching monthly calendar: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== HIJRI CALENDAR ROUTES ====================

@api_router.get("/hijri/today")
async def get_hijri_today():
    """Get today's Hijri date."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.aladhan.com/v1/gToH")
            data = response.json()
            
            if data["code"] == 200:
                return data["data"]["hijri"]
            else:
                raise HTTPException(status_code=500, detail="Failed to fetch Hijri date")
    except Exception as e:
        logger.error(f"Error fetching Hijri date: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/hijri/convert")
async def convert_to_hijri(date: str):
    """Convert Gregorian date to Hijri. Format: DD-MM-YYYY"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://api.aladhan.com/v1/gToH/{date}")
            data = response.json()
            
            if data["code"] == 200:
                return data["data"]["hijri"]
            else:
                raise HTTPException(status_code=500, detail="Failed to convert date")
    except Exception as e:
        logger.error(f"Error converting date: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/hijri/calendar")
async def get_hijri_calendar(year: int, month: int):
    """Get Hijri calendar for a month."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://api.aladhan.com/v1/hToGCalendar/{month}/{year}")
            data = response.json()
            
            if data["code"] == 200:
                return data["data"]
            else:
                raise HTTPException(status_code=500, detail="Failed to fetch Hijri calendar")
    except Exception as e:
        logger.error(f"Error fetching Hijri calendar: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== AMAL/ACTIVITY ROUTES ====================

@api_router.post("/amal", response_model=Amal)
async def create_amal(amal_data: AmalCreate, current_user: dict = Depends(get_current_user)):
    amal_dict = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        **amal_data.model_dump(),
        "completed": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.amals.insert_one(amal_dict)
    return Amal(**amal_dict)

@api_router.get("/amal", response_model=List[Amal])
async def get_amals(
    date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"user_id": current_user["id"]}
    if date:
        query["scheduled_date"] = date
    
    amals = await db.amals.find(query, {"_id": 0}).to_list(100)
    return amals

@api_router.put("/amal/{amal_id}", response_model=Amal)
async def update_amal(
    amal_id: str,
    amal_update: AmalUpdate,
    current_user: dict = Depends(get_current_user)
):
    update_data = {k: v for k, v in amal_update.model_dump().items() if v is not None}
    
    if update_data:
        await db.amals.update_one(
            {"id": amal_id, "user_id": current_user["id"]},
            {"$set": update_data}
        )
    
    updated_amal = await db.amals.find_one(
        {"id": amal_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not updated_amal:
        raise HTTPException(status_code=404, detail="Amal not found")
    
    return Amal(**updated_amal)

@api_router.delete("/amal/{amal_id}")
async def delete_amal(amal_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.amals.delete_one({"id": amal_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Amal not found")
    return {"message": "Amal deleted successfully"}

# ==================== DAILY NOTES ROUTES ====================

@api_router.post("/daily-notes", response_model=DailyNote)
async def create_or_update_daily_note(
    note_data: DailyNoteCreate,
    current_user: dict = Depends(get_current_user)
):
    existing = await db.daily_notes.find_one({
        "user_id": current_user["id"],
        "date": note_data.date
    })
    
    if existing:
        await db.daily_notes.update_one(
            {"id": existing["id"]},
            {"$set": note_data.model_dump()}
        )
        updated = await db.daily_notes.find_one({"id": existing["id"]}, {"_id": 0})
        return DailyNote(**updated)
    else:
        note_dict = {
            "id": str(uuid.uuid4()),
            "user_id": current_user["id"],
            **note_data.model_dump(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.daily_notes.insert_one(note_dict)
        return DailyNote(**note_dict)

@api_router.get("/daily-notes/{date}", response_model=Optional[DailyNote])
async def get_daily_note(date: str, current_user: dict = Depends(get_current_user)):
    note = await db.daily_notes.find_one(
        {"user_id": current_user["id"], "date": date},
        {"_id": 0}
    )
    return DailyNote(**note) if note else None

# ==================== PRAYER TRACKING ROUTES ====================

@api_router.post("/prayer-track", response_model=PrayerTrack)
async def create_or_update_prayer_track(
    track_data: PrayerTrackCreate,
    current_user: dict = Depends(get_current_user)
):
    existing = await db.prayer_tracks.find_one({
        "user_id": current_user["id"],
        "date": track_data.date
    })
    
    if existing:
        await db.prayer_tracks.update_one(
            {"id": existing["id"]},
            {"$set": track_data.model_dump()}
        )
        updated = await db.prayer_tracks.find_one({"id": existing["id"]}, {"_id": 0})
        return PrayerTrack(**updated)
    else:
        track_dict = {
            "id": str(uuid.uuid4()),
            "user_id": current_user["id"],
            **track_data.model_dump()
        }
        await db.prayer_tracks.insert_one(track_dict)
        return PrayerTrack(**track_dict)

@api_router.get("/prayer-track/{date}", response_model=Optional[PrayerTrack])
async def get_prayer_track(date: str, current_user: dict = Depends(get_current_user)):
    track = await db.prayer_tracks.find_one(
        {"user_id": current_user["id"], "date": date},
        {"_id": 0}
    )
    return PrayerTrack(**track) if track else None

@api_router.get("/prayer-track/stats/weekly")
async def get_weekly_prayer_stats(current_user: dict = Depends(get_current_user)):
    """Get prayer completion stats for the last 7 days."""
    today = datetime.now()
    dates = [(today - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    
    tracks = await db.prayer_tracks.find(
        {"user_id": current_user["id"], "date": {"$in": dates}},
        {"_id": 0}
    ).to_list(7)
    
    total_prayers = 0
    completed_prayers = 0
    
    for track in tracks:
        for prayer in ["subuh", "dzuhur", "ashar", "maghrib", "isya"]:
            total_prayers += 1
            if track.get(prayer, False):
                completed_prayers += 1
    
    return {
        "total": total_prayers,
        "completed": completed_prayers,
        "percentage": round((completed_prayers / total_prayers * 100) if total_prayers > 0 else 0, 1),
        "tracks": tracks
    }

# ==================== ROOT ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "IbadahKu API v1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
