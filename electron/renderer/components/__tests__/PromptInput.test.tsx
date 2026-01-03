import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PromptInput } from '../PromptInput';

jest.mock('../../store/uiStore');
jest.mock('../../store/store');
jest.mock('../../api', () => ({
  api: {
    generation: {
      textToImage: jest
        .fn()
        .mockResolvedValue({ id: '123', output_url: 'test.jpg', status: 'completed' }),
      imageToImage: jest
        .fn()
        .mockResolvedValue({ id: '456', output_url: 'test2.jpg', status: 'completed' }),
      textToVideo: jest
        .fn()
        .mockResolvedValue({ id: '789', output_url: 'test.mp4', status: 'completed' }),
    },
  },
}));
jest.mock('../../components/ImageUpload', () => ({
  __esModule: true,
  default: ({ value, onChange, onClear }: any) => (
    <div data-testid="image-upload">
      <button onClick={() => onChange(new File(['test'], 'test.jpg', { type: 'image/jpeg' }))}>
        Select Image
      </button>
      {value && <button onClick={onClear}>Clear Image</button>}
    </div>
  ),
}));

const mockSetIsGenerating = jest.fn();
const mockSetProgress = jest.fn();
const mockAddGeneration = jest.fn();
const mockUpdateGeneration = jest.fn();
const mockUpdateSettings = jest.fn();

const { api } = require('../../api');

const { useUiStore } = require('../../store/uiStore');
const { useStore } = require('../../store/store');

describe('PromptInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useUiStore.mockReturnValue({
      activeTab: 'text-to-image',
    });

    useStore.mockReturnValue({
      settings: {
        defaultWidth: 1024,
        defaultHeight: 1024,
        defaultSteps: 20,
        defaultGuidanceScale: 7.5,
      },
      updateSettings: mockUpdateSettings,
      addGeneration: mockAddGeneration,
      updateGeneration: mockUpdateGeneration,
      setIsGenerating: mockSetIsGenerating,
      setProgress: mockSetProgress,
    });
  });

  it('renders prompt input textarea', () => {
    render(<PromptInput />);

    const textarea = screen.getByPlaceholderText(/опишите, что хотите сгенерировать/i);
    expect(textarea).toBeInTheDocument();
  });

  it('renders negative prompt textarea', () => {
    render(<PromptInput />);

    const textarea = screen.getByPlaceholderText(/чего избежать в генерации/i);
    expect(textarea).toBeInTheDocument();
  });

  it('renders size selector', () => {
    render(<PromptInput />);

    expect(screen.getByText('Размер')).toBeInTheDocument();
    expect(screen.getByText('1024 × 1024')).toBeInTheDocument();
  });

  it('renders model selector', () => {
    render(<PromptInput />);

    expect(screen.getByText('Модель')).toBeInTheDocument();
    expect(screen.getByText('Runware v1 (Fast)')).toBeInTheDocument();
  });

  it('shows advanced settings when button is clicked', () => {
    render(<PromptInput />);

    const button = screen.getByText(
      (content) => content.includes('Показать') && content.includes('расширенные настройки')
    );
    fireEvent.click(button);

    expect(screen.getByText(/шаги/i)).toBeInTheDocument();
    expect(screen.getByText(/точность/i)).toBeInTheDocument();
  });

  it('hides advanced settings when button is clicked again', () => {
    render(<PromptInput />);

    const button = screen.getByText(/расширенные настройки/i);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(screen.getByText(/расширенные настройки/i)).toBeInTheDocument();
  });

  it('updates prompt input value', () => {
    render(<PromptInput />);

    const textarea = screen.getByPlaceholderText(/опишите, что хотите сгенерировать/i);
    fireEvent.change(textarea, { target: { value: 'A beautiful sunset' } });

    expect(textarea).toHaveValue('A beautiful sunset');
  });

  it('updates negative prompt input value', () => {
    render(<PromptInput />);

    const textarea = screen.getByPlaceholderText(/чего избежать в генерации/i);
    fireEvent.change(textarea, { target: { value: 'blurry, low quality' } });

    expect(textarea).toHaveValue('blurry, low quality');
  });

  it('updates steps slider', () => {
    render(<PromptInput />);

    const showSettingsButton = screen.getByText(
      (content) => content.includes('Показать') && content.includes('расширенные настройки')
    );
    fireEvent.click(showSettingsButton);

    const sliders = screen.getAllByRole('slider');
    const stepsSlider = sliders[0];
    fireEvent.change(stepsSlider, { target: { value: '30' } });

    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('updates guidance scale slider', () => {
    render(<PromptInput />);

    const showSettingsButton = screen.getByText((content) =>
      content.includes('расширенные настройки')
    );
    fireEvent.click(showSettingsButton);

    const sliders = screen.getAllByRole('slider');
    const guidanceSlider = sliders[1];
    fireEvent.change(guidanceSlider, { target: { value: '10' } });

    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('updates guidance scale slider', () => {
    render(<PromptInput />);

    const showSettingsButton = screen.getByText(/показать настройки/i);
    fireEvent.click(showSettingsButton);

    const slider = screen.getByRole('slider', { name: /guidance scale/i });
    fireEvent.change(slider, { target: { value: '10' } });

    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('disables generate button when prompt is empty', () => {
    render(<PromptInput />);

    const button = screen.getByRole('button', { name: /сгенерировать изображение/i });
    expect(button).toBeDisabled();
  });

  it('enables generate button when prompt is filled', () => {
    render(<PromptInput />);

    const textarea = screen.getByPlaceholderText(/опишите, что хотите сгенерировать/i);
    fireEvent.change(textarea, { target: { value: 'Test prompt' } });

    const button = screen.getByRole('button', { name: /сгенерировать изображение/i });
    expect(button).not.toBeDisabled();
  });

  it('shows image upload when tab is image-to-image', () => {
    useUiStore.mockReturnValue({
      activeTab: 'image-to-image',
    });

    render(<PromptInput />);

    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    expect(screen.getByText(/исходное изображение/i)).toBeInTheDocument();
  });

  it('shows strength slider for image-to-image mode', () => {
    useUiStore.mockReturnValue({
      activeTab: 'image-to-image',
    });

    render(<PromptInput />);

    const showSettingsButton = screen.getByText(
      (content) => content.includes('Показать') && content.includes('расширенные настройки')
    );
    fireEvent.click(showSettingsButton);

    expect(screen.getByText(/Сила изменения/i)).toBeInTheDocument();
    expect(
      screen.getByText(/насколько сильно ai должен изменить исходное изображение/i)
    ).toBeInTheDocument();
  });

  it('disables generate button in image-to-image mode without source image', () => {
    useUiStore.mockReturnValue({
      activeTab: 'image-to-image',
    });

    render(<PromptInput />);

    const textarea = screen.getByPlaceholderText(/опишите, что хотите сгенерировать/i);
    fireEvent.change(textarea, { target: { value: 'Test prompt' } });

    const button = screen.getByRole('button', { name: /преобразовать изображение/i });
    expect(button).toBeDisabled();
  });

  it('calls textToImage API when generate is clicked in text-to-image mode', async () => {
    render(<PromptInput />);

    const textarea = screen.getByPlaceholderText(/опишите, что хотите сгенерировать/i);
    fireEvent.change(textarea, { target: { value: 'Test prompt' } });

    const button = screen.getByRole('button', { name: /сгенерировать изображение/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(api.generation.textToImage).toHaveBeenCalledWith({
        prompt: 'Test prompt',
        negative_prompt: null,
        width: 1024,
        height: 1024,
        steps: 20,
        guidance_scale: 7.5,
      });
    });
  });

  it('calls imageToImage API when generate is clicked in image-to-image mode', async () => {
    useUiStore.mockReturnValue({
      activeTab: 'image-to-image',
    });

    render(<PromptInput />);

    const textarea = screen.getByPlaceholderText(/опишите, что хотите сгенерировать/i);
    fireEvent.change(textarea, { target: { value: 'Test prompt' } });

    const selectImageButton = screen.getByText('Select Image');
    fireEvent.click(selectImageButton);

    const button = screen.getByRole('button', { name: /преобразовать изображение/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(api.generation.imageToImage).toHaveBeenCalled();
    });
  });

  it('calls textToVideo API when generate is clicked in text-to-video mode', async () => {
    useUiStore.mockReturnValue({
      activeTab: 'text-to-video',
    });

    render(<PromptInput />);

    const textarea = screen.getByPlaceholderText(/опишите, что хотите сгенерировать/i);
    fireEvent.change(textarea, { target: { value: 'Test prompt' } });

    const button = screen.getByRole('button', { name: /сгенерировать видео/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(api.generation.textToVideo).toHaveBeenCalledWith({
        prompt: 'Test prompt',
        negative_prompt: null,
        width: 1024,
        height: 1024,
        duration: 3,
        fps: 24,
      });
    });
  });

  it('sets generating state and progress when generate is called', async () => {
    render(<PromptInput />);

    const textarea = screen.getByPlaceholderText(/опишите, что хотите сгенерировать/i);
    fireEvent.change(textarea, { target: { value: 'Test prompt' } });

    const button = screen.getByRole('button', { name: /сгенерировать изображение/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSetIsGenerating).toHaveBeenCalledWith(true);
      expect(mockSetProgress).toHaveBeenCalledWith(0);
    });
  });

  it('shows tip message', () => {
    render(<PromptInput />);

    expect(screen.getByText(/💡/i)).toBeInTheDocument();
    expect(screen.getByText(/совет:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/будьте конкретны в промптах для лучших результатов/i)
    ).toBeInTheDocument();
  });
});
