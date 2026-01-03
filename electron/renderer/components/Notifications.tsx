import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useUiStore } from '../store/uiStore';

export const Notifications: React.FC = () => {
  const { notifications, removeNotification } = useUiStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => {
        const Icon = {
          success: CheckCircle,
          error: AlertCircle,
          info: Info,
          warning: AlertTriangle,
        }[notification.type];

        const colors = {
          success: 'bg-success/10 border-success/20 text-success',
          error: 'bg-error/10 border-error/20 text-error',
          info: 'bg-primary/10 border-primary/20 text-primary',
          warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
        }[notification.type];

        return (
          <div
            key={notification.id}
            className={`flex items-start gap-3 p-4 rounded-card border backdrop-blur-sm shadow-card animate-slide-in ${colors}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
