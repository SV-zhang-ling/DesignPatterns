import { defineStore } from "pinia";
import { store } from "@/store";
import { ListResult, BooleanResult } from "@/api/types.d";
import { queryPatientList, updatePatientComment } from "@/api/patient";
import { SearchForm, PatientType } from "../utils/patient.d";
import { PATIENT_DATA_TYPE } from "../utils";
import { PatientSearchKeyEnum } from "@/enums";
import { getFormattedDate } from "@/utils";

interface QueryParam {
  searchBy?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  orderBy?: string;
}

export interface PatientState {
  queryParams: QueryParam;
  activeTab?: string;
  activePatient: PatientType;
  patientList: Array<PatientType>;
  realSearchParams: SearchForm;
}

export const usePatientStore = defineStore({
  id: "patient",
  state: (): PatientState => ({
    queryParams: {
      searchBy: PatientSearchKeyEnum.All,
      keyword: "",
      startDate: getFormattedDate(
        `${new Date().getFullYear() - 3}/${
          new Date().getMonth() + 1
        }/${new Date().getDate()}`
      ),
      endDate: getFormattedDate(Date.now()),
      sortBy: "",
      orderBy: ""
    },
    activeTab: "",
    activePatient: {},
    patientList: [],
    realSearchParams: {}
  }),
  getters: {
    currentTab(state) {
      return state.activeTab || PATIENT_DATA_TYPE.TODAY;
    }
  },
  actions: {
    updateQueryParams(params: QueryParam) {
      this.queryParams = {
        ...this.queryParams,
        ...params
      };
    },
    setActiveTab(tab: string) {
      this.activeTab = tab;
    },
    setPatientList(list: Array<PatientType>) {
      this.patientList = list;
    },
    setPatient(data: PatientType) {
      if (!data) {
        return;
      }
      this.activePatient = data;
    },
    async getPatientList(params: SearchForm) {
      this.realSearchParams = params;
      try {
        const res = await queryPatientList(params);
        if (!res) return;
        let { data } = <ListResult<PatientType>>res;
        if (!data) {
          data = [];
        }
        // save patient list
        const patientList = data;
        this.setPatientList(patientList);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async getPatientByID(patientID: string, local: string) {
      try {
        const res = await queryPatientList({
          searchBy: "ID",
          keyword: patientID,
          local
        });
        let { data } = <ListResult<PatientType>>res;
        if (!data) {
          data = [];
        }
        data.length && this.setPatient(data[0]);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async updatePatient(comment: string, patientID?: string) {
      try {
        const params = {
          patientID: patientID ?? this.activePatient?.ID,
          local: this.activePatient?.IP,
          comment: encodeURIComponent(comment)
        };
        const res = await updatePatientComment(params);
        const { succeed } = <BooleanResult>res;
        return succeed;
      } catch (error) {
        return Promise.reject(error);
      }
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        paths: ["queryParams", "activePatient", "activeTab"] // persist store the activePatient and activeTab
      }
    ]
  }
});

export function usePatientStoreHook() {
  return usePatientStore(store);
}
