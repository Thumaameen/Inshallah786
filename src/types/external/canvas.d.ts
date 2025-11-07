declare module 'canvas' {
  export interface Canvas {
    getContext(context: '2d'): CanvasRenderingContext2D;
    width: number;
    height: number;
  }

  export interface Image {
    src: string;
    onload: () => void;
  }

  export function createCanvas(width: number, height: number): Canvas;
  export function loadImage(src: string): Promise<Image>;
}