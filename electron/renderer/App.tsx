import React, { useState } from 'react';
import { X, Settings, History, Sparkles } from 'lucide-react';
import { GeneratorPage } from './pages/GeneratorPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { Notifications } from './components/Notifications';

type Page = 'generator' | 'history' | 'settings';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('generator');

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-hidden">
        <Header currentPage={currentPage} />
        <div className="h-[calc(100%-64px)] overflow-y-auto p-6">
          <AnimateTransition>
            {currentPage === 'generator' && <GeneratorPage />}
            {currentPage === 'history' && <HistoryPage />}
            {currentPage === 'settings' && <SettingsPage />}
          </AnimateTransition>
        </div>
      </main>
      <Notifications />
    </div>
  );
};

const Sidebar: React.FC<{ currentPage: Page; onPageChange: (page: Page) => void }> = ({
  currentPage,
  onPageChange,
}) => {
  const items = [
    { id: 'generator' as Page, icon: Sparkles, label: 'Генерация' },
    { id: 'history' as Page, icon: History, label: 'История' },
    { id: 'settings' as Page, icon: Settings, label: 'Настройки' },
  ];

  return (
    <nav className="w-16 flex-shrink-0 bg-background border-r border-white/10 flex flex-col items-center py-4 gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group ${
              isActive
                ? 'bg-primary text-white shadow-lg'
                : 'text-foreground-muted hover:bg-background-card hover:text-foreground'
            }`}
            title={item.label}
          >
            <Icon size={20} />
            <span className="absolute left-14 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

const Header: React.FC<{ currentPage: Page }> = ({ currentPage }) => {
  const titles: Record<Page, string> = {
    generator: 'Генерация изображений',
    history: 'История генераций',
    settings: 'Настройки',
  };

  return (
    <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-background">
      <h1 className="text-xl font-semibold">{titles[currentPage]}</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <div className="w-2 h-2 rounded-full bg-success"></div>
          API подключен
        </div>
      </div>
    </header>
  );
};

const AnimateTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="animate-fade-in">{children}</div>;
};

export default App;
