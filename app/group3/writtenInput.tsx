/**
 * @file app/group3/writtenInput.tsx
 * @description A reusable component for generic text inputs, including single-line coordinate entry.
 */

import { Input } from "@/components/ui/input";
import React from 'react';

// --- Types ---
interface WrittenInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    // Optional: for adding specific styling or a right padding if an icon is used by the parent
    className?: string; 
}

/**
 * Reusable component for basic written inputs.
 */
export function WrittenInput({ label, placeholder, value, onChange, className = "" }: WrittenInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium block">{label}</label>
      <div className="relative">
        <Input 
            placeholder={placeholder} 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className={className} 
        />
        {/* The MapPin icon will now be placed in inputPanel.tsx */}
      </div>
    </div>
  );
}