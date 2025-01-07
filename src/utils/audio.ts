export class TimerAudio {
  private static instance: TimerAudio;
  private audioContexts: Map<string, AudioContext> = new Map();
  private oscillators: Map<string, { stop: () => void }> = new Map();

  private constructor() {}

  static getInstance(): TimerAudio {
    if (!TimerAudio.instance) {
      TimerAudio.instance = new TimerAudio();
    }
    return TimerAudio.instance;
  }

  private async initializeAudioContext(timerId: string): Promise<void> {
    if (!this.audioContexts.has(timerId)) {
      const audioContext = new AudioContext();
      this.audioContexts.set(timerId, audioContext);
    }

    const audioContext = this.audioContexts.get(timerId)!;
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
  }

  async playLoop(timerId: string, audioUrl: string): Promise<void> {
    try {
      await this.initializeAudioContext(timerId);

      const audioContext = this.audioContexts.get(timerId)!;

      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const playSound = () => {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        source.start(audioContext.currentTime);

        source.onended = () => {
          source.disconnect();
        };
      };

      const intervalId = setInterval(() => {
        playSound();
      }, 1000);

      this.oscillators.set(timerId, { stop: () => clearInterval(intervalId) });
    } catch (error) {
      console.error(
        `Failed to play looping audio for timer ${timerId}:`,
        error
      );
    }
  }

  stop(timerId: string): void {
    this.cleanup(timerId);
  }

  private cleanup(timerId: string): void {
    const intervalData = this.oscillators.get(timerId);
    const audioContext = this.audioContexts.get(timerId);

    if (intervalData) {
      intervalData.stop(); // Clear the interval
      this.oscillators.delete(timerId);
    }

    if (audioContext) {
      audioContext.close();
      this.audioContexts.delete(timerId);
    }
  }
}
