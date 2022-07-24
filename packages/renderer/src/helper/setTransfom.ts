import { HTMLCanvasElementEx, Transform } from '@falcon/utils';
import { DisplayState } from '../typing';

interface TransformOptions extends Pick<DisplayState, 'offset' | 'angle' | 'scale' | 'hflip' | 'vflip'> {
  canvasWidth: number;
  canvasHeight: number;
  renderCanvasWidth: number;
  renderCanvasHeight: number;
}

// 原生getTransform有兼容问题，继续保留自定义Transform
const setTransform = (canvas: HTMLCanvasElementEx, transformOptions: TransformOptions): void => {
  const { canvasWidth, canvasHeight, renderCanvasWidth, renderCanvasHeight, offset, angle, scale, hflip, vflip } = transformOptions;
  const transform = new Transform();
  transform.reset();
  transform.translate(offset.x, offset.y);
  transform.translate(canvasWidth / 2, canvasHeight / 2);
  transform.scale(scale, scale);
  transform.rotate(angle);
  transform.scale(hflip ? -1 : 1, vflip ? -1 : 1);
  transform.translate(-renderCanvasWidth / 2, -renderCanvasHeight / 2);

  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(transform.mat[0], transform.mat[1], transform.mat[2], transform.mat[3], transform.mat[4], transform.mat[5]);
  canvas.transform = transform;
};

export { setTransform };
