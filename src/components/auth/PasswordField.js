"use client";

import { useState } from "react";

export default function PasswordField({ id, name, label, autoComplete }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-[#020201] mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 pr-12 text-[#020201] outline-none transition focus:border-[#003893] focus:ring-2 focus:ring-[#003893]/20"
        />
        <button
          type="button"
          aria-label="Mantén presionado para ver la contraseña"
          onMouseDown={() => setVisible(true)}
          onMouseUp={() => setVisible(false)}
          onMouseLeave={() => setVisible(false)}
          onTouchStart={() => setVisible(true)}
          onTouchEnd={() => setVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-[#003893] transition-colors select-none"
        >
          {visible ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
              <path d="M9.9 4.24A11 11 0 0 1 12 4c7 0 11 8 11 8a13.4 13.4 0 0 1-3.17 4.2M6.1 6.1C3.9 7.6 2.4 9.6 1 11c0 0 4 8 11 8a10.9 10.9 0 0 0 4.24-.86" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}