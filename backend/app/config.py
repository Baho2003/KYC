from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    yuzid_api_base_url: str = "https://api.yuzid.uz"
    yuzid_login: str
    yuzid_password: str


settings = Settings()
