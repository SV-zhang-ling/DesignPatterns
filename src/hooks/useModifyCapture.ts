import { ElNotification } from "element-plus";
import { useCaptureStoreHook } from "@/views/patient/store/capture";
import { VueI18n } from "@/locales/i18n";

// handle modify capture
export function useModifyCapture() {
  const captureStore = useCaptureStoreHook();

  const modifyCaptureDlgVisible = ref<boolean>(false);

  const handleEditCapture = () => {
    modifyCaptureDlgVisible.value = true;
  };

  // handle confirm modify patient
  const handleModifyCaptureOK = async (comment: string, captureKey: string) => {
    modifyCaptureDlgVisible.value = false;
    const res = await captureStore.updateCapture(captureKey ?? "", comment);
    if (res) {
      ElNotification({
        type: "success",
        message: VueI18n("patient.modifyCommentSuccess"),
        customClass: "custom-notification-center"
      });
      const captureData = {
        ...captureStore.activeCaptureData,
        Comment: comment
      };
      captureStore.setCapture(captureData);
      return;
    }

    ElNotification({
      type: "error",
      message: VueI18n("patient.modifyCommentFail"),
      customClass: "custom-notification-center"
    });
  };

  // handle cancel modify patient
  const handleModifyCaptureCancel = () => {
    modifyCaptureDlgVisible.value = false;
  };

  return {
    modifyCaptureDlgVisible,
    handleEditCapture,
    handleModifyCaptureOK,
    handleModifyCaptureCancel
  };
}
