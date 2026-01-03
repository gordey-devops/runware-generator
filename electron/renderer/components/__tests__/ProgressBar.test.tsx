import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgressBar } from '../ProgressBar';

jest.mock('../../store/store', () => ({
  useStore: jest.fn(),
}));

const { useStore } = require('../../store/store');

describe('ProgressBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not generating', () => {
    useStore.mockReturnValue({
      isGenerating: false,
      progress: 0,
    });

    const { container } = render(<ProgressBar />);

    expect(container.firstChild).toBeNull();
  });

  it('renders progress bar when generating', () => {
    useStore.mockReturnValue({
      isGenerating: true,
      progress: 50,
    });

    render(<ProgressBar />);

    expect(screen.getByText('Генерация...')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders progress bar with 0%', () => {
    useStore.mockReturnValue({
      isGenerating: true,
      progress: 0,
    });

    render(<ProgressBar />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders progress bar with 100%', () => {
    useStore.mockReturnValue({
      isGenerating: true,
      progress: 100,
    });

    render(<ProgressBar />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders progress text', () => {
    useStore.mockReturnValue({
      isGenerating: true,
      progress: 75,
    });

    render(<ProgressBar />);

    expect(screen.getByText('Обработка запроса...')).toBeInTheDocument();
  });

  it('rounds progress percentage', () => {
    useStore.mockReturnValue({
      isGenerating: true,
      progress: 75.7,
    });

    render(<ProgressBar />);

    expect(screen.getByText('76%')).toBeInTheDocument();
  });

  it('renders loading spinner', () => {
    useStore.mockReturnValue({
      isGenerating: true,
      progress: 50,
    });

    const { container } = render(<ProgressBar />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders progress bar with correct width', () => {
    useStore.mockReturnValue({
      isGenerating: true,
      progress: 50,
    });

    const { container } = render(<ProgressBar />);

    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('renders progress bar with 25% width', () => {
    useStore.mockReturnValue({
      isGenerating: true,
      progress: 25,
    });

    const { container } = render(<ProgressBar />);

    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toHaveStyle({ width: '25%' });
  });

  it('renders progress bar with 100% width', () => {
    useStore.mockReturnValue({
      isGenerating: true,
      progress: 100,
    });

    const { container } = render(<ProgressBar />);

    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  it('renders with correct classes', () => {
    useStore.mockReturnValue({
      isGenerating: true,
      progress: 50,
    });

    const { container } = render(<ProgressBar />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('bg-gradient-to-br', 'from-primary/10', 'to-accent/10');
  });
});
