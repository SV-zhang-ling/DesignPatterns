import { WSMsgType, QueryType } from "@/enums";
import { useCaptureStoreHook } from "@/views/patient/store/capture";
import { usePatientStoreHook } from "@/views/patient/store/patient";

/**
 * auto refresh the patient and capture list
 */
const REFRESH_INTERVAL = 2 * 60 * 1000;

const sendQueryMsg = (queryParams: KeyValueType[], path: string) => {
  const message = {
    type: WSMsgType.QueryMsg,
    method: QueryType.GET,
    path,
    params: queryParams
  };

  window.wsWorker &&
    window.wsWorker.postMessage({
      action: "send",
      message: JSON.stringify(message)
    });
};

export function useRefreshList() {
  const patientStore = usePatientStoreHook();
  const captureStore = useCaptureStoreHook();

  let paListRefreshIns: NodeJS.Timeout | undefined = undefined;

  const startRefresh = () => {
    paListRefreshIns = setInterval(() => {
      const patientParams: KeyValueType[] = [];
      Object.entries(patientStore.realSearchParams).forEach(([key, value]) => {
        patientParams.push({
          key,
          value
        });
      });
      sendQueryMsg(
        patientParams,
        `${process.env.VUE_APP_VANGOGH_VERSION}/patient/list`
      );

      const captureParams: KeyValueType[] = [];
      Object.entries(captureStore.realSearchParams).forEach(([key, value]) => {
        captureParams.push({
          key,
          value
        });
      });
      captureParams.length &&
        sendQueryMsg(
          captureParams,
          `${process.env.VUE_APP_VANGOGH_VERSION}/capture/list`
        );
    }, REFRESH_INTERVAL);
  };

  const clearRefresh = () => {
    clearInterval(paListRefreshIns);
  };

  onMounted(() => {
    startRefresh();
  });

  onUnmounted(() => {
    clearRefresh();
  });
}
