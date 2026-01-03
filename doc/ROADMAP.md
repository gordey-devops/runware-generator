# Runware Generator - Technical Roadmap

## Цель проекта
Desktop приложение (Electron + Python) для генерации изображений и видео с использованием Runware SDK.

## Архитектурное решение

### Выбранный стек:
- **Frontend**: Electron + React + TypeScript + TailwindCSS
- **Backend**: Python + FastAPI + Runware SDK
- **Communication**: REST API + WebSocket для real-time прогресса
- **Storage**: SQLite для истории генераций
- **State**: Zustand для React state management

### Структура проекта:
```
runware-generator/
├── backend/              # Python FastAPI server
│   ├── api/             # API endpoints
│   ├── services/        # Business logic (Runware integration)
│   ├── core/            # Config, DB, security
│   ├── models/          # Database models
│   └── main.py          # Entry point
├── electron/            # Electron app
│   ├── main/           # Main process (Node.js)
│   ├── preload/        # IPC bridge
│   └── resources/      # Icons, assets
├── src/                # React frontend (renderer process)
│   ├── components/     # UI components
│   ├── pages/          # Pages/routes
│   ├── store/          # Zustand stores
│   ├── hooks/          # Custom hooks
│   └── utils/          # Utilities
├── shared/             # Shared TypeScript types
└── scripts/            # Build scripts
```

---

## 📅 Поэтапный план реализации

### ФАЗА 0: Исследование и подготовка (1-2 дня)

#### Задачи:
- [x] Изучить START.md с roadmap
- [ ] Получить Runware API ключ (test mode)
- [ ] Клонировать и изучить Runware SDK: https://github.com/Runware/sdk-python
- [ ] Протестировать базовые вызовы SDK локально
- [ ] Определить MVP scope (минимальные фичи)

#### Критерии готовности:
- ✅ API ключ получен
- ✅ SDK работает локально
- ✅ Понятен список фич для MVP

---

### ФАЗА 1: Реструктуризация проекта (1 день)

#### 1.1 Создание структуры директорий

**Backend:**
```bash
mkdir -p backend/api/endpoints
mkdir -p backend/services
mkdir -p backend/core
mkdir -p backend/models
mkdir -p backend/utils
```

**Electron:**
```bash
mkdir -p electron/main
mkdir -p electron/preload
mkdir -p electron/resources
mkdir -p shared/types
```

**Frontend реструктуризация:**
```bash
# Переместить существующий src/ в electron/renderer
mv src electron/renderer

# Создать новую структуру
mkdir -p electron/renderer/components
mkdir -p electron/renderer/pages
mkdir -p electron/renderer/store
mkdir -p electron/renderer/hooks
mkdir -p electron/renderer/utils
```

#### 1.2 Обновление конфигураций

**Python:**
- Обновить `requirements.txt`:
  ```
  runware-sdk-python
  fastapi>=0.109.0
  uvicorn[standard]>=0.27.0
  python-multipart>=0.0.6
  pydantic>=2.5.0
  pydantic-settings>=2.1.0
  python-dotenv>=1.0.0
  aiofiles>=23.2.0
  pillow>=10.2.0
  sqlalchemy>=2.0.0
  websockets>=12.0
  ```

**TypeScript/Electron:**
- Обновить `package.json` (добавить Electron зависимости):
  ```json
  {
    "dependencies": {
      "electron-is-dev": "^2.0.0",
      "axios": "^1.6.0",
      "zustand": "^4.4.0",
      "react-router-dom": "^6.21.0"
    },
    "devDependencies": {
      "electron": "^28.0.0",
      "electron-builder": "^24.9.0",
      "vite": "^5.0.0",
      "@vitejs/plugin-react": "^4.2.0",
      "concurrently": "^8.2.0",
      "wait-on": "^7.2.0"
    }
  }
  ```

#### Критерии готовности:
- ✅ Вся структура директорий создана
- ✅ Зависимости установлены
- ✅ Конфиги обновлены

---

### ФАЗА 2: Python Backend - Core Setup (2-3 дня)

#### 2.1 Базовая конфигурация

**backend/core/config.py:**
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Runware API
    RUNWARE_API_KEY: str
    
    # Server
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Storage
    STORAGE_PATH: str = "./generated"
    DATABASE_URL: str = "sqlite:///./runware.db"
    
    # Limits
    MAX_CONCURRENT_TASKS: int = 3
    
    class Config:
        env_file = ".env"

settings = Settings()
```

**backend/.env.example:**
```
RUNWARE_API_KEY=your_api_key_here
STORAGE_PATH=./generated
```

#### 2.2 Database setup

**backend/core/database.py:**
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**backend/models/generation.py:**
```python
from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from ..core.database import Base

class Generation(Base):
    __tablename__ = "generations"
    
    id = Column(Integer, primary_key=True)
    type = Column(String)  # "image" or "video"
    prompt = Column(String)
    parameters = Column(JSON)
    file_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### 2.3 Runware Service

**backend/services/runware_service.py:**
```python
from typing import Optional, Dict, Any
import asyncio
from runware import Runware  # Проверить точный import

class RunwareService:
    def __init__(self, api_key: str):
        self.client = Runware(api_key=api_key)
        self.active_tasks = {}
    
    async def generate_image(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 1024,
        height: int = 1024,
        num_images: int = 1,
        steps: int = 25,
        guidance_scale: float = 7.5,
        seed: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Generate image using Runware API"""
        try:
            # Actual SDK call - adjust based on real SDK
            result = await self.client.generate(
                prompt=prompt,
                negative_prompt=negative_prompt,
                width=width,
                height=height,
                num_images=num_images,
                steps=steps,
                guidance_scale=guidance_scale,
                seed=seed
            )
            return result
        except Exception as e:
            raise Exception(f"Image generation failed: {str(e)}")
    
    async def upscale_image(
        self,
        image_path: str,
        scale: int = 2
    ) -> Dict[str, Any]:
        """Upscale image"""
        # Implementation
        pass
```

#### 2.4 FastAPI setup

**backend/main.py:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import engine, Base
from .api.endpoints import generate, history

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Runware Generator API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For Electron
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(generate.router, prefix="/api/generate", tags=["generation"])
app.include_router(history.router, prefix="/api/history", tags=["history"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}
```

**backend/api/endpoints/generate.py:**
```python
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from ...services.runware_service import RunwareService
from ...core.config import settings

router = APIRouter()
runware = RunwareService(api_key=settings.RUNWARE_API_KEY)

class ImageGenerationRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None
    width: int = 1024
    height: int = 1024
    num_images: int = 1
    steps: int = 25
    guidance_scale: float = 7.5
    seed: Optional[int] = None

@router.post("/text-to-image")
async def generate_text_to_image(request: ImageGenerationRequest):
    try:
        result = await runware.generate_image(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            width=request.width,
            height=request.height,
            num_images=request.num_images,
            steps=request.steps,
            guidance_scale=request.guidance_scale,
            seed=request.seed
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### Критерии готовности:
- ✅ FastAPI сервер запускается
- ✅ Database создается автоматически
- ✅ Тестовый вызов Runware работает
- ✅ Endpoint `/api/generate/text-to-image` отвечает

---

### ФАЗА 3: Electron Application Setup (2-3 дня)

#### 3.1 Main Process

**electron/main/main.ts:**
```typescript
import { app, BrowserWindow } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { PythonBridge } from './pythonBridge';
import { setupIpcHandlers } from './ipcHandlers';

let mainWindow: BrowserWindow | null = null;
let pythonBridge: PythonBridge;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load React app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../renderer/dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().async () => {
  // Start Python backend
  pythonBridge = new PythonBridge();
  await pythonBridge.start();
  
  // Setup IPC handlers
  setupIpcHandlers(pythonBridge);
  
  await createWindow();
});

app.on('window-all-closed', async () => {
  await pythonBridge.stop();
  app.quit();
});
```

**electron/main/pythonBridge.ts:**
```typescript
import { spawn, ChildProcess } from 'child_process';
import axios from 'axios';
import path from 'path';

export class PythonBridge {
  private process: ChildProcess | null = null;
  private baseURL = 'http://127.0.0.1:8000';

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      // In development: use local Python
      // In production: use packaged Python executable
      const pythonPath = process.env.NODE_ENV === 'production'
        ? path.join(process.resourcesPath, 'python', 'main.exe')
        : 'python';

      const scriptPath = process.env.NODE_ENV === 'production'
        ? path.join(process.resourcesPath, 'backend', 'main.py')
        : path.join(__dirname, '../../backend/main.py');

      this.process = spawn(pythonPath, ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', '8000']);

      this.process.stdout?.on('data', (data) => {
        console.log(`Python: ${data}`);
        if (data.toString().includes('Application startup complete')) {
          resolve();
        }
      });

      this.process.stderr?.on('data', (data) => {
        console.error(`Python Error: ${data}`);
      });

      this.process.on('error', (error) => {
        reject(error);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        this.checkHealth().then(resolve).catch(reject);
      }, 10000);
    });
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.data.status === 'ok';
    } catch {
      return false;
    }
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}
```

**electron/main/ipcHandlers.ts:**
```typescript
import { ipcMain } from 'electron';
import axios from 'axios';
import { PythonBridge } from './pythonBridge';

export function setupIpcHandlers(pythonBridge: PythonBridge) {
  const baseURL = pythonBridge.getBaseURL();

  ipcMain.handle('generate:text-to-image', async (event, params) => {
    try {
      const response = await axios.post(`${baseURL}/api/generate/text-to-image`, params);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Generation failed');
    }
  });

  ipcMain.handle('history:get', async () => {
    try {
      const response = await axios.get(`${baseURL}/api/history`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch history');
    }
  });
}
```

#### 3.2 Preload Script

**electron/preload/preload.ts:**
```typescript
import { contextBridge, ipcRenderer } from 'electron';

const api = {
  generate: {
    textToImage: (params: any) => ipcRenderer.invoke('generate:text-to-image', params),
    imageToImage: (params: any) => ipcRenderer.invoke('generate:image-to-image', params),
    upscale: (params: any) => ipcRenderer.invoke('generate:upscale', params),
  },
  history: {
    get: () => ipcRenderer.invoke('history:get'),
    delete: (id: number) => ipcRenderer.invoke('history:delete', id),
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);

// TypeScript types
export type ElectronAPI = typeof api;
```

**shared/types/electron.d.ts:**
```typescript
import { ElectronAPI } from '../../electron/preload/preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

#### 3.3 Vite Configuration

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: './electron/renderer',
  build: {
    outDir: '../../dist/renderer',
  },
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './electron/renderer'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
});
```

#### Критерии готовности:
- ✅ Electron приложение запускается
- ✅ Python backend стартует автоматически
- ✅ IPC коммуникация работает
- ✅ React dev server подключен

---

### ФАЗА 4: React UI - Core Components (3-4 дня)

#### 4.1 Store Setup (Zustand)

**electron/renderer/store/generationStore.ts:**
```typescript
import create from 'zustand';

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  currentImage: string | null;
  history: any[];
  setGenerating: (value: boolean) => void;
  setProgress: (value: number) => void;
  setCurrentImage: (value: string) => void;
  addToHistory: (item: any) => void;
}

export const useGenerationStore = create<GenerationState>((set) => ({
  isGenerating: false,
  progress: 0,
  currentImage: null,
  history: [],
  setGenerating: (value) => set({ isGenerating: value }),
  setProgress: (value) => set({ progress: value }),
  setCurrentImage: (value) => set({ currentImage: value }),
  addToHistory: (item) => set((state) => ({ history: [item, ...state.history] })),
}));
```

#### 4.2 Main Components

**electron/renderer/components/PromptInput.tsx:**
```typescript
import React, { useState } from 'react';

interface PromptInputProps {
  onGenerate: (prompt: string, params: any) => void;
  isGenerating: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt, { negative_prompt: negativePrompt });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-3 border rounded-lg"
          rows={4}
          placeholder="Describe the image you want to generate..."
          disabled={isGenerating}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Negative Prompt</label>
        <input
          type="text"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          className="w-full p-3 border rounded-lg"
          placeholder="What to avoid..."
          disabled={isGenerating}
        />
      </div>
      
      <button
        type="submit"
        disabled={isGenerating || !prompt.trim()}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isGenerating ? 'Generating...' : 'Generate Image'}
      </button>
    </form>
  );
};
```

**electron/renderer/pages/GeneratorPage.tsx:**
```typescript
import React from 'react';
import { PromptInput } from '../components/PromptInput';
import { useGenerationStore } from '../store/generationStore';

export const GeneratorPage: React.FC = () => {
  const { isGenerating, setGenerating, currentImage, setCurrentImage } = useGenerationStore();

  const handleGenerate = async (prompt: string, params: any) => {
    setGenerating(true);
    try {
      const result = await window.electronAPI.generate.textToImage({
        prompt,
        ...params,
      });
      
      if (result.success) {
        setCurrentImage(result.data.image_url);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate image');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Runware Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <PromptInput onGenerate={handleGenerate} isGenerating={isGenerating} />
        </div>
        
        <div className="border rounded-lg p-4">
          {currentImage ? (
            <img src={currentImage} alt="Generated" className="w-full rounded" />
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-400">
              Generated image will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

#### Критерии готовности:
- ✅ UI отображается корректно
- ✅ Форма промпта работает
- ✅ Генерация запускается через IPC
- ✅ Результат отображается

---

### ФАЗА 5: Advanced Features (4-5 дней)

#### 5.1 WebSocket для прогресса
#### 5.2 История генераций
#### 5.3 Параметры генерации
#### 5.4 Batch processing
#### 5.5 Image-to-Image
#### 5.6 Video generation

---

### ФАЗА 6: Polish & Optimization (2-3 дня)

#### 6.1 Error handling
#### 6.2 Loading states
#### 6.3 UI/UX improvements
#### 6.4 Performance optimization

---

### ФАЗА 7: Build & Package (2-3 дня)

#### 7.1 PyInstaller setup
#### 7.2 Electron Builder config
#### 7.3 Testing on target platforms
#### 7.4 Create installers

---

## MVP Checklist

Минимальные фичи для первого релиза:

- [ ] Text-to-Image generation
- [ ] Basic parameters (size, steps, guidance)
- [ ] Save generated images locally
- [ ] Simple history view
- [ ] Settings for API key
- [ ] Working build for Windows

## Следующие шаги

1. **Немедленно**: Получить Runware API key
2. **День 1**: Изучить Runware SDK и сделать proof-of-concept
3. **День 2**: Реструктурировать проект (Фаза 1)
4. **День 3-5**: Реализовать Python backend (Фаза 2)
5. **День 6-8**: Настроить Electron (Фаза 3)
6. **День 9-12**: Базовый UI (Фаза 4)
7. **Далее**: Итеративно добавлять фичи

## Риски и митигация

| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| Runware API лимиты | Высокая | Кэширование, rate limiting UI |
| IPC сложности | Средняя | Использовать проверенные паттерны |
| Build issues | Средняя | Тестировать рано и часто |
| Performance | Низкая | Async везде, оптимизация изображений |

## Полезные ссылки

- Runware SDK: https://github.com/Runware/sdk-python
- Electron Docs: https://www.electronjs.org/docs
- FastAPI Docs: https://fastapi.tiangolo.com/
- React + Electron: https://www.electronforge.io/

---

**Обновлено**: 2026-01-02
