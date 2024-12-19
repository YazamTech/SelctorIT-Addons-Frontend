import Swal from "sweetalert2";

// Regular alert with okay
export function swal(data) {
  Swal.fire({
    title: data.title,
    text: data.text,
    icon: data.icon ? data.icon : undefined,
    confirmButtonText: "Close",
    customClass: {
      actions: "error-alert-actions-wrapper",
      htmlContainer: data.htmlContainerClass ? data.htmlContainerClass : "",
    },
  });
}

// Only okay alert of error
export function errorAlert(text) {
  //maybe copy this and make another function for that
  let nText = text;

  //exeptions
  if (text === "Wrong or no authentication provided.") return;
  if (typeof text === "object" && text?.errorCode === "user_cancelled") return;
  if (
    typeof text === "object" &&
    text?.message === "Request failed with status code 401"
  )
    nText = "Username or password is incorrect";

  //regular
  Swal.fire({
    title: "Error",
    text: nText,
    icon: "warning",
    confirmButtonText: "Close",
    customClass: {
      actions: "error-alert-actions-wrapper",
    },
  });
}

// Okay or cancel alert
export async function confirmAlert(data, resolve) {
  return Swal.fire({
    title: data.title,
    text: data.text,
    icon: data.icon ? data.icon : undefined,
    showCancelButton:
      data.showCancelButton === undefined ? true : data.showCancelButton,
    confirmButtonText: data.confirmButtonText,
    cancelButtonText: data.cancelButtonText,
    allowOutsideClick: false,
    customClass: {
      actions: "confirm-alert-actions-wrapper",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      data.confirmedFunc();
    } else if (result.isDismissed) {
      data.deniedFunc();
    }
    if (resolve) resolve();
  });
}
