# 🪟 IPC API Documentation

**Last Updated**: 2026-01-02

---

## 📋 Overview

Electron IPC (Inter-Process Communication) provides secure communication between the main process and renderer process.

### Security

- **Context Isolation**: Enabled
- **Node Integration**: Disabled
- **Preload Script**: Bridges only specific APIs
- **Type Safety**: Full TypeScript support

---

## 🔗 Available APIs

### Generation APIs

#### electronAPI.generate.textToImage

Generate an image from text prompt.

**Usage in Renderer:**

```typescript
const result = await window.electronAPI.generate.textToImage({
  prompt: 'A beautiful sunset',
  negativePrompt: 'blurry, low quality',
  width: 512,
  height: 512,
  steps: 25,
  cfgScale: 7.5,
  seed: 42,
});
```

**Request:**

```typescript
interface TextToImageRequest {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  seed?: number;
}
```

**Response:**

```typescript
interface GenerateResponse {
  success: boolean;
  data?: {
    id: number;
    filePath: string;
    url: string;
    seed: number;
    createdAt: string;
  };
  error?: string;
}
```

#### electronAPI.generate.imageToImage

Transform an image using text prompt.

**Usage:**

```typescript
const result = await window.electronAPI.generate.imageToImage({
  seedImagePath: '/path/to/image.jpg',
  prompt: 'A futuristic version',
  strength: 0.7,
});
```

#### electronAPI.generate.upscale

Upscale an image.

**Usage:**

```typescript
const result = await window.electronAPI.generate.upscale({
  imagePath: '/path/to/image.jpg',
  scale: 2,
});
```

---

### History APIs

#### electronAPI.history.get

Get all generations.

**Usage:**

```typescript
const result = await window.electronAPI.history.get({
  limit: 50,
  type: 'image',
});
```

**Request:**

```typescript
interface GetHistoryRequest {
  limit?: number;
  offset?: number;
  type?: 'image' | 'video';
}
```

**Response:**

```typescript
interface GetHistoryResponse {
  success: boolean;
  data?: Generation[];
  total?: number;
  error?: string;
}
```

#### electronAPI.history.getById

Get specific generation by ID.

**Usage:**

```typescript
const result = await window.electronAPI.history.getById(1);
```

#### electronAPI.history.delete

Delete a generation.

**Usage:**

```typescript
const result = await window.electronAPI.history.delete(1);
```

---

### Settings APIs

#### electronAPI.settings.get

Get application settings.

**Usage:**

```typescript
const settings = await window.electronAPI.settings.get();
```

**Response:**

```typescript
interface Settings {
  storagePath: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultSteps: number;
  defaultCfgScale: number;
}
```

#### electronAPI.settings.update

Update application settings.

**Usage:**

```typescript
await window.electronAPI.settings.update({
  defaultWidth: 768,
  defaultHeight: 768,
});
```

---

### File System APIs

#### electronAPI.fs.selectFile

Open file selection dialog.

**Usage:**

```typescript
const filePath = await window.electronAPI.fs.selectFile({
  filters: [{ name: 'Images', extensions: ['jpg', 'png'] }],
  properties: ['openFile'],
});
```

**Response:**

```typescript
interface SelectFileResponse {
  filePath: string | null;
  canceled: boolean;
}
```

#### electronAPI.fs.saveFile

Open save file dialog.

**Usage:**

```typescript
const filePath = await window.electronAPI.fs.saveFile({
  defaultPath: 'image.jpg',
  filters: [{ name: 'JPEG', extensions: ['jpg'] }],
});
```

#### electronAPI.fs.openPath

Open file in system default viewer.

**Usage:**

```typescript
await window.electronAPI.fs.openPath('/path/to/image.jpg');
```

---

### Window APIs

#### electronAPI.window.minimize

Minimize window.

**Usage:**

```typescript
await window.electronAPI.window.minimize();
```

#### electronAPI.window.maximize

Maximize window.

**Usage:**

```typescript
await window.electronAPI.window.maximize();
```

#### electronAPI.window.close

Close window.

**Usage:**

```typescript
await window.electronAPI.window.close();
```

---

## 🔌 IPC Handlers (Main Process)

### Handler: generate:text-to-image

```typescript
ipcMain.handle('generate:text-to-image', async (event, params) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/generate/text-to-image`, params);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Generation failed',
    };
  }
});
```

### Handler: history:get

```typescript
ipcMain.handle('history:get', async (event, params) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/history`, {
      params,
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to fetch history',
    };
  }
});
```

---

## 📝 Type Definitions

### Global Window Interface

```typescript
// electron/preload/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

const api = {
  generate: {
    textToImage: (params: TextToImageRequest) =>
      ipcRenderer.invoke('generate:text-to-image', params),
    imageToImage: (params: ImageToImageRequest) =>
      ipcRenderer.invoke('generate:image-to-image', params),
    upscale: (params: UpscaleRequest) => ipcRenderer.invoke('generate:upscale', params),
  },
  history: {
    get: (params?: GetHistoryRequest) => ipcRenderer.invoke('history:get', params),
    getById: (id: number) => ipcRenderer.invoke('history:get-by-id', id),
    delete: (id: number) => ipcRenderer.invoke('history:delete', id),
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (settings: Partial<Settings>) => ipcRenderer.invoke('settings:update', settings),
  },
  fs: {
    selectFile: (options?: any) => ipcRenderer.invoke('fs:select-file', options),
    saveFile: (options?: any) => ipcRenderer.invoke('fs:save-file', options),
    openPath: (path: string) => ipcRenderer.invoke('fs:open-path', path),
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);

export type ElectronAPI = typeof api;
```

### Shared Types

```typescript
// shared/types/index.ts
export interface Generation {
  id: number;
  type: 'image' | 'video';
  prompt: string;
  negativePrompt?: string;
  parameters: GenerationParameters;
  filePath: string;
  url: string;
  createdAt: string;
}

export interface GenerationParameters {
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  seed?: number;
}

export interface Settings {
  storagePath: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultSteps: number;
  defaultCfgScale: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

## 🔐 Security Best Practices

### In Main Process

1. **Validate all input** before processing
2. **Use IPC handlers** (not IPC send/receive)
3. **Never expose sensitive data** to renderer
4. **Use safe file paths** (prevent directory traversal)
5. **Rate limit operations** if needed

### In Renderer Process

1. **Only use exposed APIs** via `window.electronAPI`
2. **Never try to access Node.js directly**
3. **Validate responses** before using
4. **Handle errors gracefully**
5. **Don't expose sensitive data** in logs

---

## 🧪 Testing IPC

### Mocking for Unit Tests

```typescript
// electron/renderer/components/__tests__/PromptInput.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptInput } from '../PromptInput';

// Mock electronAPI
const mockElectronAPI = {
  generate: {
    textToImage: jest.fn(),
  },
};

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
});

describe('PromptInput', () => {
  it('calls generate on submit', async () => {
    render(<PromptInput onGenerate={jest.fn()} isGenerating={false} />);

    const textarea = screen.getByRole('textbox');
    const button = screen.getByRole('button');

    fireEvent.change(textarea, { target: { value: 'test prompt' } });
    fireEvent.click(button);

    expect(mockElectronAPI.generate.textToImage).toHaveBeenCalledWith({
      prompt: 'test prompt',
      width: 512,
      height: 512,
      steps: 25,
      cfgScale: 7.5,
    });
  });
});
```

---

## 📚 Examples

### Complete Generation Flow

```typescript
// electron/renderer/pages/GeneratorPage.tsx
import React from 'react';
import { useGenerationStore } from '../store/generationStore';

export const GeneratorPage: React.FC = () => {
  const { isGenerating, setGenerating, setCurrentImage } = useGenerationStore();

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await window.electronAPI.generate.textToImage({
        prompt: "A beautiful sunset over mountains",
        width: 512,
        height: 512,
        steps: 25,
        cfgScale: 7.5,
      });

      if (result.success && result.data) {
        setCurrentImage(result.data.filePath);
      } else {
        alert(`Generation failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('An error occurred');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating}
    >
      {isGenerating ? 'Generating...' : 'Generate'}
    </button>
  );
};
```

---

**Last Updated**: 2026-01-02  
**Maintained By**: Frontend Developer
