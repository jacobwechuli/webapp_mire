"use client";

import React from "react";

interface ProgressProps {
  value: number;
}

export const Progress: React.FC<ProgressProps> = ({ value }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  return (
    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
      <div 
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};

export default Progress; 