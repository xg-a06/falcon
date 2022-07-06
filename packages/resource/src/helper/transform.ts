import { mat2d, vec2 } from 'gl-matrix';

type Point2D = {
  x: number;
  y: number;
};

class Transform {
  mat: mat2d = mat2d.create();

  reset(): void {
    this.mat = mat2d.create();
  }

  clone(): mat2d {
    return mat2d.clone(this.mat);
  }

  translate(tx: number, ty: number): void {
    const { mat } = this;
    mat2d.translate(mat, mat, [tx, ty]);
  }

  scale(sx: number, sy: number): void {
    const { mat } = this;
    mat2d.scale(mat, mat, [sx, sy]);
  }

  rotate(angle: number): void {
    const { mat } = this;
    mat2d.rotate(mat, mat, angle);
  }

  transformPoint(ox: number, oy: number): Point2D {
    const { mat } = this;
    const vec = vec2.create();
    vec2.transformMat2d(vec, [ox, oy], mat);

    return {
      x: vec[0],
      y: vec[1],
    };
  }

  invertPoint(cx: number, cy: number): Point2D {
    const { mat } = this;
    const invMat = mat2d.invert(mat2d.create(), mat);
    const vec = vec2.create();
    vec2.transformMat2d(vec, [cx, cy], invMat);

    return {
      x: vec[0],
      y: vec[1],
    };
  }
}

export default Transform;
