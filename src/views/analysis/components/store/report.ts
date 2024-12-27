import { defineStore } from "pinia";
import { store } from "@/store";

export interface ReportState {
  reportDlgVisible: boolean;
  reportContentUrl: string;
  reportOption: string;
  reportTemplate: string;
  reportComment: string;
}

export const useReportPrintStore = defineStore({
  id: "reportPrint",
  state: (): ReportState => ({
    reportDlgVisible: false,
    reportContentUrl: "",
    reportOption: "horizontal",
    reportTemplate: "default",
    reportComment: ""
  }),
  actions: {
    setReportContentUrl(url: string) {
      this.reportContentUrl = url;
    }
  }
});

export function useReportPrintStoreHook() {
  return useReportPrintStore(store);
}
