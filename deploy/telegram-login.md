# Telegram-логин — деплой

Маленький бэкенд (`backend/`) только для проверки Telegram Login Widget
и запирания аккаунта за первым, кто вошёл. Всё остальное приложение
как было — статика, без бэкенда.

## ⚠️ Открытый вопрос: какой бот

Присланный токен принадлежит `@zima_app_bot` — том же
боте, что уже обслуживает вход в **task.zima.spa** (`/setdomain` там уже
указывает на `task.zima.spa`, см. `project_zima_task_app.md`). У Telegram
`/setdomain` исторически привязывает один домен на бота — направить его
ещё и на `boss.zima.spa` может сломать существующий вход в task.zima.spa.

Пока не решено — не деплоить `boss-brand-auth` и не трогать `/setdomain`.
Варианты: (1) завести отдельного бота под boss-brand через `/newbot`,
(2) проверить, поддерживает ли сейчас BotFather несколько доменов на
одном боте, и если да — использовать `zima_app_bot` как есть.
До решения экран входа просто не показывается (фронтенд уже на это
рассчитан — `checkAuth()` пропускает всех, пока `/api/me` недоступен).

## На сервере (один раз)

1. `/opt/boss-brand/.env` (НЕ в git):
   ```
   TELEGRAM_BOT_TOKEN=<токен бота>
   SESSION_SECRET=<openssl rand -hex 32>
   ```
2. Скопировать `deploy/docker-compose.yml` в `/opt/boss-brand/docker-compose.yml`
   (перезаписывает существующий — добавляет сервис `boss-brand-auth`).
3. Добавить блок `/api/*` из `deploy/Caddyfile-block.txt` в `/opt/zima/Caddyfile`.
4. `cd /opt/boss-brand && docker compose up -d --build`
5. `caddy reload` (или перезапуск контейнера Caddy) — подхватить новый блок.

## Проверка

- `curl -s https://boss.zima.spa/api/me` → `401 {"error":"unauthorized"}` без куки.
- Открыть boss.zima.spa, войти через Telegram-виджет на экране входа —
  первый вошедший запирает аккаунт. Второй Telegram-аккаунт получит
  403 при попытке входа.
- Если нужно сбросить владельца (например, ошиблись при первом входе):
  `docker exec boss-brand-auth sqlite3 /data/auth.db "DELETE FROM owner;"`
