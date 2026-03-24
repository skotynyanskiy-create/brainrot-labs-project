export type VoicePreset = 'chaotic' | 'sales' | 'deadpan';

export interface GenerateImageRequest {
  prompt: string;
  voicePreset: VoicePreset;
}

export interface GenerateImageResponse {
  imageDataUrl: string;
}

export interface SuggestCaptionRequest {
  prompt: string;
  voicePreset: VoicePreset;
}

export interface SuggestCaptionResponse {
  suggestions: string[];
}
