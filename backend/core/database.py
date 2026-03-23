# backend/core/database.py
from supabase import create_client, Client
from core.config import settings

class SupabaseManager:
    _instance: Client = None

    @classmethod
    def get_client(cls) -> Client:
        """
        Returns a singleton instance of the Supabase admin client.
        Uses the Service Role key to bypass RLS for internal backend operations,
        ensuring the worker and API have unrestricted DB access.
        """
        if cls._instance is None:
            print("Initializing Supabase Client...")
            # We use get_secret_value() because we stored it as a secure SecretStr
            cls._instance = create_client(
                supabase_url=settings.SUPABASE_URL,
                supabase_key=settings.SUPABASE_SERVICE_KEY.get_secret_value()
            )
        return cls._instance

# FastAPI Dependency
def get_db() -> Client:
    return SupabaseManager.get_client()