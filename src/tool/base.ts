// disable  0未激活
// enable   1激活但是只显示
// passive	2激活但是只更新
// active   3激活但是增加、更新、显示

const defaultOptions = {
  style: {
    fontSize: 14,
    fontFamliy: 'Arial',
    lineWidth: 2,
    fontColor: 'rgba(67, 199, 246,1)',
    activeFontColor: 'rgba(144, 255, 222,1)',
    strokeColor: 'rgba(67, 199, 246,1)',
    activeStrokeColor: 'rgba(144, 255, 222,1)',
    shadowColor: 'rgba(0,0,0,0.8)',
    shadowBlur: 0,
    shadowOffsetX: 1,
    shadowOffsetY: 1,
    handler: {
      r: 5,
    },
    activeDistance: 5,
  },
};
class Base {
  options: any;

  target: HTMLCanvasElement;

  toolType: string;

  _level: number;

  constructor(target: HTMLCanvasElement, options: any) {
    this.options = { ...options, ...defaultOptions };
    this.target = target;
    this.toolType = '';
    this._level = 0;
  }

  get active() {
    return this.level === 3;
  }

  get passive() {
    return this.level === 2;
  }

  get enable() {
    return this.level === 1;
  }

  get disable() {
    return this.level === 0;
  }

  get level() {
    return this._level;
  }

  set level(state) {
    this._level = state;
    this.levelHandler();
  }

  levelHandler() {
    console.log('current level', this.level);
  }

  setOptions(options: any) {
    this.options = { ...this.options, ...options };
    // 刷新
  }

  getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('get context error');
    }
    const { style } = this.options;
    ctx.fillStyle = style.fontColor;
    ctx.strokeStyle = style.strokeColor;
    ctx.shadowColor = style.shadowColor;
    ctx.shadowBlur = style.shadowBlur;
    ctx.shadowOffsetX = style.shadowOffsetX;
    ctx.shadowOffsetY = style.shadowOffsetY;
    return ctx;
  }

  // getFont(scale = 1) {
  //   scale /= 4;
  //   scale = scale < 1 ? 1 : scale;
  //   return `${Math.round(baseStyle.fontSize * scale)}px ${baseStyle.fontFamliy}`;
  // }

  // getToolData() {
  //   const {
  //     toolsManager: { toolsData },
  //   } = this;
  //   let toolData;
  //   if (!this.toolType || !toolsData[this.toolType]) {
  //     return toolData;
  //   }
  //   toolData = toolsData[this.toolType];
  //   return toolData;
  // }

  // pointIsInValidArea(point, area) {
  //   return !(point.x < 0 || point.x >= area.width || point.y < 0 || point.y >= area.height);
  // }
}

export default Base;
