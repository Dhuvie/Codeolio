"use client";

import { useState, useEffect, useRef } from "react";

interface TextDecoderProps {
  text: string;
  className?: string;
  characters?: string;
  speed?: number;
}

export default function TextDecoder({
  text,
  className = "",
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+",
  speed = 30,
}: TextDecoderProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const iterationRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isHovering) {
      iterationRef.current = 0;
      clearInterval(intervalRef.current as NodeJS.Timeout);

      intervalRef.current = setInterval(() => {
        setDisplayText((prev) =>
          text
            .split("")
            .map((letter, index) => {
              if (index < iterationRef.current) {
                return text[index];
              }
              if (letter === " ") return " ";
              return characters[Math.floor(Math.random() * characters.length)];
            })
            .join("")
        );

        if (iterationRef.current >= text.length) {
          clearInterval(intervalRef.current as NodeJS.Timeout);
        }

        iterationRef.current += 1 / 3; // Controls how fast it decodes (1/3 letter per frame)
      }, speed);
    } else {
      clearInterval(intervalRef.current as NodeJS.Timeout);
      setDisplayText(text);
    }

    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [isHovering, text, characters, speed]);

  return (
    <span
      className={className}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      data-cursor-magnetic
    >
      {displayText}
    </span>
  );
}
