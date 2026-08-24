/**
 * Plays a standard scanner beep sound using Web Audio API.
 * Frequency: 1400Hz (typical crisp retail scanner beep)
 * Duration: 100ms
 */
export function playScanBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    const audioCtx = new AudioContextClass()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.type = 'sine'
    // 1400Hz is a typical frequency for scanner beeps
    oscillator.frequency.setValueAtTime(1400, audioCtx.currentTime)
    
    // Low volume (15%) to avoid being too loud and abrasive
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime)
    
    // Smooth ramp down to 0 at the end to prevent any speaker pops/clicks
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1)

    oscillator.start(audioCtx.currentTime)
    oscillator.stop(audioCtx.currentTime + 0.1)
  } catch (error) {
    console.warn('Play scan beep failed:', error)
  }
}
