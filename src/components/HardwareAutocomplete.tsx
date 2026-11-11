"use client";

import { useState, useRef, useEffect } from "react";
import { hardwareDatabase } from "@/data/hardwareDatabase";
import { ChevronDown, Check } from "lucide-react";

interface Props {
  category: keyof typeof hardwareDatabase;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function HardwareAutocomplete({
  category,
  value,
  onChange,
  placeholder,
  required,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const options = hardwareDatabase[category] || [];

  // Filter options based on typed value
  const filtered = options.filter((item) =>
    item.toLowerCase().includes((value || "").toLowerCase())
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: string) => {
    onChange(item);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filtered.length - 1
      );
    } else if (e.key === "Enter") {
      if (isOpen && highlightedIndex >= 0 && filtered[highlightedIndex]) {
        e.preventDefault();
        handleSelect(filtered[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className="w-full px-3.5 py-2.5 pr-8 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text font-mono focus:outline-none focus:border-twk-green/60 transition-colors"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-twk-dim hover:text-twk-muted p-1"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${
              isOpen ? "rotate-180 text-twk-green" : ""
            }`}
          />
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl bg-[#0D140D] border border-twk-border shadow-2xl py-1 text-xs font-mono backdrop-blur-xl">
          {filtered.slice(0, 8).map((item, idx) => {
            const isSelected = item.toLowerCase() === (value || "").toLowerCase();
            const isHighlighted = idx === highlightedIndex;
            return (
              <li
                key={item}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => handleSelect(item)}
                className={`px-3 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                  isHighlighted || isSelected
                    ? "bg-twk-green/15 text-twk-green font-semibold"
                    : "text-twk-muted hover:bg-twk-surface hover:text-twk-text"
                }`}
              >
                <span className="truncate pr-2">{item}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-twk-green flex-shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
