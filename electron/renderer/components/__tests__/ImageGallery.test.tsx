import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImageGallery } from '../ImageGallery';

jest.mock('../../store/store', () => ({
  useStore: jest.fn(),
}));

const { useStore } = require('../../store/store');

describe('ImageGallery Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no history', () => {
    useStore.mockReturnValue({
      history: [],
      deleteGeneration: jest.fn(),
    });

    render(<ImageGallery />);

    expect(screen.getByText('Нет генераций')).toBeInTheDocument();
    expect(
      screen.getByText('Создайте первую генерацию, чтобы увидеть результаты здесь')
    ).toBeInTheDocument();
  });

  it('renders images from history', () => {
    const mockHistory = [
      { id: 1, prompt: 'Test prompt 1', outputUrl: 'test1.jpg', width: 512, height: 512 },
      { id: 2, prompt: 'Test prompt 2', outputUrl: 'test2.jpg', width: 768, height: 768 },
    ];

    useStore.mockReturnValue({
      history: mockHistory,
      deleteGeneration: jest.fn(),
    });

    render(<ImageGallery />);

    const images = screen.getAllByAltText(/Test prompt/);
    expect(images.length).toBe(2);
  });

  it('renders image card with correct prompt', () => {
    const mockHistory = [
      { id: 1, prompt: 'Beautiful sunset', outputUrl: 'sunset.jpg', width: 1024, height: 1024 },
    ];

    useStore.mockReturnValue({
      history: mockHistory,
      deleteGeneration: jest.fn(),
    });

    render(<ImageGallery />);

    expect(screen.getByText('Beautiful sunset')).toBeInTheDocument();
  });

  it('renders image dimensions', () => {
    const mockHistory = [{ id: 1, prompt: 'Test', outputUrl: 'test.jpg', width: 512, height: 768 }];

    useStore.mockReturnValue({
      history: mockHistory,
      deleteGeneration: jest.fn(),
    });

    render(<ImageGallery />);

    expect(screen.getByText('512 × 768')).toBeInTheDocument();
  });

  it('opens modal when image clicked', () => {
    const mockHistory = [{ id: 1, prompt: 'Test', outputUrl: 'test.jpg', width: 512, height: 512 }];

    useStore.mockReturnValue({
      history: mockHistory,
      deleteGeneration: jest.fn(),
    });

    render(<ImageGallery />);

    const imageCard = screen.getByAltText('Test').closest('.group');
    fireEvent.click(imageCard!);

    expect(screen.getByText('Детали генерации')).toBeInTheDocument();
  });

  it('calls deleteGeneration when delete button clicked', () => {
    const mockHistory = [{ id: 1, prompt: 'Test', outputUrl: 'test.jpg', width: 512, height: 512 }];
    const mockDelete = jest.fn();

    useStore.mockReturnValue({
      history: mockHistory,
      deleteGeneration: mockDelete,
    });

    render(<ImageGallery />);

    const deleteButtons = screen.getAllByRole('button');
    const trashIcon = deleteButtons[deleteButtons.length - 1].querySelector('svg');
    const deleteButton = trashIcon?.closest('button');
    fireEvent.click(deleteButton!);

    expect(mockDelete).toHaveBeenCalledWith(1);
  });

  it('shows download button on hover', () => {
    const mockHistory = [{ id: 1, prompt: 'Test', outputUrl: 'test.jpg', width: 512, height: 512 }];

    useStore.mockReturnValue({
      history: mockHistory,
      deleteGeneration: jest.fn(),
    });

    render(<ImageGallery />);

    const downloadButtons = screen.getAllByRole('button');
    expect(downloadButtons.length).toBeGreaterThan(0);
  });

  it('renders modal with correct details', () => {
    const mockHistory = [
      {
        id: 1,
        prompt: 'Beautiful landscape',
        outputUrl: 'landscape.jpg',
        width: 1024,
        height: 1024,
        steps: 20,
        guidanceScale: 7.5,
        createdAt: new Date('2024-01-01').toISOString(),
      },
    ];

    useStore.mockReturnValue({
      history: mockHistory,
      deleteGeneration: jest.fn(),
    });

    render(<ImageGallery />);

    const imageCard = screen.getByAltText('Beautiful landscape').closest('.group');
    fireEvent.click(imageCard!);

    expect(screen.getByText('Детали генерации')).toBeInTheDocument();
    expect(screen.getAllByText('1024 × 1024').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('7.5')).toBeInTheDocument();
  });

  it('renders "Нет превью" when no outputUrl', () => {
    const mockHistory = [{ id: 1, prompt: 'Test', outputUrl: null, width: 512, height: 512 }];

    useStore.mockReturnValue({
      history: mockHistory,
      deleteGeneration: jest.fn(),
    });

    render(<ImageGallery />);

    const noPreviewTexts = screen.getAllByText('Нет превью');
    expect(noPreviewTexts.length).toBeGreaterThan(0);
  });

  it('renders image in modal when clicked', () => {
    const mockHistory = [{ id: 1, prompt: 'Test', outputUrl: 'test.jpg', width: 512, height: 512 }];

    useStore.mockReturnValue({
      history: mockHistory,
      deleteGeneration: jest.fn(),
    });

    render(<ImageGallery />);

    const imageCard = screen.getByAltText('Test').closest('.group');
    fireEvent.click(imageCard!);

    const modalImages = screen.getAllByAltText('Test');
    expect(modalImages.length).toBeGreaterThan(1);
  });

  it('renders grid layout', () => {
    const mockHistory = [
      { id: 1, prompt: 'Test 1', outputUrl: 'test1.jpg', width: 512, height: 512 },
      { id: 2, prompt: 'Test 2', outputUrl: 'test2.jpg', width: 512, height: 512 },
    ];

    useStore.mockReturnValue({
      history: mockHistory,
      deleteGeneration: jest.fn(),
    });

    const { container } = render(<ImageGallery />);

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-2', 'gap-4');
  });

  it('renders multiple images correctly', () => {
    const mockHistory = [
      { id: 1, prompt: 'Test 1', outputUrl: 'test1.jpg', width: 512, height: 512 },
      { id: 2, prompt: 'Test 2', outputUrl: 'test2.jpg', width: 512, height: 512 },
      { id: 3, prompt: 'Test 3', outputUrl: 'test3.jpg', width: 512, height: 512 },
    ];

    useStore.mockReturnValue({
      history: mockHistory,
      deleteGeneration: jest.fn(),
    });

    render(<ImageGallery />);

    const images = screen.getAllByRole('img');
    expect(images.length).toBe(3);
  });
});
