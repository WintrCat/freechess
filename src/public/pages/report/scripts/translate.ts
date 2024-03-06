declare global {
    interface Window {
        google: typeof google;
    }
    namespace google {
        namespace translate {
            class TranslateElement {
                constructor(options: {pageLanguage: string}, containerId: string);
            }
        }
    }
}
function googleTranslateElementInit(): void {
    new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');
}

export {};