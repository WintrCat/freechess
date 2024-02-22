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
            "lower-depth-recommendation-label":
                "Lower depths recommended for slower devices.",
            "accuracies-label": "Accuracies",
            "engine-label": "Engine",
            "suggestion-arrows-label": "Suggestion arrows",
            "footer-label": "A website by wintrcat",
            "privacy-policy-button": "Privacy Policy",
            "game-select-label": "Select a game",
            "game-select-cancel-button": "Cancel",
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
            "lower-depth-recommendation-label":
                "Profondeur de recherche plus basse recommandée pour des appareils plus lents.",
            "accuracies-label": "Précision",
            "engine-label": "Moteur",
            "suggestion-arrows-label": "Flèches de suggestion",
            "footer-label": "Un site web par wintrcat",
            "privacy-policy-button": "Politique de confidentialité",
            "game-select-label": "Sélectionne une partie",
            "game-select-cancel-button": "Annuler",
        },
    };

    const placeholderTranslations: Record<string, Record<string, string>> = {
        en: {
            "pgn-label": "Enter PGN here...",
            "username-label": "Username...",
        },
        fr: {
            "pgn-label": "Insérer le PGN ici...",
            "username-label": "Nom d'utilisateur...",
        },
    };

    $("[data-translate]").each((index, element) => {
        const translationKey = $(element).data("translate");
        if (
            translationKey &&
            translations[languageCode] &&
            translations[languageCode][translationKey]
        ) {
            $(element).html(translations[languageCode][translationKey]);
        } else if (
            translationKey &&
            placeholderTranslations[languageCode] &&
            placeholderTranslations[languageCode][translationKey]
        ) {
            $(element).attr(
                "placeholder",
                placeholderTranslations[languageCode][translationKey]
            );
        }
    });
}

const userLanguage = navigator.language.split("-")[0];

translatePage(userLanguage);
function translateIntoUserLanguage(languageCode: string, key: string): string {
    const translations: Record<string, Record<string, string>> = {
        en: {
            "No games found.": "No games found.",
            "Enter save text here...": "Enter save text here...",
            "Enter PGN here...": "Enter PGN here...",
            "Fetching games...": "Fetching games...",
            "It can take around a minute to process a full game.":
                "It can take a minute to process a full game.",
            "Evaluating positions...": "Evaluating positions...",
            "Evaluation complete.": "Evaluation complete.",
            "Please complete the CAPTCHA to continue.":
                "Please complete the CAPTCHA to continue.",
            "Generating report...": "Generating report...",
            "a great move": "a great move",
            "an okay move": "an okay move",
            "an inaccuracy": "an inaccuracy",
            "a mistake": "a mistake",
            "a blunder": "a blunder",
            "theory": "theory",
            "best": "best",
            "brilliant": "brilliant",
            "forced": "forced",
            "is": "is",
            "Best was": "Best was",
            "Enter a PGN to analyse.": "Enter a PGN to analyse.",
            "Failed to parse invalid PGN.": "Failed to parse invalid PGN.",
            "PGN contains illegal moves.":"PGN contains illegal moves.",
            "Failed to parse PGN.": "Failed to parse PGN.",
            "Provide a game to analyse.": "Provide a game to analyse.",
            "Parsing PGN...":"Parsing PGN...",
        },
        fr: {
            "No games found.": "Aucune partie trouvée.",
            "Enter save text here...": "Insérer le texte sauvegardé ici...",
            "Enter PGN here...": "Insérer le PGN ici...",
            "Fetching games...": "Récupération des parties...",
            "It can take around a minute to process a full game.":
                "Le traitement complet d'une partie peut prendre quelques minutes.",
            "Evaluating positions...": "Analyse des positions...",
            "Evaluation complete.": "Analyse terminée.",
            "Please complete the CAPTCHA to continue.":
                "Veuillez compléter le CAPTCHA pour continuer.",
            "Generating report...": "Génération du rapport de partie...",
            "a great move": "un excellent coup",
            "an okay move": "un bon coup",
            "an inaccuracy": "une imprécision",
            "a mistake": "une erreur",
            "a blunder": "un gaffe",
            "theory": "un coup théorique",
            "best": "le meilleur coup",
            "brilliant": "un coup brillant",
            "forced": "forcé",
            "is": "est",
            "Best was": "Le meilleur coup était",
            "Enter a PGN to analyse.": "Insérer un PGN à analyser.",
            "Failed to parse invalid PGN.": "Impossible de parser un PGN invalide.",
            "PGN contains illegal moves.": "Le PGN contient des coups illégaux.",
            "Failed to parse PGN.": "Impossible de parser le PGN.",
            "Provide a game to analyse.": "Fournissez une partie à analyser.",
            "Parsing PGN...": "Analyse du PGN...",
        },
    };
    return translations[languageCode][key] ?? key;
}
document.addEventListener("click", () => translatePage(userLanguage));