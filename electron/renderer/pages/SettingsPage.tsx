import React from 'react';
import { Settings, Key, Folder, Palette, Globe, Database } from 'lucide-react';
import { useStore } from '../store/store';
import { useUiStore } from '../store/uiStore';
import { api } from '../api';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const { addNotification } = useUiStore();
  const [apiKey, setApiKey] = React.useState('');
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      addNotification('error', 'Пожалуйста, введите API ключ');
      return;
    }

    try {
      setIsSaving(true);
      const result = await api.settings.setApiKey(apiKey);

      if (result.success) {
        addNotification('success', 'API ключ успешно сохранен');
        updateSettings({ runwareApiKey: apiKey });
        setApiKey('');
      } else {
        addNotification('error', 'Не удалось сохранить API ключ');
      }
    } catch (error) {
      console.error('Failed to save API key:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      addNotification('error', `Ошибка при сохранении API ключа: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SettingsSection
        icon={Key}
        title="API настройки"
        description="Настройте подключение к Runware API"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">API ключ Runware</label>
            <div className="flex gap-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Введите API ключ"
                className="flex-1 bg-background-input border border-white/10 rounded-button px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-4 py-2 bg-background-input hover:bg-white/10 border border-white/10 rounded-button text-sm transition-colors"
              >
                {showApiKey ? 'Скрыть' : 'Показать'}
              </button>
            </div>
            <p className="text-xs text-foreground-muted">
              Получите API ключ на{' '}
              <a
                href="https://my.runware.ai/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                my.runware.ai
              </a>
            </p>
          </div>
          <button
            onClick={handleSaveApiKey}
            disabled={!apiKey.trim() || isSaving}
            className="w-full bg-primary hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-button text-sm font-medium transition-colors"
          >
            {isSaving ? 'Сохранение...' : 'Сохранить API ключ'}
          </button>
        </div>
      </SettingsSection>

      <SettingsSection icon={Folder} title="Хранилище" description="Настройте сохранение файлов">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Папка для сохранения</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.outputDirectory}
                readOnly
                className="flex-1 bg-background-input border border-white/10 rounded-button px-4 py-2 text-sm focus:outline-none"
              />
              <button
                onClick={() => {
                  // TODO: Implement folder selection
                  console.log('Select folder');
                }}
                className="px-4 py-2 bg-background-input hover:bg-white/10 border border-white/10 rounded-button text-sm transition-colors"
              >
                Выбрать
              </button>
            </div>
          </div>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">Автосохранение изображений</span>
            <input
              type="checkbox"
              checked={settings.autoSaveImages}
              onChange={(e) => updateSettings({ autoSaveImages: e.target.checked })}
              className="w-4 h-4 rounded bg-background-input border-white/10 text-primary focus:ring-primary focus:ring-offset-0"
            />
          </label>
        </div>
      </SettingsSection>

      <SettingsSection icon={Palette} title="Внешний вид" description="Настройте тему интерфейса">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Тема</label>
            <div className="flex gap-2">
              {['dark', 'light', 'system'].map((theme) => (
                <button
                  key={theme}
                  onClick={() => updateSettings({ theme: theme as any })}
                  className={`flex-1 py-2 px-4 rounded-button text-sm font-medium transition-colors ${
                    settings.theme === theme
                      ? 'bg-primary text-white'
                      : 'bg-background-input hover:bg-white/10 text-foreground'
                  }`}
                >
                  {theme === 'dark' ? 'Темная' : theme === 'light' ? 'Светлая' : 'Системная'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Язык</label>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value })}
              className="w-full bg-background-input border border-white/10 rounded-button px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Database}
        title="Параметры генерации"
        description="Значения по умолчанию"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Ширина по умолчанию</label>
            <input
              type="number"
              value={settings.defaultWidth}
              onChange={(e) => updateSettings({ defaultWidth: parseInt(e.target.value) })}
              className="w-full bg-background-input border border-white/10 rounded-button px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Высота по умолчанию</label>
            <input
              type="number"
              value={settings.defaultHeight}
              onChange={(e) => updateSettings({ defaultHeight: parseInt(e.target.value) })}
              className="w-full bg-background-input border border-white/10 rounded-button px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Шаги (Steps)</label>
            <input
              type="number"
              value={settings.defaultSteps}
              onChange={(e) => updateSettings({ defaultSteps: parseInt(e.target.value) })}
              className="w-full bg-background-input border border-white/10 rounded-button px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Guidance Scale</label>
            <input
              type="number"
              step="0.1"
              value={settings.defaultGuidanceScale}
              onChange={(e) => updateSettings({ defaultGuidanceScale: parseFloat(e.target.value) })}
              className="w-full bg-background-input border border-white/10 rounded-button px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </SettingsSection>
    </div>
  );
};

const SettingsSection: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, description, children }) => {
  return (
    <div className="bg-background-card rounded-card p-6 shadow-card">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="text-primary" size={20} />
        </div>
        <div>
          <h2 className="font-semibold text-lg">{title}</h2>
          <p className="text-sm text-foreground-muted">{description}</p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};
