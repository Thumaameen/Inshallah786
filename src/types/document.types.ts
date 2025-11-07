import { Buffer } from 'buffer';
import { Canvas } from 'canvas';

declare module 'canvas' {
  interface Canvas {
    toBuffer(): Buffer;
  }
}

export interface DocumentMetadata {
  title?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  keywords?: string;
  documentNumber?: string; // Added this field
}