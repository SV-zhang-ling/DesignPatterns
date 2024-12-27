import { RecordType, ColumnType } from "./patient.d";
import { PatientSearchKeyEnum } from "@/enums";

export enum PATIENT_DATA_TYPE {
  TODAY = "today",
  ALL = "all",
  SEARCH = "search"
}

export enum CAPTURE_DATA_TYPE {
  LIST = "list",
  THUMBNAIL = "thumbnail"
}

export const PATIENT_DATA_TYPE_LIST: Array<RecordType> = [
  {
    value: "today",
    labelKey: "patient.today"
  },
  {
    value: "all",
    labelKey: "patient.all"
  },
  {
    value: "search",
    labelKey: "patient.search"
  }
];

export const PATIENT_COLS: Array<ColumnType> = [
  {
    key: "LastVisit",
    dataKey: "LastVisit",
    titleKey: "lastVisit",
    width: 180
  },
  {
    key: "Name",
    dataKey: "Name",
    titleKey: "name",
    width: 180
  },
  {
    key: "Gender",
    dataKey: "Gender",
    titleKey: "gender",
    width: 105
  },
  {
    key: "DateofBirth",
    dataKey: "DateofBirth",
    titleKey: "birth",
    width: 130
  },
  // {
  //   key: "Ethnicity",
  //   dataKey: "Ethnicity",
  //   titleKey: "ethnicity",
  //   width: 180
  // },
  {
    key: "ID",
    dataKey: "ID",
    titleKey: "id",
    width: 150
  },
  {
    key: "Comment",
    dataKey: "Comment",
    titleKey: "comment",
    width: 180
  },
  {
    key: "Physician",
    dataKey: "Physician",
    titleKey: "physician",
    width: 180
  }
];

export const CAPTURE_COLS: Array<ColumnType> = [
  {
    key: "Time",
    dataKey: "Time",
    titleKey: "examDatetime",
    width: 190
  },
  {
    key: "Oculus",
    dataKey: "Oculus",
    titleKey: "oculus",
    width: 150
  },
  {
    key: "Protocol",
    dataKey: "Protocol",
    titleKey: "protocol",
    width: 240
  },
  {
    key: "SSI",
    dataKey: "SSI",
    titleKey: "ssi",
    width: 130
  },
  {
    key: "Comment",
    dataKey: "Comment",
    titleKey: "comment",
    width: 180
  },
  {
    key: "SW",
    dataKey: "SW",
    titleKey: "softwareVersion",
    width: 120
  },
  {
    key: "Follow",
    dataKey: "Follow",
    titleKey: "follow",
    width: 100
  },
  {
    key: "Ref",
    dataKey: "Ref",
    titleKey: "ref",
    width: 85
  },
  {
    key: "Exclude",
    dataKey: "Exclude",
    titleKey: "exclude",
    width: 110
  }
];

// search by fields
export const SEARCH_BY_LIST = [
  {
    labelKey: "patient.all",
    value: PatientSearchKeyEnum.All
  },
  {
    labelKey: "patient.name",
    value: PatientSearchKeyEnum.Name
  },
  {
    labelKey: "patient.lastVisit",
    value: PatientSearchKeyEnum.LastVisitTime
  },
  {
    labelKey: "patient.birth",
    value: PatientSearchKeyEnum.DateOfBirth
  },
  {
    labelKey: "patient.id",
    value: PatientSearchKeyEnum.ID
  },
  {
    labelKey: "patient.operator",
    value: PatientSearchKeyEnum.Operator
  },
  {
    labelKey: "patient.physician",
    value: PatientSearchKeyEnum.Physician
  },
  {
    labelKey: "patient.comment",
    value: PatientSearchKeyEnum.Comment
  },
  {
    labelKey: "patient.protocol",
    value: PatientSearchKeyEnum.Protocol
  }
];
