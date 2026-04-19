import React from 'react';

/**
 * FormInput - A styled wrapper for standard form inputs.
 * 
 * @param {Object} props
 * @param {string} props.label - The text displayed above the input.
 * @param {string} props.name - The name attribute for the input.
 * @param {string} [props.type="text"] - The HTML input type.
 * @param {string|number} props.value - The current value.
 * @param {function} props.onChange - Change handler function.
 * @param {string} [props.placeholder] - Optional placeholder text.
 * @param {number} [props.min] - Minimum value (for numeric inputs).
 * @param {number} [props.max] - Maximum value (for numeric inputs).
 */
const FormInput = ({ label, name, type = "text", value, onChange, placeholder, min, max }) => {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500/50 transition-all text-slate-900 dark:text-white"
      />
    </div>
  );
};

export default FormInput;