class VoiceEngine {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voice = null;
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.setVoice();
        }
        this.setVoice();
    }

    setVoice() {
        const voices = this.synth.getVoices();
        this.voice = voices.find(v => v.lang.includes('es')) || voices[0];
    }

    speak(text) {
        if (!this.synth || this.synth.speaking) this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (this.voice) utterance.voice = this.voice;
        utterance.rate = 0.9;
        this.synth.speak(utterance);
    }
}