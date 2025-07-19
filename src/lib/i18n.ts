import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
import enCommon from '@/locales/en/common.json';
import enNavigation from '@/locales/en/navigation.json';
import enQuests from '@/locales/en/quests.json';
import enNotifications from '@/locales/en/notifications.json';
import enCreate from '@/locales/en/create.json';
import enProfile from '@/locales/en/profile.json';
import enGuide from '@/locales/en/guide.json';

import zhCommon from '@/locales/zh/common.json';
import zhNavigation from '@/locales/zh/navigation.json';
import zhQuests from '@/locales/zh/quests.json';
import zhNotifications from '@/locales/zh/notifications.json';
import zhCreate from '@/locales/zh/create.json';
import zhProfile from '@/locales/zh/profile.json';
import zhGuide from '@/locales/zh/guide.json';

const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    quests: enQuests,
    notifications: enNotifications,
    create: enCreate,
    profile: enProfile,
    guide: enGuide,
  },
  zh: {
    common: zhCommon,
    navigation: zhNavigation,
    quests: zhQuests,
    notifications: zhNotifications,
    create: zhCreate,
    profile: zhProfile,
    guide: zhGuide,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'navigation', 'quests', 'notifications', 'create', 'profile', 'guide'],
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;