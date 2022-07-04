import React, { useRef } from 'react';
import useEventLister from '../hooks/useEventLister';
import { Viewport2DContainer, IFrameResizer } from './style';

const Viewport2D = () => {
  const frameResizerRef = useRef<HTMLIFrameElement>(null);

  useEventLister(frameResizerRef.current?.contentWindow, 'resize', e => {
    const window = e.currentTarget as Window;
    const { offsetWidth, offsetHeight } = window.document.documentElement;
    console.log(offsetWidth, offsetHeight);
  });

  return (
    <Viewport2DContainer>
      <IFrameResizer ref={frameResizerRef} />
      <canvas />
    </Viewport2DContainer>
  );
};

export default Viewport2D;
