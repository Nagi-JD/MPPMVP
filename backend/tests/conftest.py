"""Shared pytest fixtures: a TestClient backed by a fresh seeded repository."""

from __future__ import annotations

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.api.deps import get_repo
from app.main import create_app
from app.repositories import InMemoryRepository


@pytest.fixture
def repo() -> InMemoryRepository:
    return InMemoryRepository()


@pytest.fixture
def client(repo: InMemoryRepository) -> Iterator[TestClient]:
    app = create_app()
    app.dependency_overrides[get_repo] = lambda: repo
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
