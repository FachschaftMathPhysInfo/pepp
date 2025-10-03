import React, { useState, useEffect, ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';

/**
 * NumericInput
 * A reusable controlled React + TypeScript input that only accepts numbers.
 * - Works well in Next.js (just drop into /components and import)
 * - Uses inputMode & pattern for mobile keyboards
 * - Prevents invalid keypresses and paste
 * - Keeps internal string state so partial values (like "-" or ".") are handled gracefully
 *
 * Props:
 *  - value: number | null | undefined  (controlled numeric value)
 *  - onChange: (num: number | null) => void  (called with parsed number or null)
 *  - allowDecimal: boolean  (default: false)
 *  - allowNegative: boolean (default: false)
 *  - placeholder, className, aria-label ... passed to the underlying input
 *
 * Usage example:
 * <NumericInput value={price} onChange={n => setPrice(n)} allowDecimal allowNegative />
 */

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  value?: number | null;
  onChange?: (value: number | null) => void;
  allowDecimal?: boolean;
  allowNegative?: boolean;
};

export default function NumericInput({
  value,
  onChange,
  allowDecimal = false,
  allowNegative = false,
  className = '',
  ...rest
}: Props) {
  // Keep a string state so the user can type partial values like "-" or "0." before we convert to number
  const [internal, setInternal] = useState<string>(() => {
    if (value === null || value === undefined) return '';
    return String(value);
  });

  // Keep the internal string synced when value prop changes from parent
  useEffect(() => {
    if (value === null || value === undefined) {
      setInternal('');
    } else if (String(value) !== internal) {
      setInternal(String(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Build a regex to validate allowed input characters
  const makeAllowedRegex = () => {
    const sign = allowNegative ? '-?' : '';
    if (allowDecimal) {
      // allow digits, optional leading -, and at most one dot
      return new RegExp(`^${sign}(?:\\d+|\\d*\\.?\\d*)?$`);
    }
    // integers only
    return new RegExp(`^${sign}\\d*$`);
  };

  const allowedRe = makeAllowedRegex();

  const stringToNumber = (s: string): number | null => {
    if (s === '' || s === '-' || s === '.' || s === '-.') return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const s = e.target.value;
    if (s === '') {
      setInternal('');
      onChange?.(null);
      return;
    }

    // Allow if matches our allowed pattern; otherwise ignore the change
    if (!allowedRe.test(s)) return;

    setInternal(s);
    onChange?.(stringToNumber(s));
  };

  // Prevent invalid keys (keeps UX snappy)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'Tab',
    ];
    if (allowedKeys.includes(e.key)) return;

    // allow ctrl/cmd+A/C/V/X and modifier combos
    if (e.ctrlKey || e.metaKey) return;

    // digits
    if (/^[0-9]$/.test(e.key)) return;

    // decimal point
    if (allowDecimal && e.key === '.') {
      // disallow if there's already a dot
      if ((e.currentTarget.value ?? '').includes('.')) e.preventDefault();
      return;
    }

    // minus sign
    if (allowNegative && e.key === '-') {
      // only allow minus at start and if it's not already present
      const { selectionStart } = e.currentTarget;
      if (selectionStart !== 0 || (e.currentTarget.value ?? '').includes('-')) e.preventDefault();
      return;
    }

    // anything else
    e.preventDefault();
  };

  // Prevent pasting invalid text
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const candidate = (e.currentTarget.value.slice(0, e.currentTarget.selectionStart ?? 0) + text + e.currentTarget.value.slice(e.currentTarget.selectionEnd ?? 0));
    if (!allowedRe.test(candidate)) e.preventDefault();
  };

  return (
    <input
      {...rest}
      value={internal}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      inputMode={allowDecimal ? 'decimal' : 'numeric'}
      pattern={allowDecimal ? "^\\-?\\d*\\.?\\d*$" : allowNegative ? "^\\-?\\d*$" : "^\\d*$"}
      aria-label={rest['aria-label'] ?? 'numeric input'}
      className={className}
    />
  );
}
