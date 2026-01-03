import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Textarea } from '../Textarea';

describe('Textarea Component', () => {
  it('renders without label', () => {
    render(<Textarea />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Textarea label="Test Label" />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  it('associates label with textarea using htmlFor', () => {
    render(<Textarea label="Test Label" id="test-textarea" />);

    const label = screen.getByText('Test Label');
    const textarea = screen.getByRole('textbox');

    expect(label).toHaveAttribute('for', 'test-textarea');
    expect(textarea).toHaveAttribute('id', 'test-textarea');
  });

  it('renders with placeholder', () => {
    render(<Textarea placeholder="Enter text..." />);

    const textarea = screen.getByPlaceholderText('Enter text...');
    expect(textarea).toBeInTheDocument();
  });

  it('updates value when changed', () => {
    render(<Textarea />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'test value' } });

    expect(textarea.value).toBe('test value');
  });

  it('renders with error message', () => {
    render(<Textarea error="This field is required" />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('border-red-500');
  });

  it('renders with help text', () => {
    render(<Textarea helpText="This is a help text" />);

    expect(screen.getByText('This is a help text')).toBeInTheDocument();
  });

  it('shows error instead of help text when both are present', () => {
    render(<Textarea error="Error message" helpText="Help text" />);

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<Textarea className="custom-class" />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-class');
  });

  it('renders disabled state', () => {
    render(<Textarea disabled />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('renders with custom id', () => {
    render(<Textarea id="custom-id" />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('id', 'custom-id');
  });

  it('generates random id if not provided', () => {
    const { container } = render(<Textarea label="Test Label" />);

    const label = screen.getByText('Test Label');
    const textarea = screen.getByRole('textbox');

    const labelId = label.getAttribute('for');
    const textareaId = textarea.getAttribute('id');

    expect(labelId).not.toBeFalsy();
    expect(textareaId).not.toBeFalsy();
    expect(labelId).toBe(textareaId);
  });

  it('passes through additional props to textarea', () => {
    render(<Textarea name="description" rows={5} cols={50} />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.name).toBe('description');
    expect(textarea.rows).toBe(5);
    expect(textarea.cols).toBe(50);
  });

  it('renders with default value', () => {
    render(<Textarea defaultValue="default value" />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('default value');
  });

  it('has resize-none class applied', () => {
    render(<Textarea />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('resize-none');
  });

  it('calls onChange when text changes', () => {
    const handleChange = jest.fn();
    render(<Textarea onChange={handleChange} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'new value' }),
      })
    );
  });

  it('renders with maxLength', () => {
    render(<Textarea maxLength={100} />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.maxLength).toBe(100);
  });

  it('renders with required attribute', () => {
    render(<Textarea required />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.required).toBe(true);
  });

  it('renders with readOnly attribute', () => {
    render(<Textarea readOnly />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.readOnly).toBe(true);
  });
});
