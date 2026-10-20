const GOOGLE_FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap";
const FONT_MARKER = "fontina-google-fonts";

export function loadFontinaFontsAfterFirstPaint() {
  if (typeof document === "undefined" || document.getElementById(FONT_MARKER))
    return;
  const load = () => {
    if (document.getElementById(FONT_MARKER)) return;
    const preconnectApi = document.createElement("link");
    preconnectApi.rel = "preconnect";
    preconnectApi.href = "https://fonts.googleapis.com";
    document.head.append(preconnectApi);
    const preconnectStatic = document.createElement("link");
    preconnectStatic.rel = "preconnect";
    preconnectStatic.href = "https://fonts.gstatic.com";
    preconnectStatic.crossOrigin = "anonymous";
    document.head.append(preconnectStatic);
    const stylesheet = document.createElement("link");
    stylesheet.id = FONT_MARKER;
    stylesheet.rel = "stylesheet";
    stylesheet.href = GOOGLE_FONT_STYLESHEET;
    document.head.append(stylesheet);
  };
  const idle = (
    window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number }
      ) => number;
    }
  ).requestIdleCallback;
  if (typeof idle === "function") {
    idle(load, { timeout: 1200 });
  } else {
    setTimeout(load, 400);
  }
}
