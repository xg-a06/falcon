import '@emotion/react';
import styled from '@emotion/styled';

const Viewport2DContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  box-sizing: border-box;
`;

const IFrameResizer = styled.iframe`
  width: 100%;
  height: 100%;
  position: absolute;
  border: 0;
  left: 0;
  top: 0;
  z-index: -1;
`;

export { Viewport2DContainer, IFrameResizer };
