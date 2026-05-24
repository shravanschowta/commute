export type MetroLineId = "purple" | "green";

export interface MetroStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  line: MetroLineId;
  index: number;
  interchange?: MetroLineId[];
  linkedId?: string;
}

export interface MetroPath {
  stations: MetroStation[];
  line: MetroLineId;
  interchangeCount: number;
}
