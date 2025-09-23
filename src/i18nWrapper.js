import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Safe fallback translations
const fallbackTranslations = {
  en: {
    translation: {
      nav: {
        home: "Home",
        about: "About",
        contact: "Contact",
        dashboard: "Dashboard"
      },
      hero: {
        title: "Your Health Partner",
        subtitle: "Book appointments and manage your health",
        search: {
          specialty: "Specialty",
          location: "Location"
        }
      }
    }
  },
  fr: {
    translation: {
      nav: {
        home: "Accueil",
        about: "À propos",
        contact: "Contact",
        dashboard: "Tableau de bord"
      },
      hero: {
        title: "Votre partenaire santé",
        subtitle: "Prenez des rendez-vous et gérez votre santé",
        search: {
          specialty: "Spécialité",
          location: "Localisation"
        }
      }
    }
  }
};

// Try to load translations safely
let en, fr, ar;

try {
  en = require('./locales/en.json');
} catch (error) {
  console.warn('Could not load en.json, using fallback');
  en = fallbackTranslations.en.translation;
}

try {
  fr = require('./locales/fr.json');
} catch (error) {
  console.warn('Could not load fr.json, using fallback');
  fr = fallbackTranslations.fr.translation;
}

try {
  ar = require('./locales/ar.json');
} catch (error) {
  console.warn('Could not load ar.json, using fallback');
  ar = fallbackTranslations.en.translation; // Use English as fallback
}

// Initialize i18n with error handling
try {
  i18n
    .use(initReactI18next)
    .init({
      resources: { 
        en: { translation: en }, 
        fr: { translation: fr },
        ar: { translation: ar }
      },
      lng: 'fr',
      fallbackLng: 'fr',
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage']
      }
    });
} catch (error) {
  console.error('Failed to initialize i18n:', error);
  // Initialize with minimal fallback
  i18n
    .use(initReactI18next)
    .init({
      resources: fallbackTranslations,
      lng: 'fr',
      fallbackLng: 'fr',
      interpolation: { escapeValue: false }
    });
}

export default i18n;
