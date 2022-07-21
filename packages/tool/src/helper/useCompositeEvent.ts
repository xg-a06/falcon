// import { RefObject, useEffect } from 'react';
// import { useEvent } from '@falcon/utils';

// type EventListener = (e: Event | MouseEvent) => void;

// type DomEventTarget = HTMLElement | Window | Document;

// const attachEvent=(canvas: HTMLCanvasElement)=>{
//   canvas.addEventListener('mousedown', mousedownHandler);
//   canvas.addEventListener('contextmenu', e => {
//     e.preventDefault();
//   });
// };

// const detachEvent=(canvas: HTMLCanvasElement)=>{
//   canvas.addEventListener('mousedown', mousedownHandler);
//   canvas.addEventListener('contextmenu', e => {
//     e.preventDefault();
//   });
// };

// // todo：后续在此扩展事件支持h5
// const useCompositeEvent = (target: RefObject<HTMLCanvasElement>, eventName: string, fn: EventListener) => {
//   // if(target.current?.matches('[viewport]'))
//   // target.current!.dataset.viewport = 'true';
//   useEffect(() => {
//     if(!target.current!.matches('[viewport]')){
//       target.current!.setAttribute('viewport', '');

//     }

//   }, []);
// };

// export default useCompositeEvent;
