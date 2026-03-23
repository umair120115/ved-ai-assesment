from arq.connections import RedisSettings
from urllib.parse import urlparse
from core.config import settings

def get_redis_settings() -> RedisSettings:
    url = urlparse(settings.REDIS_URL)
    return RedisSettings(
        host=url.hostname,
        port=url.port,
        password=url.password,
        ssl=url.scheme == 'rediss'
    )

redis_settings = get_redis_settings()