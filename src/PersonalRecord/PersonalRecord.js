import { parseDate, parseSize } from "src/utils";
//icons
import file from "src/assets/icons/file.svg";
import email from "src/assets/icons/email.svg";
import accountArrowLeft from "src/assets/icons/accountArrowLeft.svg";
import accountArrowRight from "src/assets/icons/accountArrowRight.svg";
import weight from "src/assets/icons/weight.svg";
import calendar from "src/assets/icons/calendar.svg";
import security from "src/assets/icons/security.svg";
import barcodeScan from "src/assets/icons/barcodeScan.svg";
import { api, engineApi } from "src/boot/axios";

export const downloadReport = async (freezedData, rtl) => {
  const parsedDate = parseDate(freezedData.date);
  const obj = {
    fileName: {
      label: rtl ? "שם הקובץ" : "File name",
      value: freezedData.name,
    },
    path: { label: rtl ? "נתיב" : "Path", value: freezedData.path },
    subject: { label: rtl ? "נושא" : "Subject", value: freezedData.subject },
    recipient: { label: rtl ? "מקבל" : "To", value: freezedData.recipient },
    client: { label: rtl ? "שולח" : "From", value: freezedData.client },
    size: { label: rtl ? "גודל" : "Size", value: parseSize(freezedData.size) },
    date: {
      label: rtl ? "סונן ב" : "Processed on",
      value: parsedDate,
    },
    status: {
      label: rtl ? "סטטוס" : "Status",
      value: getStatus(freezedData.status, rtl),
    },
    id: { label: rtl ? "מס״ד" : "ID", value: freezedData.id },
    filteringSummaryLabel: rtl ? "סיכום סינון" : "Filtering Summary",
    legendLabel: rtl ? "מקרא" : "Legend",
    blockedLabel: rtl ? "קובץ נחסם" : "Blocked file",
    modifiedLabel: rtl ? "קובץ שונה" : "Modified file",
    partialLabel: rtl ? "קובץ חלקי" : "Partial file",
    intactLabel: rtl ? "קובץ מקורי" : "Intact file",
    reasonOfRejectionLabel: rtl ? "סיבה לחסימה" : "Reason of rejection",
    informationLabel: rtl ? "מידע" : "Information",
    modificationLabel: rtl ? "שינוי" : "Modification",
    locationOfFoundExpressionLabel: rtl
      ? "מיקום של ביטוי שנמצא"
      : "Location of found expression",
    report: freezedData.report,
    isRtl: rtl,
  };

  try {
    const reportRes = await api.post(
      "/engine-management/data/downloadreport",
      obj
    );

    if (reportRes.status !== 200) throw Error;

    const blob = new Blob([reportRes.data.html], { type: "text/html" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);

    link.setAttribute(
      "download",
      `Filtering Report ${parsedDate
        .replaceAll("/", ".")
        .replaceAll(":", "-")}.html`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.log("error", error);
  }
};

export const getValueArray = (obj, rtl) => {
  return [
    {
      icon: file,
      text: rtl ? "שם הקובץ" : "File name",
      value: obj.name,
      path: obj.path,
      addTooltip: true,
      class: "item-value",
    },
    {
      icon: email,
      text: rtl ? "נושא" : "Subject",
      value: obj.subject,
      addTooltip: true,
      class: "item-value",
    },
    {
      icon: accountArrowLeft,
      text: rtl ? "מקבל" : "To",
      value: obj.recipient,
      addTooltip: true,
    },
    {
      icon: accountArrowRight,
      text: rtl ? "שולח" : "From",
      value: obj.client,
      addTooltip: true,
    },
    {
      icon: weight,
      text: rtl ? "גודל" : "Size",
      value: parseSize(obj.size),
      ltr: true,
    },
    {
      icon: calendar,
      text: rtl ? "סונן ב" : "Processed on",
      isDate: true,
      ltr: true,
      value: parseDate(obj.date),
    },
    {
      icon: security,
      text: rtl ? "סטטוס" : "Status",
      value: getStatus(obj.status, rtl),
    },
    { icon: barcodeScan, text: rtl ? "מס״ד" : "ID", value: obj.id },
  ];
};
export const legendItems = [
  { textEnglish: "Rejected file", textHebrew: "קובץ נחסם", class: "blocked" },
  { textEnglish: "Modified file", textHebrew: "קובץ שונה", class: "modified" },
  { textEnglish: "Partial file", textHebrew: "קובץ חלקי", class: "partial" },
  { textEnglish: "Intact file", textHebrew: "קובץ מקורי", class: "intact" },
];

export const legendItems2 = [
  {
    textEnglish: "Reason of rejection",
    textHebrew: "סיבה לחסימה",
    class: "block-sym",
  },
  { textEnglish: "Information", textHebrew: "מידע", class: "annotation" },
  { textEnglish: "Modification", textHebrew: "שינוי", class: "event" },
  {
    textEnglish: "Location of found expression",
    textHebrew: "מיקום של ביטוי שנמצא",
    class: "match",
  },
];

export const getStatus = (status, rtl) => {
  return status & 2
    ? rtl
      ? "נחסם"
      : "Rejected"
    : status & 32
    ? rtl
      ? "חלקי"
      : "Partial"
    : status & 1
    ? rtl
      ? "שונה"
      : "Modified"
    : (rtl ? "מקורי" : "Intact") +
      (status & 4 ? ", " + (rtl ? "מוגן" : "Protected") : "");
};
