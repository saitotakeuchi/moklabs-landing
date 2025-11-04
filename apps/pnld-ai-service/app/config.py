"""Application configuration using Pydantic Settings."""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )

    # Application
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    APP_NAME: str = "PNLD AI Service"
    VERSION: str = "0.1.0"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,https://moklabs.com.br"

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_ANON_KEY: str

    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"

    # Hybrid Search Configuration
    USE_HYBRID_SEARCH: bool = True
    HYBRID_VECTOR_WEIGHT: float = 0.6
    HYBRID_BM25_WEIGHT: float = 0.4
    HYBRID_RRF_K: int = 60

    # Reranking Configuration
    USE_RERANKING: bool = True
    RERANKER_MODEL: str = "unicamp-dl/mMiniLM-L6-v2-mmarco-v1"
    RERANKER_TOP_K: int = 10
    RERANKER_BATCH_SIZE: int = 16
    RERANKER_MAX_LENGTH: int = 512
    RERANKER_ORIGINAL_SCORE_WEIGHT: float = 0.3
    RERANKER_SCORE_WEIGHT: float = 0.7

    # MMR (Maximal Marginal Relevance) Configuration
    USE_MMR: bool = True
    MMR_LAMBDA: float = 0.7  # 0=max diversity, 1=max relevance
    MMR_MAX_TOKENS: int = 3000

    # Semantic Chunking Configuration
    USE_SEMANTIC_CHUNKING: bool = True
    SEMANTIC_CHUNK_MIN_SIZE: int = 500
    SEMANTIC_CHUNK_MAX_SIZE: int = 1500
    SEMANTIC_CHUNK_TARGET_SIZE: int = 1000
    SEMANTIC_OVERLAP_SENTENCES: int = 1

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Global settings instance
settings = Settings()
