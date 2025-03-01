import { showToast } from "@nutui/nutui";

export function showFail(tag: any, msg: any) {
  console.log("Fail at " + tag, msg);
}

export function alertFail(tag: any, msg: any) {
  console.log(tag, msg);
  showToast.fail(msg, {
    title: tag,
  });
}

export function showSuccess(tag: any, msg: any) {
  console.log("Success at " + tag, msg);
}

export function alertSuccess(tag: any, msg: any) {
  showToast.success(msg, {
    title: tag,
  });
}
