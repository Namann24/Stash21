"use client";

import { useState, useEffect, ReactNode } from "react";


interface GlitchTextProps {
  children: string;
  className?: string;
}

const chars = "01!@#$%^&*()_+-=[]{}|;':,./<>?`~ABCDEF0123456789";

export default function GlitchText({ children, className = "" }: GlitchTextProps) {
  const [text, setText] = useState(children);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered) {
      let iteration = 0;
      
      interval = setInterval(() => {
        setText((prev) => 
          prev.split("")
            .map((char, index) => {
              if (index < iteration) {
                return children[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );
        
        if (iteration >= children.length) {
          clearInterval(interval);
        }
        
        iteration += 1 / 3;
      }, 30);
    } else {
      setText(children);
    }
    
    return () => clearInterval(interval);
  }, [isHovered, children]);

  return (
    <span 
      className={className} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      {text}
    </span>
  );
}
