
'use client';

import React, { useState, useRef, createRef, ChangeEvent, KeyboardEvent, ClipboardEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PinInputProps {
  length: number;
  onComplete: (pin: string) => void;
  className?: string;
  disabled?: boolean;
}

export function PinInput({ length, onComplete, className, disabled = false }: PinInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<React.RefObject<HTMLInputElement>[]>(
    Array(length).fill(null).map(() => createRef<HTMLInputElement>())
  );

  useEffect(() => {
    // This effect now simply calls onComplete whenever values change.
    // The parent component will decide what to do with the pin.
    const pin = values.join('');
    onComplete(pin);
  }, [values, onComplete]);

  // If the parent component clears the pin (e.g. on error), we reset the values here.
  useEffect(() => {
    if (disabled) {
        inputRefs.current[0].current?.focus();
    }
  }, [disabled]);


  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    // Allow only single digits
    if (!/^\d?$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    // Move to next input if a digit is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, length);
    if (pastedData) {
      const newValues = Array(length).fill('');
      pastedData.split('').forEach((char, index) => {
        newValues[index] = char;
      });
      setValues(newValues);
      
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex].current?.focus();
    }
  };

  return (
    <div className={cn("flex justify-center gap-2", className)} onPaste={handlePaste}>
      {values.map((value, index) => (
        <Input
          key={index}
          ref={inputRefs.current[index]}
          type="text" 
          pattern="\d*"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="h-14 w-12 text-center text-2xl font-semibold"
          autoComplete="off"
          disabled={disabled}
        />
      ))}
    </div>
  );
}
