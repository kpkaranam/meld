/**
 * Web Audio API utilities for timer sound notifications.
 * Uses a short synthesized beep rather than an audio file to avoid
 * network requests and keep the bundle small.
 */

export function playNotificationSound(): void {
  try {
    const ctx = new AudioContext();

    function beep(startTime: number) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    }

    // Two beeps — first immediately, second 350 ms later
    beep(ctx.currentTime);
    beep(ctx.currentTime + 0.35);

    // Close the AudioContext after the sounds have finished
    setTimeout(() => {
      ctx.close().catch(() => undefined);
    }, 1000);
  } catch {
    // AudioContext may be unavailable (e.g. in test environments) — fail silently
  }
}
