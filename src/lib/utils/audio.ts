/**
 * Plays a standard scanner beep sound using Web Audio API.
 * Frequency: 2000Hz (high-pitch hardware piezo buzzer sound)
 * Duration: 80ms (short, crisp beep)
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

    // A sine wave at high frequency mimics the clean piezo buzzer of a scanner
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(2000, audioCtx.currentTime)
    
    const duration = 0.08 // 80ms
    const volume = 0.12   // 12% volume

    // Play at constant volume (flat envelope)
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime)
    // Hold the volume constant until just before the end
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime + duration - 0.01)
    // Quick ramp down in the final 10ms to prevent popping/clicking
    gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + duration)

    oscillator.start(audioCtx.currentTime)
    oscillator.stop(audioCtx.currentTime + duration)
  } catch (error) {
    console.warn('Play scan beep failed:', error)
  }
}
