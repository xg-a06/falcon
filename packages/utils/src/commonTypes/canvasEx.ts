import { ImageData } from './imageData';
import { Transform } from './transform';

export interface HTMLCanvasElementEx extends HTMLCanvasElement {
  imageData: ImageData;
  transform: Transform;
  tools: Array<any>;
  toolsData: Record<string, any>;
}
