import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Select } from '../Select';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('Select Component', () => {
  it('renders without label', () => {
    render(<Select options={mockOptions} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Select options={mockOptions} label="Test Label" />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('associates label with select using htmlFor', () => {
    render(<Select options={mockOptions} label="Test Label" id="test-select" />);

    const label = screen.getByText('Test Label');
    const select = screen.getByRole('combobox');

    expect(label).toHaveAttribute('for', 'test-select');
    expect(select).toHaveAttribute('id', 'test-select');
  });

  it('renders all options', () => {
    render(<Select options={mockOptions} />);

    mockOptions.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('has correct values for options', () => {
    render(<Select options={mockOptions} />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    const options = Array.from(select.options);

    expect(options[0].value).toBe('option1');
    expect(options[0].textContent).toBe('Option 1');

    expect(options[1].value).toBe('option2');
    expect(options[1].textContent).toBe('Option 2');

    expect(options[2].value).toBe('option3');
    expect(options[2].textContent).toBe('Option 3');
  });

  it('selects correct option by default value', () => {
    render(<Select options={mockOptions} defaultValue="option2" />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('option2');
  });

  it('calls onChange when selection changes', () => {
    const handleChange = jest.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'option2' }),
      })
    );
  });

  it('renders with error message', () => {
    render(<Select options={mockOptions} error="This field is required" />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-red-500');
  });

  it('renders with help text', () => {
    render(<Select options={mockOptions} helpText="This is a help text" />);

    expect(screen.getByText('This is a help text')).toBeInTheDocument();
  });

  it('shows error instead of help text when both are present', () => {
    render(<Select options={mockOptions} error="Error message" helpText="Help text" />);

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<Select options={mockOptions} className="custom-class" />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-class');
  });

  it('renders disabled state', () => {
    render(<Select options={mockOptions} disabled />);

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
    expect(select).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('renders with custom id', () => {
    render(<Select options={mockOptions} id="custom-id" />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('id', 'custom-id');
  });

  it('generates random id if not provided', () => {
    const { container } = render(<Select options={mockOptions} label="Test Label" />);

    const label = screen.getByText('Test Label');
    const select = screen.getByRole('combobox');

    const labelId = label.getAttribute('for');
    const selectId = select.getAttribute('id');

    expect(labelId).not.toBeFalsy();
    expect(selectId).not.toBeFalsy();
    expect(labelId).toBe(selectId);
  });

  it('passes through additional props to select', () => {
    render(<Select options={mockOptions} name="test-name" required />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.name).toBe('test-name');
    expect(select.required).toBe(true);
  });

  it('renders empty options array', () => {
    render(<Select options={[]} />);

    const select = screen.getByRole('combobox');
    const options = Array.from((select as HTMLSelectElement).options);

    expect(options.length).toBe(0);
  });
});
