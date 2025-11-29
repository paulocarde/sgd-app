class UIManager {
    constructor(containerId, displayId, onSelectCallback, onResetCallback, onFavoriteCallback, onManualSpeakCallback, onQuickActionCallback) {
        this.container = document.getElementById(containerId);
        this.display = document.getElementById(displayId);
        this.favoritesContainer = document.getElementById('favorites-container');
        this.quickContainer = document.getElementById('quick-actions-container'); // Importante: Contenedor del footer
        this.speakBtn = document.getElementById('btn-speak-now');

        this.onSelect = onSelectCallback;
        this.onReset = onResetCallback;
        this.onFavorite = onFavoriteCallback;
        this.onManualSpeak = onManualSpeakCallback;
        this.onQuickAction = onQuickActionCallback;

        if(this.speakBtn) this.speakBtn.onclick = () => this.onManualSpeak();
    }

    updatePhrase(text) {
        this.display.innerText = text;
    }

    renderOptions(options) {
        this.container.innerHTML = '';
        this.container.classList.remove('success-mode');
        
        // Lógica de visibilidad de botones extra
        if (this.speakBtn) this.speakBtn.style.display = this.display.innerText.length > 3 ? 'flex' : 'none';
        if (this.favoritesContainer) this.favoritesContainer.style.display = (options.length > 0 && this.display.innerText === "...") ? 'block' : 'none';

        if (options.length === 0) {
            this.renderResetButton();
            return;
        }

        options.forEach(opt => {
            const card = document.createElement('div');
            card.className = 'pictogram-card';
            card.setAttribute('data-category', opt.category || 'general'); 
            
            card.onclick = () => this.onSelect(opt.label);
            
            const img = this.createImageWithFallback(opt.icon, opt.label);
            const text = document.createElement('div');
            text.className = 'pictogram-label';
            text.innerText = opt.label;

            card.appendChild(img);
            card.appendChild(text);
            this.container.appendChild(card);
        });
    }

    // --- FUNCIÓN CRÍTICA PARA BOTONES RÁPIDOS ---
    renderQuickActions(actions) {
        if (!this.quickContainer) return;
        this.quickContainer.innerHTML = '';
        
        actions.forEach(action => {
            const btn = document.createElement('div');
            btn.className = 'quick-card';
            // Color de fondo suave para diferenciar emergencias
            btn.style.backgroundColor = action.color || '#fff';
            if (action.label === "¡AYUDA!") btn.style.border = "2px solid #FFCDD2"; // Borde rojo suave

            btn.onclick = () => this.onQuickAction(action);

            const img = this.createImageWithFallback(action.icon, action.label);
            const text = document.createElement('div');
            text.innerText = action.label;
            text.style.marginTop = "5px";
            
            btn.appendChild(img);
            btn.appendChild(text);
            this.quickContainer.appendChild(btn);
        });
    }

    showFinalSuccess(sentence, icons) {
        this.container.innerHTML = '';
        this.container.classList.add('success-mode'); 
        if (this.favoritesContainer) this.favoritesContainer.style.display = 'none';
        
        const stripContainer = document.createElement('div');
        stripContainer.className = 'sentence-strip';
        
        if (icons && icons.length > 0) {
            icons.forEach((iconUrl, index) => {
                const item = document.createElement('div');
                item.className = 'strip-item';
                const words = sentence.split(" "); 
                const label = index < words.length ? words[index] : ""; 
                const img = this.createImageWithFallback(iconUrl, label);
                const text = document.createElement('span');
                text.innerText = label;
                item.appendChild(img);
                item.appendChild(text);
                stripContainer.appendChild(item);
            });
        } else {
            // Si es un botón rápido (sin historial de iconos previo) mostramos un icono genérico
            const bigIcon = document.createElement('img');
            bigIcon.src = "https://cdn-icons-png.flaticon.com/512/2058/2058148.png"; 
            bigIcon.style.width = "120px";
            stripContainer.appendChild(bigIcon);
        }

        this.container.appendChild(stripContainer);

        const bigText = document.createElement('h2');
        bigText.className = 'final-sentence-text';
        bigText.innerText = `"${sentence}"`;
        this.container.appendChild(bigText);

        const homeBtn = document.createElement('button');
        homeBtn.className = 'btn-home-large';
        homeBtn.innerHTML = "🏠 Volver al Inicio";
        homeBtn.onclick = this.onReset;
        this.container.appendChild(homeBtn);
    }

    renderResetButton() {
        const btn = document.createElement('button');
        btn.className = 'btn-reset';
        btn.innerHTML = "🔄 Empezar nueva frase";
        btn.onclick = this.onReset;
        this.container.appendChild(btn);
    }

    renderFavorites(phrases) {
        if (!this.favoritesContainer) return;
        this.favoritesContainer.innerHTML = '';
        phrases.forEach(phrase => {
            const chip = document.createElement('div');
            chip.className = 'fav-chip';
            chip.innerText = "⭐ " + phrase;
            chip.onclick = () => this.onFavorite(phrase);
            this.favoritesContainer.appendChild(chip);
        });
    }

    createImageWithFallback(url, label) {
        const img = document.createElement('img');
        img.className = 'pictogram-img';
        img.alt = label;
        img.src = url;
        img.onerror = () => {
            img.onerror = null;
            img.src = "https://cdn-icons-png.flaticon.com/512/3524/3524335.png"; 
            if(label) {
                fetch(`https://api.arasaac.org/api/pictograms/es/bestsearch/${label.toLowerCase()}`)
                    .then(r => r.json()).then(d => { if(d[0]) img.src = `https://api.arasaac.org/api/pictograms/${d[0]._id}`; });
            }
        };
        return img;
    }
}