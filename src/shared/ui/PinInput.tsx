import { useCallback, useRef, useState, type FC } from 'react';

type Props = {
  onComplete?: (pin: string) => void;
  onChange?: (pin: string) => void;
  className?: string;
  error?: boolean;
};

export const PinInput: FC<Props> = ({
  onComplete = () => {},
  onChange,
  className = '',
  error = false,
}) => {
  const [values, setValues] = useState<string[]>(Array(4).fill(''));
  const inputsRef = useRef<HTMLInputElement[]>([]);

  const setInputRef = useCallback(
    (el: HTMLInputElement | null, index: number) => {
      if (el) {
        inputsRef.current[index] = el;
      }
    },
    []
  );

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newValues = [...values];
      newValues[index] = value;
      setValues(newValues);

      const combined = newValues.join('');
      onChange?.(combined);

      if (value && index < 3) {
        inputsRef.current[index + 1]?.focus();
      }

      if (newValues.every((v) => v !== '')) {
        onComplete(combined);
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.slice(0, 4).split('');
      const newValues = [...values];
      digits.forEach((digit, idx) => {
        newValues[idx] = digit;
      });
      setValues(newValues);

      const combined = newValues.join('');
      onChange?.(combined);

      const nextFocus = Math.min(digits.length, 3);
      inputsRef.current[nextFocus]?.focus();

      if (newValues.every((v) => v !== '')) {
        onComplete(combined);
      }
    }
  };

  return (
    <div className={`relative flex justify-between w-full ${className}`}>
      {values.map((value, i) => (
        <input
          key={i}
          ref={(el) => setInputRef(el, i)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={({ target }) => handleChange(target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className={`w-18 h-9 text-center text-xl rounded-xl border transition-colors focus:outline-none ${
            error
              ? 'border-error bg-red-50 text-error focus:border-error'
              : 'border-gray-300 bg-gray-100 focus:border-blue-500 focus:bg-white text-text-black'
          }`}
          aria-invalid={error}
        />
      ))}
    </div>
  );
};
