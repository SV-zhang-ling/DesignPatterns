// record type
export interface RecordType {
  value: string;
  labelKey: string;
}

// search patient form type
export interface SearchForm {
  searchBy?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  orderBy?: string;
  patientID?: string;
  local?: string;
  captureID?: string;
}

// table column type
export interface ColumnType {
  key?: string;
  dataKey?: string;
  titleKey?: string;
  width?: number;
}

// patient record type
export interface PatientType {
  ID?: string;
  IP?: string;
  LastVisit?: string;
  Name?: string;
  Gender?: string;
  DateofBirth?: string;
  Ethnicity?: string;
  Comment?: string;
  Physician?: string;
  ocupied?: boolean;
}

// capture record list
export interface CaptureType {
  captureKey?: string;
  Operator?: string;
  Length?: string;
  Depth?: string;
  ID?: string;
  Time?: string;
  Oculus?: string;
  Protocol?: string;
  SSI?: string;
  Follow?: string;
  Ref?: string;
  // exclude?: string;
  SW?: string;
  children?: Array<CaptureType>;
  Comment?: string;
  IP?: string;
  date?: string;
  hhmmss?: string;
  patientID?: string;
}

export interface SLOEnfaceInfoType {
  width: number;
  height: number;
  spacingX: number;
  spacingY: number;
  transform: number[];
  selected: number;
  rotate: number;
}

export interface SLOInfoType {
  src: string;
  // width: number;
  // height: number;
  transform: number[];
}
