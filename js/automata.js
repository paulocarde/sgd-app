class AutomataEngine {
    constructor(configUrl) {
        this.configUrl = configUrl;
        this.currentState = null;
        this.data = null;
        this.sentenceBuffer = []; 
        this.iconBuffer = [];     
    }

    async init() {
        try {
            const response = await fetch(this.configUrl);
            this.data = await response.json();
            this.currentState = this.data.initialState;
            return this.getOptions();
        } catch (error) {
            console.error("Error cargando autómata:", error);
            return [];
        }
    }

    getOptions() {
        if (!this.data) return [];
        const stateConfig = this.data.states[this.currentState];
        return stateConfig ? stateConfig.options : [];
    }

    transition(selectedLabel) {
        const stateConfig = this.data.states[this.currentState];
        const selectedOption = stateConfig.options.find(opt => opt.label === selectedLabel);

        if (selectedOption) {
            // Solo guardamos si NO es un botón silencioso (navegación)
            if (!selectedOption.silent) {
                this.sentenceBuffer.push(selectedOption.label);
                this.iconBuffer.push(selectedOption.icon);
            }

            this.currentState = selectedOption.nextState;
            
            const nextOptions = this.getOptions();
            const isFinalState = this.data.states[this.currentState].isFinal;

            return {
                newState: this.currentState,
                sentence: this.sentenceBuffer.join(" "),
                options: nextOptions,
                isFinal: isFinalState && nextOptions.length === 0
            };
        }
        return null;
    }

    reset() {
        this.currentState = this.data.initialState;
        this.sentenceBuffer = [];
        this.iconBuffer = []; 
        return this.getOptions();
    }
}