import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Input } from '../Input';
import { Search } from 'lucide-react';

describe('Input Component', () => {
  it('renders without label', () => {
    render(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Test Label" />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('associates label with input using htmlFor', () => {
    render(<Input label="Test Label" id="test-input" />);

    const label = screen.getByText('Test Label');
    const input = screen.getByRole('textbox');

    expect(label).toHaveAttribute('for', 'test-input');
    expect(input).toHaveAttribute('id', 'test-input');
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text..." />);

    const input = screen.getByPlaceholderText('Enter text...');
    expect(input).toBeInTheDocument();
  });

  it('updates value when changed', () => {
    render(<Input />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    input.value = 'test value';

    expect(input.value).toBe('test value');
  });

  it('renders with left icon', () => {
    render(<Input leftIcon={<Search data-testid="left-icon" />} />);

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    render(<Input rightIcon={<Search data-testid="right-icon" />} />);

    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<Input error="This field is required" />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('renders with help text', () => {
    render(<Input helpText="This is a help text" />);

    expect(screen.getByText('This is a help text')).toBeInTheDocument();
  });

  it('shows error instead of help text when both are present', () => {
    render(<Input error="Error message" helpText="Help text" />);

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<Input className="custom-class" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('renders disabled state', () => {
    render(<Input disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('renders with custom id', () => {
    render(<Input id="custom-id" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('generates random id if not provided', () => {
    const { container } = render(<Input label="Test Label" />);

    const label = screen.getByText('Test Label');
    const input = screen.getByRole('textbox');

    const labelId = label.getAttribute('for');
    const inputId = input.getAttribute('id');

    expect(labelId).not.toBeFalsy();
    expect(inputId).not.toBeFalsy();
    expect(labelId).toBe(inputId);
  });

  it('passes through additional props to input', () => {
    render(<Input type="email" name="email" autoComplete="email" />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.type).toBe('email');
    expect(input.name).toBe('email');
    expect(input.getAttribute('autocomplete')).toBe('email');
  });
});
