"use client";

import React from "react";

interface FormattedMessageProps {
  content: string;
  isUser?: boolean;
}

export function FormattedMessage({ content, isUser = false }: FormattedMessageProps) {
  if (isUser) {
    return <span className="whitespace-pre-wrap break-words">{content}</span>;
  }

  // Split into lines for structured rendering
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: { type: "bullet" | "number"; items: React.ReactNode[] } | null = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === "bullet") {
        elements.push(
          <ul key={`list-${elements.length}`} className="my-2 space-y-1.5 pl-1">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 shrink-0" />
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`list-${elements.length}`} className="my-2 space-y-1.5 pl-1">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed">
                <span className="w-4 h-4 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  const formatInline = (text: string) => {
    // Replace **bold** with strong
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-[var(--text)]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      return;
    }

    // Divider line
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      flushList();
      elements.push(<hr key={index} className="my-2.5 border-[var(--border)]" />);
      return;
    }

    // Markdown Headers (### Header)
    if (trimmed.startsWith("### ") || trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      flushList();
      const headerText = trimmed.replace(/^#+\s*/, "");
      elements.push(
        <h4
          key={index}
          className="font-serif text-sm font-bold text-[var(--text)] mt-3 mb-1.5 flex items-center gap-1.5 border-b border-[var(--border)] pb-1"
        >
          {formatInline(headerText)}
        </h4>
      );
      return;
    }

    // Bullet points: "-", "*", "•"
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== "bullet") {
        flushList();
        currentList = { type: "bullet", items: [] };
      }
      currentList.items.push(formatInline(bulletMatch[1]));
      return;
    }

    // Numbered steps: "1.", "2."
    const numberMatch = trimmed.match(/^(\d+)[\.)]\s+(.+)/);
    if (numberMatch) {
      if (!currentList || currentList.type !== "number") {
        flushList();
        currentList = { type: "number", items: [] };
      }
      currentList.items.push(formatInline(numberMatch[2]));
      return;
    }

    // Normal paragraph line
    flushList();
    elements.push(
      <p key={index} className="text-xs leading-relaxed my-1">
        {formatInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1 text-xs text-[var(--text)]">{elements}</div>;
}
