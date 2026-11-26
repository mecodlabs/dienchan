export type FaceView = 'front' | 'side';

export type FaceRegion =
  | 'forehead'
  | 'eyes'
  | 'nose'
  | 'cheeks'
  | 'mouth-chin'
  | 'ears-jaw';

export type Laterality = 'midline' | 'bilateral' | 'left' | 'right';

export interface Point2D {
  x: number;
  y: number;
}

export interface Acupoint {
  code: string;
  name: string;
  tier?: 'core' | 'standard';
  region: FaceRegion;
  regionLabel: string;
  laterality: Laterality;
  gridRef: {
    vertical: string;
    horizontal: string;
  };
  howToLocate: string;
  indications: string[];
  organReflection?: string;
  cautions?: string[];
  verificationStatus: 'core-reference' | 'user-verified';
  views: {
    front?: Point2D;
    side?: Point2D;
  };
}

export interface RenderedMarker {
  id: string;
  code: string;
  x: number;
  y: number;
  /** Anatomical side of this rendered marker (patient's perspective) */
  side: 'midline' | 'left' | 'right';
  acupoint: Acupoint;
}

export interface GridLine {
  id: string;
  label: string;
  axis: 'vertical' | 'horizontal';
  position: number;
  description: string;
  curveOffset: number;
}

export interface GridLinesDataset {
  front: GridLine[];
  side: GridLine[];
}

export interface PointCollection {
  id: string;
  name: string;
  description: string;
  pointCodes: string[];
  isBuiltin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}

export interface SearchFilter {
  query: string;
  region: FaceRegion | 'all';
}
