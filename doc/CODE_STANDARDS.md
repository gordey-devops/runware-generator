# 📝 Code Standards

**Last Updated**: 2026-01-02

---

## 🐍 Python Code Standards

### General Guidelines

- **PEP 8 Compliance**: Follow PEP 8 style guide
- **Type Hints**: Required for all functions
- **Docstrings**: Google/NumPy style
- **Max Line Length**: 100 characters
- **Encoding**: UTF-8

### Type Hints

```python
from typing import Optional, List, Dict, Any

def generate_image(
    prompt: str,
    width: int = 512,
    height: int = 512,
    steps: int = 25,
    seed: Optional[int] = None,
) -> Dict[str, Any]:
    """Generate an image from text prompt.

    Args:
        prompt: Text description of the image
        width: Image width in pixels
        height: Image height in pixels
        steps: Number of inference steps
        seed: Random seed for reproducibility

    Returns:
        Dictionary containing generation results
    """
    pass
```

### Docstrings

```python
class RunwareService:
    """Service for interacting with Runware API.

    This class provides methods for image and video generation
    using the Runware SDK. It handles connection management,
    error handling, and retry logic.

    Attributes:
        api_key: Runware API key
        client: Runware SDK client instance
    """

    def __init__(self, api_key: str) -> None:
        """Initialize Runware service.

        Args:
            api_key: Runware API key
        """
        self.api_key = api_key
        self.client = None
```

### Naming Conventions

```python
# Variables and functions: snake_case
user_name = "John"
def get_user_data():
    pass

# Classes: PascalCase
class UserService:
    pass

# Constants: UPPER_SNAKE_CASE
MAX_RETRIES = 3
API_TIMEOUT = 30

# Private methods: _leading_underscore
def _internal_method():
    pass
```

### Error Handling

```python
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)

async def generate_image(prompt: str) -> Dict[str, Any]:
    try:
        result = await runware_client.generate(prompt=prompt)
        return result
    except ConnectionError as e:
        logger.error(f"Connection failed: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

---

## 🔷 TypeScript Code Standards

### General Guidelines

- **Strict Mode**: Enabled
- **Explicit Types**: Recommended for returns
- **Quotes**: Single quotes
- **Max Line Length**: 100 characters
- **No Any**: Avoid using `any` type

### Type Definitions

```typescript
interface GenerateImageRequest {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  seed?: number;
}

interface GenerateImageResponse {
  success: boolean;
  data: {
    id: number;
    filePath: string;
    url: string;
  } | null;
  error?: string;
}

type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error';
```

### Function Syntax

```typescript
// Function with explicit return type
async function generateImage(
  prompt: string,
  params: GenerateImageRequest
): Promise<GenerateImageResponse> {
  try {
    const result = await window.electronAPI.generate.textToImage({
      prompt,
      ...params,
    });
    return result;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

### React Components

```typescript
import React from 'react';

interface PromptInputProps {
  onGenerate: (prompt: string, params: any) => void;
  isGenerating: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  onGenerate,
  isGenerating,
}) => {
  const [prompt, setPrompt] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt, {});
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={isGenerating}
      />
      <button type="submit" disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate'}
      </button>
    </form>
  );
};
```

### Naming Conventions

```typescript
// Variables and functions: camelCase
const userName = 'John';
function getUserData() {}

// Classes/Components: PascalCase
class UserService {}
const PromptInput: React.FC<Props> = ({}) => {};

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Interfaces: PascalCase with I prefix (optional)
interface IUser {}
// or without prefix (recommended)
interface User {}

// Types: PascalCase
type GenerationStatus = 'idle' | 'generating';
```

---

## 📦 File Organization

### Python Structure

```python
# backend/services/runware_service.py
from typing import Optional, Dict, Any
import logging

from runware import Runware
from ..core.config import settings

logger = logging.getLogger(__name__)


class RunwareService:
    """Service for Runware API interactions."""

    def __init__(self, api_key: str) -> None:
        self.api_key = api_key
        self.client: Optional[Runware] = None

    async def connect(self) -> None:
        """Connect to Runware API."""
        pass
```

### TypeScript Structure

```typescript
// electron/renderer/components/PromptInput.tsx
import React from 'react';

interface Props {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

export const PromptInput: React.FC<Props> = ({ onGenerate, isGenerating }) => {
  // Implementation
};
```

---

## 🧪 Testing Standards

### Python Tests

```python
import pytest
from unittest.mock import Mock, AsyncMock
from backend.services.runware_service import RunwareService


@pytest.fixture
def mock_runware_client():
    """Create mock Runware client."""
    client = Mock()
    client.imageInference = AsyncMock()
    return client


@pytest.mark.asyncio
async def test_generate_image_success(mock_runware_client):
    """Test successful image generation."""
    service = RunwareService(api_key="test_key")
    service.client = mock_runware_client

    # Mock response
    mock_runware_client.imageInference.return_value = [
        {"imageURL": "http://example.com/image.jpg"}
    ]

    result = await service.generate_image(prompt="test prompt")

    assert result is not None
    assert "imageURL" in result
```

### TypeScript Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptInput } from './PromptInput';

describe('PromptInput', () => {
  const mockOnGenerate = jest.fn();

  it('renders textarea and button', () => {
    render(<PromptInput onGenerate={mockOnGenerate} isGenerating={false} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onGenerate when form is submitted', () => {
    render(<PromptInput onGenerate={mockOnGenerate} isGenerating={false} />);

    const textarea = screen.getByRole('textbox');
    const button = screen.getByRole('button');

    fireEvent.change(textarea, { target: { value: 'test prompt' } });
    fireEvent.click(button);

    expect(mockOnGenerate).toHaveBeenCalledWith('test prompt', {});
  });
});
```

---

## 📝 Documentation

### Python Docstrings

```python
def generate_image(
    prompt: str,
    width: int = 512,
    height: int = 512,
) -> Dict[str, Any]:
    """Generate an image from text prompt.

    This function uses the Runware API to generate an AI image
    based on the provided text prompt.

    Args:
        prompt: Text description of the desired image
        width: Image width in pixels (default: 512)
        height: Image height in pixels (default: 512)

    Returns:
        Dictionary containing:
            - imageURL (str): URL of generated image
            - seed (int): Random seed used

    Raises:
        ValueError: If prompt is empty
        ConnectionError: If API connection fails

    Example:
        >>> result = generate_image("A beautiful sunset")
        >>> print(result['imageURL'])
        'http://runware.ai/image/...'
    """
    if not prompt:
        raise ValueError("Prompt cannot be empty")

    # Implementation
    pass
```

### TypeScript JSDoc

````typescript
/**
 * Generate an image from text prompt.
 *
 * @param prompt - Text description of the desired image
 * @param params - Generation parameters
 * @returns Promise with generation result
 *
 * @example
 * ```ts
 * const result = await generateImage("A beautiful sunset", {
 *   width: 512,
 *   height: 512
 * });
 * ```
 */
async function generateImage(
  prompt: string,
  params: GenerateImageRequest
): Promise<GenerateImageResponse> {
  // Implementation
}
````

---

## ✅ Code Quality Checklist

Before committing code, ensure:

### Python

- [ ] Type hints for all functions
- [ ] Docstrings for all public functions/classes
- [ ] Error handling where needed
- [ ] Logging for important operations
- [ ] Unit tests for new features
- [ ] Ruff checks pass: `ruff check .`
- [ ] Ruff format applied: `ruff format .`
- [ ] Type checks pass: `mypy backend/`

### TypeScript

- [ ] Explicit return types
- [ ] No `any` types (unless unavoidable)
- [ ] Proper TypeScript interfaces
- [ ] Component tests written
- [ ] ESLint checks pass: `npm run lint`
- [ ] Prettier format applied: `npm run format`
- [ ] Type checks pass: `npm run type-check`

---

## 🎯 Best Practices

### Python

1. **Use async/await** for I/O operations
2. **Context managers** for resources: `with`, `async with`
3. **Dataclasses** for data models
4. **Pathlib** for file paths
5. **F-strings** for string formatting

### TypeScript

1. **Use functional components** with hooks
2. **Avoid direct state mutations**
3. **Use memoization** for expensive computations
4. **Custom hooks** for reusable logic
5. **Prop drilling** vs context vs state management

---

## 📚 References

- [PEP 8](https://peps.python.org/pep-0008/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [FastAPI Best Practices](https://fastapi.tiangolo.com/tutorial/)

---

**Last Updated**: 2026-01-02  
**Maintained By**: Development Team
