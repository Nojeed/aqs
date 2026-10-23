/** Motion tokens shared by Motion components. Keep in sync with --ease-smooth in globals.css. */
export const ease = [0.22, 1, 0.36, 1] as const;
/** Slower, softer settle used for every "rise into focus" entrance: long tail, no overshoot. */
export const easeLuxe = [0.16, 1, 0.3, 1] as const;

export const duration = {
  /** Page content entering after navigation */
  page: 0.8,
  /** Content scrolling into view */
  reveal: 0.8,
  /** Home hero entrance */
  hero: 0.8,
} as const;

/**
 * True when the element or anything inside it uses frosted glass (backdrop-filter). Browsers stop
 * blurring behind glass while an ancestor is fading or filtered, so such content only moves when it
 * enters (no fade, no blur). Reads computed styles because glass also comes from utilities like btn-ghost-light.
 */
export function containsGlass(el: Element) {
  const glass = (node: Element) => {
    const style = getComputedStyle(node) as CSSStyleDeclaration & { webkitBackdropFilter?: string };
    return (style.backdropFilter || style.webkitBackdropFilter || "none") !== "none";
  };
  return glass(el) || Array.from(el.querySelectorAll("*")).some(glass);
}

/** Starting style for the rise-into-focus entrance, set before the first paint so nothing flashes. */
export function hideForRise(el: HTMLElement, glass: boolean, distance: number) {
  el.style.transform = `translateY(${distance}px)`;
  if (!glass) {
    el.style.opacity = "0";
    el.style.filter = "blur(10px)";
  }
}

/** Keyframes for the rise-into-focus entrance (glass content just rises). */
export function riseKeyframes(glass: boolean, distance: number) {
  return glass
    ? { y: [distance, 0] }
    : { opacity: [0, 1], y: [distance, 0], filter: ["blur(10px)", "blur(0px)"] };
}

/** Remove what the entrance left behind; a leftover `filter` would also switch glass off inside. */
export function clearRise(el: HTMLElement) {
  el.style.opacity = el.style.transform = el.style.filter = "";
}

/** Clear once the entrance ends. Motion writes the final keyframe after its promise resolves, so wait a frame. */
export function clearRiseWhenDone(controls: { then: (done: () => void) => unknown }, el: HTMLElement) {
  controls.then(() => requestAnimationFrame(() => clearRise(el)));
}
