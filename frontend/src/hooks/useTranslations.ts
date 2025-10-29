'use client';

import { useState, useEffect } from 'react';

interface Translations {
  [key: string]: any;
}

interface UseTranslationsReturn {
  t: (key: string, params?: Record<string, string>) => string;
  changeLanguage: (locale: string) => void;
  currentLocale: string;
}

export function useTranslations(): UseTranslationsReturn {
  const [translations, setTranslations] = useState<Translations>({});
  const [currentLocale, setCurrentLocale] = useState<string>('en');

  // Load translations from localStorage or default to English
  useEffect(() => {
    const savedLocale = localStorage.getItem('fashion-fit-locale') || 'en';
    setCurrentLocale(savedLocale);
    loadTranslations(savedLocale);
  }, []);

  const loadTranslations = async (locale: string) => {
    const safeLoad = async (loc: string): Promise<any | null> => {
      try {
        const res = await fetch(`/locales/${loc}/common.json`);
        if (!res.ok) return null;
        const text = await res.text();
        if (!text || !text.trim()) return null;
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      } catch {
        return null;
      }
    };

    const deepMerge = (base: any, override: any): any => {
      if (!base) return override || {};
      if (!override) return base || {};
      const result: any = Array.isArray(base) ? [...base] : { ...base };
      for (const key of Object.keys(override)) {
        if (
          override[key] &&
          typeof override[key] === 'object' &&
          !Array.isArray(override[key]) &&
          typeof base[key] === 'object' &&
          !Array.isArray(base[key])
        ) {
          result[key] = deepMerge(base[key], override[key]);
        } else {
          result[key] = override[key];
        }
      }
      return result;
    };

    const enData = await safeLoad('en');
    if (locale === 'en') {
      setTranslations(enData || {});
      return;
    }
    const localeData = await safeLoad(locale);
    const merged = deepMerge(enData || {}, localeData || {});
    setTranslations(merged);
  };

  const changeLanguage = (locale: string) => {
    setCurrentLocale(locale);
    localStorage.setItem('fashion-fit-locale', locale);
    loadTranslations(locale);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to key if translation not found
        return key;
      }
    }
    
    if (typeof value === 'string') {
      // Replace parameters in translation string
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
          return params[paramKey] || match;
        });
      }
      return value;
    }
    
    return key;
  };

  return {
    t,
    changeLanguage,
    currentLocale
  };
}