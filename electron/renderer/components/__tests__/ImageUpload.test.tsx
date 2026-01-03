import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageUpload from '../ImageUpload';

describe('ImageUpload Component', () => {
  const mockOnChange = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnClear.mockClear();
  });

  it('renders upload area when no value is provided', () => {
    render(<ImageUpload value={undefined} onChange={mockOnChange} onClear={mockOnClear} />);

    expect(screen.getByText(/drag and drop an image here/i)).toBeInTheDocument();
    expect(screen.getByText(/max file size: 10mb/i)).toBeInTheDocument();
  });

  it('renders preview when value is a File object', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    render(<ImageUpload value={file} onChange={mockOnChange} onClear={mockOnClear} />);

    const image = screen.getByAltText('Preview');
    expect(image).toBeInTheDocument();
    expect(image).toHaveClass('object-cover');
  });

  it('renders preview when value is a URL string', () => {
    render(
      <ImageUpload
        value="https://example.com/image.jpg"
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    );

    const image = screen.getByAltText('Preview');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('shows file name in preview mode', () => {
    const file = new File(['test'], 'my-image.png', { type: 'image/png' });
    render(<ImageUpload value={file} onChange={mockOnChange} onClear={mockOnClear} />);

    expect(screen.getByText('my-image.png')).toBeInTheDocument();
  });

  it('shows file name from URL', () => {
    render(
      <ImageUpload
        value="https://example.com/folder/image.jpg"
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText('image.jpg')).toBeInTheDocument();
  });

  it('shows change and clear buttons on hover in preview mode', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    render(<ImageUpload value={file} onChange={mockOnChange} onClear={mockOnClear} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(screen.getByText('Change')).toBeInTheDocument();
  });

  it('calls onChange when a valid file is dropped', () => {
    render(<ImageUpload value={undefined} onChange={mockOnChange} onClear={mockOnClear} />);

    const dropZone = screen.getByText(/drag and drop an image here/i).parentElement!;

    const file = new File(['test'], 'dropped.jpg', { type: 'image/jpeg' });

    const dataTransfer = {
      files: [file],
    };

    fireEvent.drop(dropZone, {
      preventDefault: jest.fn(),
      dataTransfer,
    });

    expect(mockOnChange).toHaveBeenCalledWith(file);
  });

  it('calls onChange when a valid file is selected via input', () => {
    render(<ImageUpload value={undefined} onChange={mockOnChange} onClear={mockOnClear} />);

    const dropZone = screen.getByText(/drag and drop an image here/i).parentElement!;
    fireEvent.click(dropZone);

    const inputs = screen.queryAllByRole('textbox');
    const input = inputs.find((el) => el.getAttribute('type') === 'file') as HTMLInputElement;
    const file = new File(['test'], 'selected.jpg', { type: 'image/jpeg' });

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      expect(mockOnChange).toHaveBeenCalledWith(file);
    }
  });

  it('shows error for oversized file', () => {
    render(<ImageUpload value={undefined} onChange={mockOnChange} onClear={mockOnClear} />);

    const dropZone = screen.getByText(/drag and drop an image here/i).parentElement!;

    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    const dropEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        files: [largeFile],
      },
    } as any;

    fireEvent.drop(dropZone, dropEvent);

    expect(screen.getByText(/file size exceeds 10mb limit/i)).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('shows error for non-image file', () => {
    render(<ImageUpload value={undefined} onChange={mockOnChange} onClear={mockOnClear} />);

    const dropZone = screen.getByText(/drag and drop an image here/i).parentElement!;

    const textFile = new File(['text'], 'document.txt', { type: 'text/plain' });

    const dropEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        files: [textFile],
      },
    } as any;

    fireEvent.drop(dropZone, dropEvent);

    expect(screen.getByText(/please select an image file/i)).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('calls onClear when clear button is clicked', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    render(<ImageUpload value={file} onChange={mockOnChange} onClear={mockOnClear} />);

    const buttons = screen.getAllByRole('button');
    const clearButton = buttons[1]; // Second button is the clear button
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
  });

  it('changes drag state on drag over and leave', () => {
    render(<ImageUpload value={undefined} onChange={mockOnChange} onClear={mockOnClear} />);

    const dropZone = screen.getByText(/drag and drop an image here/i).parentElement!;

    fireEvent.dragOver(dropZone, { preventDefault: jest.fn() });
    expect(dropZone).toHaveClass('border-blue-500', 'bg-blue-500/10');

    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass('border-blue-500', 'bg-blue-500/10');
  });

  it('uses custom maxSizeMB prop', () => {
    render(
      <ImageUpload value={undefined} onChange={mockOnChange} onClear={mockOnClear} maxSizeMB={5} />
    );

    expect(screen.getByText(/max file size: 5mb/i)).toBeInTheDocument();

    const dropZone = screen.getByText(/drag and drop an image here/i).parentElement!;

    const file = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    const dropEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        files: [file],
      },
    } as any;

    fireEvent.drop(dropZone, dropEvent);

    expect(screen.getByText(/file size exceeds 5mb limit/i)).toBeInTheDocument();
  });

  it('clears error when a valid file is selected', () => {
    render(<ImageUpload value={undefined} onChange={mockOnChange} onClear={mockOnClear} />);

    const dropZone = screen.getByText(/drag and drop an image here/i).parentElement!;

    const textFile = new File(['text'], 'document.txt', { type: 'text/plain' });
    const dropEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        files: [textFile],
      },
    } as any;

    fireEvent.drop(dropZone, dropEvent);
    expect(screen.getByText(/please select an image file/i)).toBeInTheDocument();

    const imageFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
    const imageDropEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        files: [imageFile],
      },
    } as any;

    fireEvent.drop(dropZone, imageDropEvent);

    expect(screen.queryByText(/please select an image file/i)).not.toBeInTheDocument();
  });
});
