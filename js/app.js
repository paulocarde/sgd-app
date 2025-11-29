document.addEventListener('DOMContentLoaded', () => {
    const engine = new AutomataEngine('data/automata.json');
    const voice = new VoiceEngine();
    let currentUi = null; 
    let globalData = null; // Guardamos todo el JSON aquí

    const handleSelection = (label) => {
        voice.speak(label);
        const result = engine.transition(label);
        
        if (result) {
            currentUi.updatePhrase(result.sentence);
            if (result.options.length === 0) {
                setTimeout(() => handleManualSpeak(), 500);
            } else {
                currentUi.renderOptions(result.options);
            }
        }
    };

    // --- MANEJO DE ACCIONES RÁPIDAS ---
    const handleQuickAction = (action) => {
        if (action.action === "open_pain_menu") {
            // 1. CASO DOLOR: Reemplazamos la pantalla principal con el menú de dolores
            if (globalData && globalData.painMenu) {
                currentUi.renderOptions(globalData.painMenu); // Pintamos los dolores
                currentUi.updatePhrase("Me duele...");
                voice.speak("¿Qué te duele?");
                
                // TRUCO: Cambiamos temporalmente qué pasa al hacer clic
                currentUi.onSelect = (painLabel) => {
                    // Buscamos cuál dolor se eligió
                    const painItem = globalData.painMenu.find(p => p.label === painLabel);
                    if (painItem) {
                        voice.speak(painItem.sentence); // "Me duele la cabeza"
                        currentUi.showFinalSuccess(painItem.sentence, [painItem.icon]);
                        
                        // IMPORTANTE: Restaurar el comportamiento normal al volver al inicio
                        currentUi.onSelect = handleSelection; 
                    }
                };
            }
        } else {
            // 2. CASO EMERGENCIA/RUTINA: Habla directamente
            voice.speak(action.sentence);
            currentUi.showFinalSuccess(action.sentence, [action.icon]);
        }
    };

    const handleManualSpeak = () => {
        const sentence = engine.sentenceBuffer.join(" ");
        const icons = engine.iconBuffer;
        if (!sentence) return;
        voice.speak(sentence);
        saveFrequentPhrase(sentence);
        currentUi.showFinalSuccess(sentence, icons);
    };

    const handleReset = () => {
        const options = engine.reset();
        currentUi.onSelect = handleSelection; // Aseguramos que el clic vuelva a ser normal
        currentUi.updatePhrase("...");
        currentUi.renderOptions(options);
        loadFrequentPhrases();
        // Volvemos a pintar los botones rápidos por si acaso
        if(globalData && globalData.quickActions) currentUi.renderQuickActions(globalData.quickActions);
    };

    const handleFavoriteClick = (fullPhrase) => {
        currentUi.updatePhrase(fullPhrase);
        voice.speak(fullPhrase);
    };

    const saveFrequentPhrase = (phrase) => {
        let history = JSON.parse(localStorage.getItem('sgd_history')) || [];
        if (!history.includes(phrase)) {
            history.unshift(phrase);
            if (history.length > 5) history.pop();
            localStorage.setItem('sgd_history', JSON.stringify(history));
        }
    };

    const loadFrequentPhrases = () => {
        const history = JSON.parse(localStorage.getItem('sgd_history')) || [];
        currentUi.renderFavorites(history);
    };

    currentUi = new UIManager(
        'options-container', 
        'display-phrase', 
        handleSelection, 
        handleReset, 
        handleFavoriteClick, 
        handleManualSpeak,
        handleQuickAction // Pasamos la nueva función
    );

    // Carga inicial
    fetch('data/automata.json')
        .then(r => r.json())
        .then(data => {
            globalData = data; // Guardamos para usar luego
            engine.init().then(options => {
                currentUi.renderOptions(options);
                loadFrequentPhrases();
                // Aquí pintamos los botones rápidos al inicio
                if(data.quickActions) currentUi.renderQuickActions(data.quickActions);
            });
        });

    if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
});