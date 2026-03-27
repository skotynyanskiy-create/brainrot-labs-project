// Web Audio API per generare effetti sonori retrò/8-bit senza file esterni

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext: typeof AudioContext;
}

const getAudioContext = () => {
  if (typeof window !== 'undefined') {
    const AudioContextClass =
      window.AudioContext || (window as unknown as WindowWithWebkitAudio).webkitAudioContext;
    if (AudioContextClass) {
      return new AudioContextClass();
    }
  }
  return null;
};

const audioCtx = getAudioContext();

export const playCoinSound = () => {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'square';
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  // Arpeggio veloce tipo "Super Mario coin"
  osc.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5
  osc.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.1); // E6
  
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.4);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
};

export const playBlipSound = () => {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  // Suono "blip" corto per i click
  osc.frequency.setValueAtTime(440, audioCtx.currentTime); 
  osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
};

export const playWowSound = () => {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  // Effetto "Wow" (pitch slide veloce)
  osc.frequency.setValueAtTime(440, audioCtx.currentTime); 
  osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2);
  osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.4);
  
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
};

export const playAirhornSound = () => {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'sawtooth';
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  // Suono "Airhorn" (distorto e gracchiante)
  osc.frequency.setValueAtTime(300, audioCtx.currentTime); 
  osc.frequency.setValueAtTime(305, audioCtx.currentTime + 0.05);
  osc.frequency.setValueAtTime(300, audioCtx.currentTime + 0.1);
  osc.frequency.setValueAtTime(305, audioCtx.currentTime + 0.15);
  
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
};

export const playChaChingSound = () => {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  // Suono "Cha-Ching" metallico/distorto
  osc.type = 'square';
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
  osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.3);
  
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.4);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
};
