import React, { useRef, useState } from 'react';
// import { useEventListener, useUniqueId, useDebounceEffect } from '../hooks';
import { useEventListener, useDebounceEffect } from '@falcon/utils';
import { Viewport2DContainer, IFrameResizer } from './style';

const Viewport2D = () => {
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

  return (
    <Viewport2DContainer>
      <canvas ref={canvasRef} />
      <IFrameResizer ref={frameResizerRef} />
    </Viewport2DContainer>
  );
};

export default Viewport2D;
