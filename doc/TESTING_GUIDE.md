# 🧪 Testing Guide

**Last Updated**: 2026-01-02

---

## 📋 Overview

This guide covers testing strategies for Runware Generator, including unit tests, integration tests, and E2E tests.

---

## 🎯 Testing Pyramid

```
        /\
       /E2E\        - Few, slow, high value
      /------\
     /Integration\  - More, medium speed
    /------------\
   /   Unit Tests  \  - Many, fast, foundation
  /----------------\
```

---

## 🔷 Python Testing

### Framework: pytest

### Running Tests

```bash
# Run all tests
pytest

# Run specific file
pytest backend/tests/test_runware_service.py

# Run with verbose output
pytest -v

# Run with coverage
pytest --cov=backend --cov-report=html

# Run specific test
pytest backend/tests/test_runware_service.py::test_generate_image
```

### Unit Tests

```python
# backend/tests/test_runware_service.py
import pytest
from unittest.mock import Mock, AsyncMock, patch
from backend.services.runware_service import RunwareService


@pytest.fixture
def runware_client():
    """Create mock Runware client."""
    client = Mock()
    client.imageInference = AsyncMock()
    client.connect = AsyncMock()
    client.disconnect = AsyncMock()
    return client


@pytest.fixture
def runware_service():
    """Create RunwareService instance."""
    return RunwareService(api_key="test_key")


@pytest.mark.asyncio
async def test_generate_image_success(runware_service, runware_client):
    """Test successful image generation."""
    # Setup mock
    runware_service.client = runware_client
    runware_client.imageInference.return_value = [
        {
            "imageURL": "http://example.com/image.jpg",
            "taskUUID": "task-123",
            "seed": 12345
        }
    ]

    # Execute
    result = await runware_service.generate_image(
        prompt="A beautiful sunset",
        width=512,
        height=512
    )

    # Assert
    assert result is not None
    assert result["imageURL"] == "http://example.com/image.jpg"
    assert result["seed"] == 12345
    runware_client.imageInference.assert_called_once()


@pytest.mark.asyncio
async def test_generate_image_empty_prompt(runware_service):
    """Test error when prompt is empty."""
    with pytest.raises(ValueError, match="Prompt cannot be empty"):
        await runware_service.generate_image(
            prompt="",
            width=512,
            height=512
        )


@pytest.mark.asyncio
async def test_generate_image_api_error(runware_service, runware_client):
    """Test error when Runware API fails."""
    runware_service.client = runware_client
    runware_client.imageInference.side_effect = Exception("API error")

    with pytest.raises(Exception, match="Image generation failed"):
        await runware_service.generate_image(
            prompt="A beautiful sunset",
            width=512,
            height=512
        )
```

### Integration Tests

```python
# backend/tests/integration/test_api_endpoints.py
import pytest
from fastapi.testclient import TestClient
from backend.main import app


client = TestClient(app)


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_generate_image_endpoint():
    """Test image generation endpoint."""
    # Mock the service
    from unittest.mock import AsyncMock
    from backend.services.runware_service import RunwareService

    with patch.object(RunwareService, 'generate_image', new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = {
            "imageURL": "http://example.com/image.jpg",
            "seed": 12345
        }

        response = client.post(
            "/api/generate/text-to-image",
            json={
                "prompt": "A beautiful sunset",
                "width": 512,
                "height": 512
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["imageURL"] == "http://example.com/image.jpg"
```

---

## 🔷 TypeScript Testing

### Framework: Jest + React Testing Library

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific file
npm test PromptInput.test.tsx

# Run in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Component Tests

```typescript
// electron/renderer/components/__tests__/PromptInput.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PromptInput } from '../PromptInput';

describe('PromptInput', () => {
  const mockOnGenerate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders textarea and button', () => {
    render(<PromptInput onGenerate={mockOnGenerate} isGenerating={false} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
  });

  it('displays correct button text based on state', () => {
    const { rerender } = render(
      <PromptInput onGenerate={mockOnGenerate} isGenerating={false} />
    );

    expect(screen.getByRole('button')).toHaveTextContent('Generate');

    rerender(<PromptInput onGenerate={mockOnGenerate} isGenerating={true} />);
    expect(screen.getByRole('button')).toHaveTextContent('Generating...');
  });

  it('calls onGenerate when form is submitted', () => {
    render(<PromptInput onGenerate={mockOnGenerate} isGenerating={false} />);

    const textarea = screen.getByRole('textbox');
    const button = screen.getByRole('button');

    fireEvent.change(textarea, { target: { value: 'test prompt' } });
    fireEvent.click(button);

    expect(mockOnGenerate).toHaveBeenCalledWith('test prompt', {
      width: 512,
      height: 512,
      steps: 25,
      cfgScale: 7.5,
    });
  });

  it('does not call onGenerate when prompt is empty', () => {
    render(<PromptInput onGenerate={mockOnGenerate} isGenerating={false} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnGenerate).not.toHaveBeenCalled();
  });

  it('disables inputs when generating', () => {
    render(<PromptInput onGenerate={mockOnGenerate} isGenerating={true} />);

    const textarea = screen.getByRole('textbox');
    const button = screen.getByRole('button');

    expect(textarea).toBeDisabled();
    expect(button).toBeDisabled();
  });
});
```

### Store Tests

```typescript
// electron/renderer/store/__tests__/generationStore.test.ts
import { useGenerationStore } from '../generationStore';

describe('generationStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useGenerationStore.setState({
      isGenerating: false,
      progress: 0,
      currentImage: null,
      history: [],
    });
  });

  it('has initial state', () => {
    const store = useGenerationStore.getState();

    expect(store.isGenerating).toBe(false);
    expect(store.progress).toBe(0);
    expect(store.currentImage).toBeNull();
    expect(store.history).toEqual([]);
  });

  it('updates generating state', () => {
    const { setGenerating } = useGenerationStore.getState();

    setGenerating(true);

    expect(useGenerationStore.getState().isGenerating).toBe(true);

    setGenerating(false);

    expect(useGenerationStore.getState().isGenerating).toBe(false);
  });

  it('adds item to history', () => {
    const { addToHistory } = useGenerationStore.getState();

    const item = { id: 1, prompt: 'test' };
    addToHistory(item);

    expect(useGenerationStore.getState().history).toContain(item);
  });
});
```

---

## 🚀 E2E Testing

### Framework: Playwright

### Running E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run in headed mode
npm run test:e2e:headed

# Run with trace
npm run test:e2e:trace
```

### E2E Test Example

```typescript
// e2e/generation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Image Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should generate an image', async ({ page }) => {
    // Fill prompt
    await page.fill('textarea[name="prompt"]', 'A beautiful sunset');

    // Click generate button
    await page.click('button:has-text("Generate")');

    // Wait for generation to complete
    await expect(page.locator('text=Generating...')).toBeVisible();
    await expect(page.locator('text=Generating...')).not.toBeVisible();

    // Verify image is displayed
    await expect(page.locator('img')).toBeVisible();
  });

  test('should save generation to history', async ({ page }) => {
    // Generate an image
    await page.fill('textarea[name="prompt"]', 'test');
    await page.click('button:has-text("Generate")');
    await page.waitForSelector('img');

    // Navigate to history
    await page.click('a:has-text("History")');

    // Verify item in history
    await expect(page.locator('text=test')).toBeVisible();
  });
});
```

---

## 📊 Test Coverage

### Goals

- **Backend**: > 80% code coverage
- **Frontend**: > 80% code coverage
- **Critical paths**: 100% coverage

### Viewing Coverage

```bash
# Python coverage
pytest --cov=backend --cov-report=html
# Open htmlcov/index.html

# TypeScript coverage
npm run test:coverage
# Open coverage/lcov-report/index.html
```

---

## 🧪 Test Best Practices

### General

1. **Write tests first** (TDD)
2. **One assertion per test** when possible
3. **Arrange-Act-Assert** pattern
4. **Test edge cases**
5. **Mock external dependencies**
6. **Keep tests independent**

### Python

1. **Use fixtures** for setup
2. **Mock Runware API** in unit tests
3. **Test async code** with `@pytest.mark.asyncio`
4. **Use pytest markers** for test categorization

### TypeScript

1. **Test user interactions**
2. **Test async operations**
3. **Mock IPC calls**
4. **Test error states**

---

## 📝 Test Organization

```
tests/
├── unit/                  # Unit tests
│   ├── python/           # Python unit tests
│   │   ├── test_runware_service.py
│   │   ├── test_storage_service.py
│   │   └── test_api_endpoints.py
│   └── typescript/      # TypeScript unit tests
│       ├── components/
│       │   ├── PromptInput.test.tsx
│       │   └── ImageGallery.test.tsx
│       ├── stores/
│       │   └── generationStore.test.ts
│       └── utils/
│           └── api.test.ts
├── integration/          # Integration tests
│   ├── api/            # API endpoint tests
│   └── ipc/            # IPC communication tests
└── e2e/                # E2E tests
    ├── generation.spec.ts
    └── history.spec.ts
```

---

## 🚨 Common Issues

### Tests Timeout

```python
# Increase timeout for slow tests
@pytest.mark.timeout(60)
@pytest.mark.asyncio
async def test_slow_operation():
    pass
```

### Async Tests

```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Done')).toBeInTheDocument();
});
```

### Mocking IPC

```typescript
global.window = {
  electronAPI: {
    generate: {
      textToImage: jest.fn(),
    },
  },
} as any;
```

---

## ✅ Pre-commit Testing

Pre-commit hooks automatically run:

- Python tests (pytest)
- TypeScript tests (Jest)
- Linting (Ruff, ESLint)
- Formatting (Ruff, Prettier)

Run manually:

```bash
pre-commit run --all-files
```

---

**Last Updated**: 2026-01-02  
**Maintained By**: QA Team
