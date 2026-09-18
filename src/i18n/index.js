import { fr } from './fr';
import { en } from './en';

export const translations = { fr, en };

export function t(lang, key, defaultValue = key) {
  const dictionary = translations[lang] || translations.en;
  const keys = key.split('.');
  let result = dictionary;

  for (const k of keys) {
    if (result && result[k]) {
      result = result[k];
    } else {
      return defaultValue;
    }
  }
  return result;
}
