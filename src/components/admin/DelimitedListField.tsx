import { useState } from 'react';

interface DelimitedListFieldProps {
  items: string[];
  mode: 'newline' | 'comma';
  rows?: number;
  placeholder?: string;
  className?: string;
  onChange: (next: string[]) => void;
}

export function DelimitedListField({
  items,
  mode,
  rows = 3,
  placeholder,
  className = '',
  onChange,
}: DelimitedListFieldProps) {
  const joiner = mode === 'newline' ? '\n' : ', ';
  const splitter = mode === 'newline' ? '\n' : ',';
  const [focusedText, setFocusedText] = useState<string | null>(null);

  const displayValue = focusedText !== null ? focusedText : items.join(joiner);

  const handleTextChange = (raw: string) => {
    setFocusedText(raw);
    const parsed = raw
      .split(splitter)
      .map((s) => s.trim())
      .filter(Boolean);
    onChange(parsed);
  };

  if (mode === 'comma' && rows === 1) {
    return (
      <input
        type="text"
        value={displayValue}
        placeholder={placeholder}
        onFocus={() => setFocusedText(items.join(joiner))}
        onBlur={() => setFocusedText(null)}
        onChange={(e) => handleTextChange(e.target.value)}
        className={className}
        style={{ color: 'var(--text-primary)' }}
      />
    );
  }

  return (
    <textarea
      rows={rows}
      value={displayValue}
      placeholder={placeholder}
      onFocus={() => setFocusedText(items.join(joiner))}
      onBlur={() => setFocusedText(null)}
      onChange={(e) => handleTextChange(e.target.value)}
      className={className}
      style={{ color: 'var(--text-primary)' }}
    />
  );
}
