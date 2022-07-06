/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';
import { useEventLister, useUniqueId, useDebounceEffect } from '../hooks';
import { Viewport2DContainer, IFrameResizer } from './style';

const Viewport2D = () => {
  const [size, setSize] = useState([0, 0]);

  const id = useUniqueId();
  const frameResizerRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useDebounceEffect(() => {
    const [width, height] = size;
    canvasRef.current!.width = width;
    canvasRef.current!.height = height;
  }, [size]);

  useEventLister(frameResizerRef, 'resize', e => {
    const window = e.currentTarget as Window;
    const { offsetWidth, offsetHeight } = window.document.documentElement;
    setSize([offsetWidth, offsetHeight]);
  });

  return (
    <Viewport2DContainer>
      <canvas ref={canvasRef} />
      <IFrameResizer ref={frameResizerRef} />
    </Viewport2DContainer>
  );
};

export default Viewport2D;
