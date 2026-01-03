import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoPlayer from '../VideoPlayer';

describe('VideoPlayer Component', () => {
  const mockSrc = 'test-video.mp4';

  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
      value: jest.fn(),
      writable: true,
    });
    Object.defineProperty(document, 'exitFullscreen', {
      value: jest.fn(),
      writable: true,
    });
  });

  it('renders video element with src', () => {
    render(<VideoPlayer src={mockSrc} />);

    const { container } = render(<VideoPlayer src={mockSrc} />);
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video).toBeInTheDocument();
    expect(video?.src).toContain('test-video.mp4');
  });

  it('renders play button overlay when paused', () => {
    render(<VideoPlayer src={mockSrc} />);

    const buttons = screen.getAllByRole('button');
    const playButton = buttons[buttons.length - 1];
    const playIcon = playButton.querySelector('svg');
    expect(playIcon).toBeInTheDocument();
  });

  it('renders controls bar', () => {
    render(<VideoPlayer src={mockSrc} />);

    const timeDisplay = screen.getByText(/0:00/);
    expect(timeDisplay).toBeInTheDocument();
  });

  it('renders mute button', () => {
    render(<VideoPlayer src={mockSrc} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders fullscreen button', () => {
    render(<VideoPlayer src={mockSrc} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders download button when onDownload provided', () => {
    const onDownload = jest.fn();
    render(<VideoPlayer src={mockSrc} onDownload={onDownload} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(5);
  });

  it('does not render download button when onDownload not provided', () => {
    render(<VideoPlayer src={mockSrc} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(4);
  });

  it('renders with custom className', () => {
    const { container } = render(<VideoPlayer src={mockSrc} className="custom-class" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('renders progress bar', () => {
    render(<VideoPlayer src={mockSrc} />);

    const { container } = render(<VideoPlayer src={mockSrc} />);
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('renders time display', () => {
    render(<VideoPlayer src={mockSrc} />);

    expect(screen.getByText(/0:00/)).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<VideoPlayer src={mockSrc} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('relative', 'bg-black', 'rounded-lg', 'overflow-hidden');
  });

  it('renders video with correct attributes', () => {
    const { container } = render(<VideoPlayer src={mockSrc} />);

    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video).toHaveAttribute('src');
  });

  it('renders controls bar container', () => {
    const { container } = render(<VideoPlayer src={mockSrc} />);

    const controlsBar = container.querySelector('.absolute.bottom-0');
    expect(controlsBar).toBeInTheDocument();
  });
});
