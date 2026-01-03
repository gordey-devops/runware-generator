import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Notifications } from '../Notifications';

jest.mock('../../store/uiStore', () => ({
  useUiStore: jest.fn(),
}));

const { useUiStore } = require('../../store/uiStore');

describe('Notifications Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when no notifications', () => {
    useUiStore.mockReturnValue({
      notifications: [],
      removeNotification: jest.fn(),
    });

    const { container } = render(<Notifications />);

    expect(container.firstChild).toBeNull();
  });

  it('renders single notification', () => {
    const mockNotifications = [{ id: 1, type: 'success' as const, message: 'Success message' }];

    useUiStore.mockReturnValue({
      notifications: mockNotifications,
      removeNotification: jest.fn(),
    });

    render(<Notifications />);

    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('renders multiple notifications', () => {
    const mockNotifications = [
      { id: 1, type: 'success' as const, message: 'Success message' },
      { id: 2, type: 'error' as const, message: 'Error message' },
      { id: 3, type: 'info' as const, message: 'Info message' },
    ];

    useUiStore.mockReturnValue({
      notifications: mockNotifications,
      removeNotification: jest.fn(),
    });

    render(<Notifications />);

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('calls removeNotification when close button clicked', () => {
    const mockNotifications = [{ id: 1, type: 'success' as const, message: 'Success message' }];
    const mockRemove = jest.fn();

    useUiStore.mockReturnValue({
      notifications: mockNotifications,
      removeNotification: mockRemove,
    });

    render(<Notifications />);

    const closeButton = screen.getAllByRole('button')[0];
    fireEvent.click(closeButton);

    expect(mockRemove).toHaveBeenCalledWith(1);
  });

  it('renders success notification with correct styles', () => {
    const mockNotifications = [{ id: 1, type: 'success' as const, message: 'Success message' }];

    useUiStore.mockReturnValue({
      notifications: mockNotifications,
      removeNotification: jest.fn(),
    });

    render(<Notifications />);

    const notificationWrapper = screen.getByText('Success message').closest('div');
    expect(notificationWrapper).toHaveClass('bg-success/10', 'border-success/20', 'text-success');
  });

  it('renders error notification with correct styles', () => {
    const mockNotifications = [{ id: 1, type: 'error' as const, message: 'Error message' }];

    useUiStore.mockReturnValue({
      notifications: mockNotifications,
      removeNotification: jest.fn(),
    });

    render(<Notifications />);

    const notificationWrapper = screen.getByText('Error message').closest('div');
    expect(notificationWrapper).toHaveClass('bg-error/10', 'border-error/20', 'text-error');
  });

  it('renders info notification with correct styles', () => {
    const mockNotifications = [{ id: 1, type: 'info' as const, message: 'Info message' }];

    useUiStore.mockReturnValue({
      notifications: mockNotifications,
      removeNotification: jest.fn(),
    });

    render(<Notifications />);

    const notificationWrapper = screen.getByText('Info message').closest('div');
    expect(notificationWrapper).toHaveClass('bg-primary/10', 'border-primary/20', 'text-primary');
  });

  it('renders warning notification with correct styles', () => {
    const mockNotifications = [{ id: 1, type: 'warning' as const, message: 'Warning message' }];

    useUiStore.mockReturnValue({
      notifications: mockNotifications,
      removeNotification: jest.fn(),
    });

    render(<Notifications />);

    const notificationWrapper = screen.getByText('Warning message').closest('div');
    expect(notificationWrapper).toHaveClass(
      'bg-yellow-500/10',
      'border-yellow-500/20',
      'text-yellow-500'
    );
  });

  it('renders notifications in correct order', () => {
    const mockNotifications = [
      { id: 1, type: 'success' as const, message: 'First' },
      { id: 2, type: 'info' as const, message: 'Second' },
      { id: 3, type: 'error' as const, message: 'Third' },
    ];

    useUiStore.mockReturnValue({
      notifications: mockNotifications,
      removeNotification: jest.fn(),
    });

    render(<Notifications />);

    const notificationElements = screen.getAllByText(/First|Second|Third/);
    expect(notificationElements).toHaveLength(3);

    const firstElement = notificationElements[0].textContent;
    const thirdElement = notificationElements[2].textContent;

    expect(firstElement).toContain('First');
    expect(thirdElement).toContain('Third');
  });

  it('renders close button for each notification', () => {
    const mockNotifications = [
      { id: 1, type: 'success' as const, message: 'Success message' },
      { id: 2, type: 'error' as const, message: 'Error message' },
    ];

    useUiStore.mockReturnValue({
      notifications: mockNotifications,
      removeNotification: jest.fn(),
    });

    render(<Notifications />);

    const closeButtons = screen.getAllByRole('button');
    expect(closeButtons).toHaveLength(2);
  });

  it('removes correct notification when its close button clicked', () => {
    const mockNotifications = [
      { id: 1, type: 'success' as const, message: 'First' },
      { id: 2, type: 'error' as const, message: 'Second' },
    ];
    const mockRemove = jest.fn();

    useUiStore.mockReturnValue({
      notifications: mockNotifications,
      removeNotification: mockRemove,
    });

    render(<Notifications />);

    const closeButtons = screen.getAllByRole('button');
    fireEvent.click(closeButtons[1]);

    expect(mockRemove).toHaveBeenCalledWith(2);
  });

  it('renders notification with correct message text', () => {
    const mockNotifications = [
      {
        id: 1,
        type: 'info' as const,
        message: 'This is a very long notification message for testing',
      },
    ];

    useUiStore.mockReturnValue({
      notifications: mockNotifications,
      removeNotification: jest.fn(),
    });

    render(<Notifications />);

    expect(
      screen.getByText('This is a very long notification message for testing')
    ).toBeInTheDocument();
  });

  it('applies animation class', () => {
    const mockNotifications = [{ id: 1, type: 'success' as const, message: 'Success message' }];

    useUiStore.mockReturnValue({
      notifications: mockNotifications,
      removeNotification: jest.fn(),
    });

    render(<Notifications />);

    const notificationWrapper = screen.getByText('Success message').closest('div');
    expect(notificationWrapper).toHaveClass('animate-slide-in');
  });
});
