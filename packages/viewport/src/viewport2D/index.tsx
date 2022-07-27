import { useRef, useState, FC, useEffect } from 'react';
import { useEventListener, useDebounceEffect, useUniqueId, getElmSize, ImageData, HTMLCanvasElementEx, TOOL_STATES, EVENT_TYPES, BUTTON_TYPES } from '@falcon/utils';
import { viewportsModel, useModel, useViewport } from '@falcon/host';
import { RenderFunction, DisplayState } from '@falcon/renderer';
import { useLengthTool, ToolOptions, dispatchEvent } from '@falcon/tool';
import { Viewport2DContainer, IFrameResizer } from './style';

interface Props {
  renderData: ImageData | undefined;
  renderFn: RenderFunction;
}

const generateDisplayState = (renderData: ImageData, elm: HTMLCanvasElementEx, initDisplayState: Partial<DisplayState>) => {
  const { width, height } = getElmSize(elm);
  const { columns, rows } = renderData;
  const scale = Math.min(width / columns, height / rows);
  let ret: DisplayState = { hflip: false, vflip: false, angle: 0, invert: false, offset: { x: 0, y: 0 }, scale, wwwc: { ww: renderData.windowWidth, wc: renderData.windowCenter } };
  ret = { ...ret, ...initDisplayState };
  return ret;
};

const wwwcToolOptions: ToolOptions = { state: TOOL_STATES.ACTIVE, button: BUTTON_TYPES.LEFT };

const Viewport2D: FC<Props> = ({ renderData, renderFn }) => {
  const [size, setSize] = useState([0, 0]);

  const frameResizerRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLCanvasElementEx>(null);
  const isInit = useRef<boolean>(false);

  const id = useUniqueId();
  const { addViewport } = useModel(viewportsModel);
  const { displayState } = useViewport(id);

  useEffect(() => {
    if (renderData && !isInit.current) {
      const initDisplayState = generateDisplayState(renderData, canvasRef.current!, {});
      addViewport({
        id,
        displayState: initDisplayState,
      });
      isInit.current = true;
    }
  }, [renderData]);

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

  useEffect(() => {
    frameResizerRef.current!.contentWindow!.dispatchEvent(new Event('resize'));
  }, []);

  useLengthTool(id, canvasRef, wwwcToolOptions);

  useEffect(() => {
    if (!displayState || !renderData) {
      return;
    }
    renderFn(renderData, { elm: canvasRef.current!, displayState });

    dispatchEvent(canvasRef.current!, EVENT_TYPES.RENDERED, { button: BUTTON_TYPES.NONE });
  }, [renderData, renderFn, displayState]);

  return (
    <Viewport2DContainer>
      <canvas ref={canvasRef} />
      <IFrameResizer ref={frameResizerRef} src="about:blank" />
    </Viewport2DContainer>
  );
};

export default Viewport2D;
