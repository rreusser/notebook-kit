import {inspect, inspectError, getExpanded} from "./inspect.js";

export type DisplayState = {
  root: HTMLDivElement;
  expanded: (number[][] | undefined)[];
};

export function display(state: DisplayState, value: unknown): void {
  const {root, expanded} = state;
  const node = isDisplayable(value, root) ? value : inspect(value, expanded[root.childNodes.length]); // prettier-ignore
  displayNode(state, node);
}

function displayNode(state: DisplayState, node: Node): void {
  if (node.nodeType === 11) {
    let child;
    while ((child = node.firstChild)) {
      state.root.appendChild(child);
    }
  } else {
    state.root.appendChild(node);
  }
}

function displayError(state: DisplayState, value: unknown): void {
  displayNode(state, inspectError(value));
}

// Note: Element.prototype is instanceof Node, but cannot be inserted! This
// excludes DocumentFragment since appending a fragment “dissolves” (mutates)
// the fragment, and we wish for the inspector to not have side-effects.
function isDisplayable(value: unknown, root: HTMLDivElement): value is Node {
  return (
    (value instanceof Element || value instanceof Text) &&
    value instanceof value.constructor &&
    (!value.parentNode || root.contains(value))
  );
}

export function clear(state: DisplayState): void {
  state.expanded = Array.from(state.root.childNodes, getExpanded);
  while (state.root.lastChild) state.root.lastChild.remove();
}

export function observe(state: DisplayState, _id: number, autodisplay?: boolean) {
  return {
    _error: false,
    _node: state.root, // _node for visibility promise
    pending() {
      if (this._error) {
        this._error = false;
        clear(state);
      }
    },
    fulfilled(value: unknown) {
      if (autodisplay) {
        clear(state);
        display(state, value);
      }
    },
    rejected(error: unknown) {
      console.error(error);
      this._error = true;
      clear(state);
      displayError(state, error);
    }
  };
}
