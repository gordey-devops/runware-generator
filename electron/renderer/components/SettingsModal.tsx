import { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff, Key, Settings as SettingsIcon } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import clsx from 'clsx';
import { api } from '../api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiSettings {
  apiKey: string;
  runwareApiKey?: string;
  outputDirectory: string;
  autoSaveImages: boolean;
  defaultWidth: number;
  defaultHeight: number;
  defaultSteps: number;
  defaultGuidanceScale: number;
  seed?: number;
  theme: 'dark' | 'light' | 'system';
  language: string;
  maxHistoryItems: number;
  enableNotifications: boolean;
  saveMetadata: boolean;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<ApiSettings>({
    apiKey: '',
    outputDirectory: '',
    autoSaveImages: true,
    defaultWidth: 1024,
    defaultHeight: 1024,
    defaultSteps: 20,
    defaultGuidanceScale: 7.5,
    theme: 'dark',
    language: 'en',
    maxHistoryItems: 1000,
    enableNotifications: true,
    saveMetadata: true,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const currentSettings = await api.settings.get();
      const apiKeyResult = await api.settings.getApiKey();

      setSettings((prev) => ({
        ...prev,
        ...currentSettings,
        apiKey: apiKeyResult.apiKey || '',
      }));
    } catch (err) {
      setError('Failed to load settings');
      console.error('Failed to load settings:', err);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const settingsToSave = {
        outputDirectory: settings.outputDirectory,
        autoSaveImages: settings.autoSaveImages,
        defaultWidth: settings.defaultWidth,
        defaultHeight: settings.defaultHeight,
        defaultSteps: settings.defaultSteps,
        defaultGuidanceScale: settings.defaultGuidanceScale,
        theme: settings.theme,
        language: settings.language,
        maxHistoryItems: settings.maxHistoryItems,
        enableNotifications: settings.enableNotifications,
        saveMetadata: settings.saveMetadata,
      };

      await api.settings.update(settingsToSave);

      if (settings.apiKey) {
        await api.settings.setApiKey(settings.apiKey);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Failed to save settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof ApiSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const getSizeLabel = (width: number, height: number): string => {
    return `${width}x${height}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              Settings saved successfully!
            </div>
          )}

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Key className="w-5 h-5" />
                Runware API
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.apiKey}
                    onChange={(e) => handleChange('apiKey', e.target.value)}
                    placeholder="Enter your Runware API key"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from{' '}
                  <a
                    href="https://docs.runware.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Runware documentation
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-4">Default Generation Parameters</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default Steps
                  </label>
                  <Input
                    type="number"
                    min="10"
                    max="50"
                    value={settings.defaultSteps}
                    onChange={(e) => handleChange('defaultSteps', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default Guidance Scale
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    step="0.5"
                    value={settings.defaultGuidanceScale}
                    onChange={(e) =>
                      handleChange('defaultGuidanceScale', parseFloat(e.target.value))
                    }
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Default Size</label>
                <select
                  value={getSizeLabel(settings.defaultWidth, settings.defaultHeight)}
                  onChange={(e) => {
                    const [width, height] = e.target.value.split('x').map(Number);
                    handleChange('defaultWidth', width);
                    handleChange('defaultHeight', height);
                  }}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="512x512">512 x 512</option>
                  <option value="768x768">768 x 768</option>
                  <option value="1024x1024">1024 x 1024</option>
                  <option value="1024x768">1024 x 768</option>
                  <option value="768x1024">768 x 1024</option>
                  <option value="1536x1024">1536 x 1024</option>
                  <option value="1024x1536">1024 x 1536</option>
                  <option value="2048x2048">2048 x 2048</option>
                </select>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-4">Storage & Output</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Output Directory
                </label>
                <div className="flex gap-2">
                  <Input
                    value={settings.outputDirectory}
                    onChange={(e) => handleChange('outputDirectory', e.target.value)}
                    placeholder="Leave empty for default"
                  />
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      try {
                        const path = await api.system.getPath('userData');
                        handleChange('outputDirectory', path.path);
                      } catch (err) {
                        setError('Failed to get default path');
                      }
                    }}
                  >
                    Default
                  </Button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSaveImages}
                    onChange={(e) => handleChange('autoSaveImages', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Auto-save all generations</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.saveMetadata}
                    onChange={(e) => handleChange('saveMetadata', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Save metadata (prompt, parameters)</span>
                </label>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-4">Appearance</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                <div className="flex gap-2">
                  {(['dark', 'light', 'system'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleChange('theme', theme)}
                      className={clsx(
                        'flex-1 px-4 py-2 rounded-lg border-2 transition-colors',
                        settings.theme === theme
                          ? 'border-blue-500 bg-blue-500/20 text-white'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'
                      )}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800 bg-gray-900/50">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
