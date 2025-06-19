"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const themes = [
  {
    key: 'default',
    name: 'Default',
    preview: 'A modern, balanced look.'
  },
  {
    key: 'dark',
    name: 'Dark',
    preview: 'Classic dark mode.'
  },
  {
    key: 'green',
    name: 'Green',
    preview: 'Fresh, vibrant green.'
  }
];

export default function ThemePage() {
  const [selected, setSelected] = useState('default');
  const router = useRouter();

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('goldplus-theme') : null;
    if (stored) setSelected(stored);
  }, []);

  const handleSelect = (key: string) => {
    setSelected(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('goldplus-theme', key);
      document.documentElement.setAttribute('data-theme', key);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12">
      <h1 className="text-4xl font-bold mb-8 text-foreground">Choose a Theme</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        {themes.map(theme => (
          <Card
            key={theme.key}
            className={`cursor-pointer border-2 transition-all duration-200 ${selected === theme.key ? 'border-primary scale-105 shadow-lg' : 'border-border'}`}
            onClick={() => handleSelect(theme.key)}
            data-theme-preview={theme.key}
          >
            <CardHeader>
              <CardTitle className="text-foreground">{theme.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-24 w-full rounded mb-2" style={{ background: getThemePreviewColor(theme.key) }} />
              <p className="text-muted-foreground">{theme.preview}</p>
              {selected === theme.key && <p className="text-primary font-bold mt-2">Selected</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function getThemePreviewColor(key: string) {
  switch (key) {
    case 'dark':
      return 'linear-gradient(90deg, #18181b 0%, #27272a 100%)';
    case 'green':
      return 'linear-gradient(90deg, #4ade80 0%, #166534 100%)';
    default:
      return 'linear-gradient(90deg, #facc15 0%, #a3a3a3 100%)';
  }
} 