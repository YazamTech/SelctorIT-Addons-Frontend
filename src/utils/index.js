export function isEmptyObject(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

export const parseSize = (numOfBytes) => {
  if (numOfBytes == null) {
    return "0 B";
  }

  if (numOfBytes < 1024) {
    return `${numOfBytes} B`;
  } else if (numOfBytes < 1024 ** 2) {
    return `${(numOfBytes / 1024).toFixed(1)} KB`;
  } else if (numOfBytes < 1024 ** 3) {
    return `${(numOfBytes / 1024 ** 2).toFixed(1)} MB`;
  } else {
    return `${(numOfBytes / 1024 ** 3).toFixed(1)} GB`;
  }
};

export const parseDate = (dateInMs) => {
  const today = new Date(dateInMs * 1000);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const hours = String(today.getHours()).padStart(2, "0");
  const minutes = String(today.getMinutes()).padStart(2, "0");
  const seconds = String(today.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const sortByKey = (arr, key) => {
  arr.sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];
    if (!valueA || !valueB) return -1;
    return compareStrings(valueA, valueB);
  });
};

export const compareStrings = (a, b) => {
  return a.toLowerCase().localeCompare(b.toLowerCase());
};
