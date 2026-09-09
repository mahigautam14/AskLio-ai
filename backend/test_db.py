import asyncio
import asyncpg

async def test():
    configs = [
        # try asklio_user on 5433
        dict(user="asklio_user", password="asklio123", database="asklio_db", host="127.0.0.1", port=5433),
        # try asklio_user with old password
        dict(user="asklio_user", password="postgress", database="asklio_db", host="127.0.0.1", port=5433),
        # try postgres superuser common passwords on 5433
        dict(user="postgres", password="postgres", database="asklio_db", host="127.0.0.1", port=5433),
        dict(user="postgres", password="admin", database="asklio_db", host="127.0.0.1", port=5433),
        dict(user="postgres", password="root", database="asklio_db", host="127.0.0.1", port=5433),
        dict(user="postgres", password="1234", database="asklio_db", host="127.0.0.1", port=5433),
        dict(user="postgres", password="asklio123", database="asklio_db", host="127.0.0.1", port=5433),
        # also try 5432 just in case
        dict(user="asklio_user", password="asklio123", database="asklio_db", host="127.0.0.1", port=5432),
        dict(user="postgres", password="postgres", database="postgres", host="127.0.0.1", port=5432),
        dict(user="postgres", password="postgres", database="postgres", host="127.0.0.1", port=5433),
    ]

    for i, cfg in enumerate(configs, 1):
        try:
            print(f"Trying #{i}: {cfg['user']}@{cfg['host']}:{cfg['port']}/{cfg['database']} ...")
            conn = await asyncpg.connect(**cfg)
            ver = await conn.fetchval("SELECT version();")
            print("✅ SUCCESS!")
            print(f"   User: {cfg['user']}")
            print(f"   Password: {cfg['password']}")
            print(f"   Port: {cfg['port']}")
            print(f"   Database: {cfg['database']}")
            print(f"   Version: {ver[:60]}")
            await conn.close()
            print("\n👉 Put this in your .env DATABASE_URL:")
            print(f"DATABASE_URL=postgresql+asyncpg://{cfg['user']}:{cfg['password']}@{cfg['host']}:{cfg['port']}/{cfg['database']}")
            return
        except Exception as e:
            print(f"   ❌ {e}")

    print("\n❌ All attempts failed. Use Option B (SQLite) or reset postgres password.")

if __name__ == "__main__":
    asyncio.run(test())