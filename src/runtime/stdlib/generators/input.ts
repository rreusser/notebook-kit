import {observe} from "./observe.js";

export function input(element: Element) {
  return observe<ReturnType<typeof valueof>>((change) => {
    const event = eventof(element);
    const value = valueof(element);
    const inputted = () => change(valueof(element));
    element.addEventListener(event, inputted);
    if (value !== undefined) change(value);
    return () => element.removeEventListener(event, inputted);
  });
}

function valueof(element: Element) {
  const input = element as HTMLInputElement;
  const select = element as HTMLSelectElement;
  if ("type" in element) {
    switch (element.type) {
      case "range":
      case "number":
        return input.valueAsNumber;
      case "date":
        return input.valueAsDate;
      case "checkbox":
        return input.checked;
      case "file":
        return input.multiple ? input.files : input.files![0];
      case "select-multiple":
        return Array.from(select.selectedOptions, (o) => o.value);
    }
  }
  return input.value;
}

function eventof(element: Element) {
  if ("type" in element) {
    switch (element.type) {
      case "button":
      case "submit":
      case "checkbox":
        return "click";
      case "file":
        return "change";
    }
  }
  return "input";
}
