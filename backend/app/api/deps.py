"""Dependency-injection providers for the API layer."""

from __future__ import annotations

from functools import lru_cache

from app.repositories import InMemoryRepository, Repository


@lru_cache
def _repo_singleton() -> InMemoryRepository:
    """Module-level in-memory repository singleton (seeded once)."""
    return InMemoryRepository()


def get_repo() -> Repository:
    """FastAPI dependency that yields the active repository.

    Returns the in-memory repo by default. Override in tests via
    `app.dependency_overrides[get_repo]`.
    """
    return _repo_singleton()
