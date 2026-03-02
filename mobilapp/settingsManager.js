/**
 * Settings Manager for Mobile App
 * Handles Theme (Dark/Light) and Language preferences using LocalStorage.
 */

const SettingsManager = {
    settings: {
        theme: 'light',
        language: 'en'
    },

    /**
     * Initialize settings from localStorage
     */
    init() {
        const savedSettings = localStorage.getItem('mobileAppSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }
        this.applySettings();
    },

    /**
     * Apply settings to the document
     */
    applySettings() {
        // Apply Theme
        if (this.settings.theme === 'dark') {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }

        // Apply Language (Simulated for now)
        document.documentElement.setAttribute('lang', this.settings.language);

        // Save to localStorage
        localStorage.setItem('mobileAppSettings', JSON.stringify(this.settings));
    },

    /**
     * Toggle between Light and Dark mode
     */
    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.applySettings();
        return this.settings.theme;
    },

    /**
     * Change app language
     */
    setLanguage(lang) {
        this.settings.language = lang;
        this.applySettings();
        // In a real app, this might trigger a page reload or state update
    },

    getSettings() {
        return this.settings;
    }
};

// Auto-init on script load
SettingsManager.init();
