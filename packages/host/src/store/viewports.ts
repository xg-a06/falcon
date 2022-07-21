import createModel from '../helper';

interface DisplayState {
  hflip: boolean;
  vflip: boolean;
  scale: number;
  angle: number;
  invert: boolean;
  offset: { x: number; y: number };
  wwwc: { ww: number; wc: number };
}

interface DicomInfo {
  sliceThickness: number;
  spacingBetweenSlices: number;
  originSliceThickness: number;
  originSpacingBetweenSlices: number;
  orientation: Array<string>;
  orientationPatient: Array<number>;
  imagePositionPatient: Array<number>;
  columnPixelSpacing: number;
  rowPixelSpacing: number;
}

export interface Viewport {
  id: string;
  displayState: DisplayState;
  dicomInfo?: Partial<DicomInfo>;
}

interface Store {
  key: string;
  viewports: Record<string, Viewport>;
  addViewport(viewport: Partial<Viewport>): void;
  removeViewport(id: string): void;
  updateDisplayState(id: string, displayState: Partial<DisplayState>): void;
  updateDicomInfo(id: string, dicomInfo: Partial<DicomInfo>): void;
}

const viewportsModel = createModel<Store>({
  key: 'viewports',
  viewports: {},
  addViewport(viewport) {
    const { id, displayState = {} } = viewport;
    const v = {
      id,
      displayState,
    };
    this.viewports[id!] = v as Viewport;
  },
  removeViewport(id) {
    delete this.viewports[id];
  },
  updateDisplayState(id, displayState) {
    this.viewports[id].displayState = Object.assign(this.viewports[id].displayState, displayState);
  },
  updateDicomInfo(id, dicomInfo) {
    this.viewports[id].dicomInfo = Object.assign(this.viewports[id].dicomInfo || {}, dicomInfo);
  },
});

export { viewportsModel };
