"use client";

import { useState, useRef, useEffect } from "react";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function CustomSelect({ value, onChange, disabled }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { id: "Suggestion / Feature Idea", label: "Suggestion / Feature Idea", icon: "💡" },
    { id: "Platform Complain / Bug", label: "Platform Complain / Bug", icon: "🐛" },
    { id: "Other / Urgent Request", label: "Other / Urgent Request", icon: "⚡" },
  ];

  const selectedOption = options.find((opt) => opt.id === value) || options[0];

  // Закрываем дропдаун при клике вне его области
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
        Message Type
      </label>

      {/* Главная кнопка селекта */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 pl-4 pr-10 bg-gray-50 border-2 rounded-xl text-left text-sm font-bold text-black transition-all flex items-center justify-between cursor-pointer disabled:opacity-50 shadow-sm ${
          isOpen ? "border-orange-500 bg-white ring-2 ring-orange-500/10" : "border-gray-100 focus:border-orange-500"
        }`}
      >
        <span className="flex items-center gap-2">
          <span>{selectedOption.icon}</span>
          <span>{selectedOption.label}</span>
        </span>
        
        {/* Стрелочка, которая переворачивается при открытии */}
        <svg
          className={`w-4 h-4 text-gray-400 stroke-[2.5] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-orange-500" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* КАСТOМНЫЙ ВЫПАДАЮЩИЙ СПИСОК */}
      {isOpen && !disabled && (
        <div className="absolute left-0 mt-1.5 w-full bg-white border-2 border-gray-100 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-100 overflow-hidden">
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-orange-500 text-black"
                    : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                }`}
              >
                <span>{option.icon}</span>
                <span className="flex-1">{option.label}</span>
                {isSelected && (
                  <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}