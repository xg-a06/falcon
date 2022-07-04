import '@emotion/react';
import styled from '@emotion/styled';

const Viewport2DContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const IFrameResizer = styled.iframe`
  width: 100%;
  height: 100%;
  position: absolute;
  border: 0;
`;

export { Viewport2DContainer, IFrameResizer };
