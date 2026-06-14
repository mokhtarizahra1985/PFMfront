import { useEffect, useState } from 'react';
import { isoToJalaliInput, jalaliInputToIso } from '@/utils/date';

interface JalaliDateInputProps {
  id?: string;
  value: string;
  onChange: (isoDate: string) => void;
  className?: string;
  placeholder?: string;
}

export function JalaliDateInput({
  id,
  value,
  onChange,
  className = 'field-input',
  placeholder = '۱۴۰۵/۰۳/۲۵',
}: JalaliDateInputProps) {
  const [text, setText] = useState(() => isoToJalaliInput(value));

  useEffect(() => {
    setText(isoToJalaliInput(value));
  }, [value]);

  const commit = () => {
    if (!text.trim()) {
      onChange('');
      return;
    }

    const iso = jalaliInputToIso(text);
    if (iso) {
      onChange(iso);
      setText(isoToJalaliInput(iso));
      return;
    }

    setText(isoToJalaliInput(value));
  };

  return (
    <input
      id={id}
      type="text"
      dir="ltr"
      inputMode="numeric"
      autoComplete="off"
      className={className}
      placeholder={placeholder}
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commit();
        }
      }}
    />
  );
}
