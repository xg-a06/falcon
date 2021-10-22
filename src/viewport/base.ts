import Transform from '@src/helper/transform';

type ElmSize = {
  width: number;
  height: number;
};

type RenderFunction = (renderData: any) => ImageData;

interface DisplayState {
  hflip: boolean;
  vflip: boolean;
  scale: number;
  angle: number;
  invert: boolean;
  offset: { x: number; y: number };
  wwwc: { ww: number; wc: number };
  align: 'center' | 'left' | 'right' | 'top' | 'bottom';
}
interface BaseOptions {
  id?: string;
  elm: HTMLElement;
  renderer: RenderFunction;
}

class Base2D {
  id: string;

  elm: HTMLElement;

  renderCanvas: HTMLCanvasElement;

  canvas: HTMLCanvasElement;

  displayState: DisplayState;

  transform: Transform;

  renderData: unknown;

  renderer: RenderFunction;

  constructor(options: BaseOptions) {
    this.id = options.id!;
    this.elm = options.elm;
    this.transform = new Transform();
    this.renderer = options.renderer;

    this.displayState = this.initDisplayState();
    this.renderCanvas = this.initRenderCanvas();
    this.canvas = this.initCanvas();
  }

  initDisplayState(): DisplayState {
    return {
      hflip: false,
      vflip: false,
      scale: 1,
      angle: 0,
      invert: false,
      offset: { x: 0, y: 0 },
      wwwc: { ww: 0, wc: 0 },
      align: 'center',
    };
  }

  initRenderCanvas(): HTMLCanvasElement {
    const renderCanvas = document.createElement('canvas');
    renderCanvas.width = 0;
    renderCanvas.height = 0;
    return renderCanvas;
  }

  initCanvas(): HTMLCanvasElement {
    const { width, height } = this.getElmSize();
    const canvas = document.createElement('canvas');
    canvas.id = this.id;
    canvas.className = 'falcon_canvas';
    canvas.style.position = 'absolute';
    canvas.style.display = 'block';
    canvas.style.zIndex = '1';
    canvas.width = width;
    canvas.height = height;
    this.elm.appendChild(canvas);
    return canvas;
  }

  getElmSize(): ElmSize {
    const { clientWidth, clientHeight } = this.elm;
    return { width: clientWidth, height: clientHeight };
  }

  setTransform(ctx: CanvasRenderingContext2D): void {
    const {
      transform,
      canvas,
      renderCanvas,
      displayState: { offset, angle, scale, hflip, vflip },
    } = this;

    // const autoScale = Math.min(canvas.width / renderCanvas.width, canvas.height / renderCanvas.height);
    transform.reset();
    transform.translate(offset.x, offset.y);
    transform.translate(canvas.width / 2, canvas.height / 2);
    transform.scale(scale, scale);
    transform.rotate(angle);
    transform.scale(hflip ? -1 : 1, vflip ? -1 : 1);
    transform.translate(-renderCanvas.width / 2, -renderCanvas.height / 2);
    ctx.setTransform(
      transform.mat[0],
      transform.mat[1],
      transform.mat[2],
      transform.mat[3],
      transform.mat[4],
      transform.mat[5],
    );
  }

  getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const context = canvas.getContext('2d');

    if (context === null) {
      throw new Error('getContext 2d rendering contexts error');
    }

    return context;
  }

  draw(): void {
    const { renderCanvas, canvas } = this;
    const { width, height } = canvas;
    if (width === 0 || height === 0) {
      return;
    }
    const ctx = this.getCanvasContext(canvas);
    // ctx.fillStyle = 'black';
    ctx.clearRect(0, 0, width, height);
    const { width: renderWidth, height: renderHeight } = renderCanvas;
    this.setTransform(ctx);
    ctx.drawImage(renderCanvas, 0, 0, renderWidth, renderHeight, 0, 0, renderWidth, renderHeight);
  }
}

export default Base2D;
