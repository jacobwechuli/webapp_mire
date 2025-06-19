import React from "react";

interface ProgressProps {
  value: number;
}

export const Progress: React.FC<ProgressProps> = ({ value }) => {
  return (
    <div className="w-full h-6 bg-muted rounded-full overflow-hidden shadow-inner relative">
      <div
        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
        style={{ width: `${value}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary-foreground">
        {value}%
      </div>
    </div>
  );
}; 