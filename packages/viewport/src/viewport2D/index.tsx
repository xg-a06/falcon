import React, { useRef, useState, FC, useEffect } from 'react';
import { useEventListener, useDebounceEffect } from '@falcon/utils';
import { ImageData } from '@falcon/resource';
import { RenderFunction } from '@falcon/renderer';
import { Viewport2DContainer, IFrameResizer } from './style';

interface Props {
  renderData: ImageData | undefined;
  renderFn: RenderFunction;
}

const Viewport2D: FC<Props> = ({ renderData, renderFn }) => {
  const [displayState] = useState({ wwwc: { ww: 800, wc: 300 } });
  const [size, setSize] = useState([0, 0]);

  // const id = useUniqueId();
  const frameResizerRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useDebounceEffect(() => {
    const [width, height] = size;
    canvasRef.current!.width = width;
    canvasRef.current!.height = height;
  }, [size]);

  useEventListener(
    () => frameResizerRef.current!.contentWindow!,
    'resize',
    e => {
      const {
        document: { documentElement },
      } = e.currentTarget as Window;
      const { offsetWidth, offsetHeight } = documentElement;
      setSize([offsetWidth, offsetHeight]);
    },
  );

  useEventListener(
    () => frameResizerRef.current!.contentWindow!.document,
    'readystatechange',
    e => {
      const { documentElement } = e.currentTarget as Document;
      const { offsetWidth, offsetHeight } = documentElement;
      setSize([offsetWidth, offsetHeight]);
    },
  );

  useEffect(() => {
    renderFn(renderData, { elm: canvasRef.current!, displayState });
  }, [renderData, renderFn, displayState]);

  return (
    <Viewport2DContainer>
      <canvas ref={canvasRef} />
      <IFrameResizer ref={frameResizerRef} />
    </Viewport2DContainer>
  );
};

export default Viewport2D;
