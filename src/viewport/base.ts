type ElmSize = {
  width: number;
  height: number;
};

type RenderFunction = (renderData: any) => ImageData;

interface DisplayState {
  hflip: boolean;
  vflip: boolean;
  scale: number;
  rotate: number;
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

  renderCanvas: HTMLElement;

  canvas: HTMLElement;

  displayState: DisplayState;

  renderData: unknown;

  renderer: RenderFunction;

  constructor(options: BaseOptions) {
    this.id = options.id!;
    this.elm = options.elm;
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
      rotate: 0,
      invert: false,
      offset: { x: 0, y: 0 },
      wwwc: { ww: 0, wc: 0 },
      align: 'center',
    };
  }

  initRenderCanvas(): HTMLElement {
    const renderCanvas = document.createElement('canvas');
    renderCanvas.width = 0;
    renderCanvas.height = 0;
    return renderCanvas;
  }

  initCanvas(): HTMLElement {
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
}

export default Base2D;
