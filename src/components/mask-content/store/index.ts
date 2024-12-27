import { defineStore } from "pinia";
import { store } from "@/store";

export interface ActionState {
  process: number;
  width: string;
  isAllSaveImages: boolean;
}
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export const useMaskContentStore = defineStore({
  id: "maskcontent",
  state: (): ActionState => ({
    process: 0,
    width: "0px",
    isAllSaveImages: false
  }),
  actions: {
    startProcess() {
      this.process = 0;
      this.width = "0px";

      if (window.isAllSaveImages) {
        const int: NodeJS.Timeout = setInterval(() => {
          if (this.process <= 90) {
            this.process = this.process + getRandomInt(5, 9);
            this.width = (this.process / 100) * 390 + "px";
          }
          if (window.isAllSaveImages === false) {
            this.process = 100;
            this.width = "390px";
            clearInterval(int);
          }
        }, 1000);
      }
    }
  }
});

export function useMaskContentStoreHook() {
  return useMaskContentStore(store);
}
