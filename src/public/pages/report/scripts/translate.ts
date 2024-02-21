function translatePage(languageCode: string): void {
    const translations: Record<string, Record<string, string>> = {
        en: {
            "donations-label":
                "I pay to keep my app free for everyone. Any donations appreciated ❤️",
            "black-player-label": "Black Player (?)",
            "white-player-label": "White Player (?)",
            "game-report-label": "📑 Game Report",
            "load-game-from-label": "Load game from",
            "analyse-button": "Analyse",
            "search-depth-label": "⚙️ Search depth",
            "lower-depth-recommandation-label":
                "Lower depths recommended for slower devices.",
            "accuracies-label": "Accuracies",
            "engine-label": "Engine",
            "suggestion-arrows-label": "Suggestion arrows",
            "footer-label": "A website by wintrcat",
            "privacy-policy-button": "Privacy Policy",
        },
        fr: {
            "donations-label":
                "Je paye pour garder mon app gratuite pour tous. Toutes les donations appréciées ❤️",
            "black-player-label": "Joueur Noir (?)",
            "white-player-label": "Joueur Blanc (?)",
            "game-report-label": "📑 Rapport de partie",
            "load-game-from-label": "Charger la partie à partir de",
            "analyse-button": "Analyser",
            "search-depth-label": "⚙️ Profondeur de recherche",
            "lower-depth-recommandation-label":
                "Profondeur de recherche plus basse recommandée pour des appareils plus lent.",
            "accuracies-label": "Précision",
            "engine-label": "Moteur",
            "suggestion-arrows-label": "Flèches de suggestion",
            "footer-label": "Un site web par wintrcat",
            "privacy-policy-button": "Politique de confidentialité",
        },
    };

    const elementsToTranslate = document.querySelectorAll('[data-translate]');

    elementsToTranslate.forEach((element) => {
        const translationKey = element.getAttribute("data-translate");
        if (translationKey && translations[languageCode] && translations[languageCode][translationKey]) {
            element.textContent = translations[languageCode][translationKey];
        }
    });
}

const userLanguage = navigator.language.split("-")[0];

translatePage(userLanguage);