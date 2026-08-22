"""
Собранный Хозяин v2 — Telegram-логин.

Единственная задача этого сервиса: проверить подпись Telegram Login
Widget (её нельзя проверить в браузере — нужен bot_token, а его нельзя
класть в клиентский JS) и запереть аккаунт за первым, кто успешно
вошёл. Всё остальное (ритуал, шкалы, якоря, журнал, фото) работает
полностью на клиенте и этого сервиса не касается.

См. docs/TZ-v2.md, раздел "Вход через Telegram, жёстко привязанный к id".
"""
import hashlib
import hmac
import os
import sqlite3
import time

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
SESSION_SECRET = os.environ["SESSION_SECRET"]
DB_PATH = os.environ.get("DB_PATH", "/data/auth.db")

COOKIE_NAME = "sobrannyi_session"
SESSION_TTL = 30 * 86400  # 30 дней
MAX_AUTH_AGE = 86400  # виджет Telegram присылает auth_date — старше суток считаем протухшим (защита от replay)

app = FastAPI()


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("CREATE TABLE IF NOT EXISTS owner (id INTEGER PRIMARY KEY CHECK (id = 1), telegram_id INTEGER NOT NULL)")
    return conn


def get_locked_owner():
    conn = get_db()
    try:
        row = conn.execute("SELECT telegram_id FROM owner WHERE id = 1").fetchone()
        return row[0] if row else None
    finally:
        conn.close()


def lock_owner(telegram_id: int):
    conn = get_db()
    try:
        conn.execute("INSERT OR IGNORE INTO owner (id, telegram_id) VALUES (1, ?)", (telegram_id,))
        conn.commit()
    finally:
        conn.close()


def sign(value: str) -> str:
    mac = hmac.new(SESSION_SECRET.encode(), value.encode(), hashlib.sha256).hexdigest()
    return f"{value}.{mac}"


def verify_session(cookie_value: str):
    if not cookie_value or "." not in cookie_value:
        return None
    value, mac = cookie_value.rsplit(".", 1)
    expected = hmac.new(SESSION_SECRET.encode(), value.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(mac, expected):
        return None
    try:
        telegram_id_str, expiry_str = value.split(":")
        if int(expiry_str) < time.time():
            return None
        return int(telegram_id_str)
    except ValueError:
        return None


def verify_telegram_payload(data: dict) -> bool:
    received_hash = data.get("hash")
    if not received_hash:
        return False
    check_fields = {k: v for k, v in data.items() if k != "hash" and v is not None}
    data_check_string = "\n".join(f"{k}={check_fields[k]}" for k in sorted(check_fields))
    secret_key = hashlib.sha256(BOT_TOKEN.encode()).digest()
    computed = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(computed, received_hash)


@app.get("/api/me")
def me(request: Request):
    telegram_id = verify_session(request.cookies.get(COOKIE_NAME, ""))
    if telegram_id is None:
        return JSONResponse({"error": "unauthorized"}, status_code=401)
    return {"telegram_id": telegram_id}


@app.post("/api/telegram-auth")
async def telegram_auth(request: Request):
    data = await request.json()

    if not verify_telegram_payload(data):
        return JSONResponse({"error": "invalid signature"}, status_code=400)

    try:
        auth_date = int(data.get("auth_date", 0))
        telegram_id = int(data["id"])
    except (TypeError, ValueError):
        return JSONResponse({"error": "malformed payload"}, status_code=400)

    if time.time() - auth_date > MAX_AUTH_AGE:
        return JSONResponse({"error": "stale auth"}, status_code=400)

    locked = get_locked_owner()
    if locked is None:
        lock_owner(telegram_id)
        locked = telegram_id

    if locked != telegram_id:
        return JSONResponse({"error": "forbidden"}, status_code=403)

    expiry = int(time.time()) + SESSION_TTL
    cookie = sign(f"{telegram_id}:{expiry}")

    resp = JSONResponse({"ok": True})
    resp.set_cookie(
        COOKIE_NAME, cookie,
        max_age=SESSION_TTL, httponly=True, secure=True, samesite="lax", path="/",
    )
    return resp
