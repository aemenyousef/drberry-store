export type ClientErrorKind =
  | "render"
  | "chunk"
  | "network"
  | "api"
  | "auth"
  | "checkout"
  | "asset"
  | "unknown";

export type UserSafeErrorPresentation = {
  title: string;
  description: string;
  retryLabel: string;
};

const recentlyReported = new Map<
  string,
  { referenceId: string; timestamp: number }
>();
const DEDUPE_WINDOW_MS = 30_000;

function createReferenceId() {
  const values = new Uint32Array(1);
  globalThis.crypto?.getRandomValues?.(values);
  const entropy =
    values[0]?.toString(36).toUpperCase() ||
    Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FN-${entropy.slice(0, 8).padEnd(6, "0")}`;
}

export function classifyClientError(
  error: unknown,
  preferredKind: ClientErrorKind = "unknown"
): ClientErrorKind {
  if (preferredKind !== "unknown") return preferredKind;
  if (typeof navigator !== "undefined" && !navigator.onLine) return "network";
  const text =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : String(error || "");
  if (
    /dynamically imported module|loading chunk|importing a module script|chunkloaderror/i.test(
      text
    )
  )
    return "chunk";
  if (/failed to fetch|networkerror|network request failed/i.test(text))
    return "network";
  return "render";
}

export function userSafeErrorPresentation(
  kind: ClientErrorKind
): UserSafeErrorPresentation {
  if (kind === "network" || kind === "chunk") {
    return {
      title: "تعذر تحميل الصفحة",
      description: "تأكدي من اتصال الإنترنت ثم أعيدي المحاولة.",
      retryLabel: "إعادة المحاولة",
    };
  }
  if (kind === "auth") {
    return {
      title: "تعذر التحقق من الجلسة",
      description:
        "أعيدي تحميل الصفحة، ثم سجّلي الدخول مجدداً إذا استمرت المشكلة.",
      retryLabel: "إعادة التحميل",
    };
  }
  if (kind === "checkout") {
    return {
      title: "تعذر متابعة الطلب",
      description:
        "لم يتم تأكيد طلب جديد من هذه الصفحة. أعيدي المحاولة بعد قليل.",
      retryLabel: "إعادة المحاولة",
    };
  }
  return {
    title: "تعذر إكمال العملية",
    description:
      "حاولي مرة أخرى بعد قليل. إذا استمرت المشكلة، أرسلي رمز المساعدة لفريق المتجر.",
    retryLabel: "إعادة المحاولة",
  };
}

export function errorReferenceFromApiError(error: unknown) {
  if (!error || typeof error !== "object") return undefined;
  const data = (error as { data?: unknown }).data;
  if (!data || typeof data !== "object") return undefined;
  const reference = (data as { errorReference?: unknown }).errorReference;
  return typeof reference === "string" && /^FN-[A-Z0-9]{6,12}$/.test(reference)
    ? reference
    : undefined;
}

function currentRoute() {
  if (typeof window === "undefined") return "/";
  return window.location.pathname.slice(0, 180) || "/";
}

function reportReference(
  kind: ClientErrorKind,
  route: string,
  preferredReference?: string
) {
  const now = Date.now();
  const signature = `${kind}:${route}`;
  const previous = recentlyReported.get(signature);
  recentlyReported.forEach((entry, key) => {
    if (now - entry.timestamp > DEDUPE_WINDOW_MS) recentlyReported.delete(key);
  });
  if (previous && now - previous.timestamp <= DEDUPE_WINDOW_MS)
    return { referenceId: previous.referenceId, shouldSend: false };
  const referenceId = preferredReference || createReferenceId();
  recentlyReported.set(signature, { referenceId, timestamp: now });
  return { referenceId, shouldSend: true };
}

export function reportClientError(
  error: unknown,
  preferredKind: ClientErrorKind = "unknown",
  preferredReference?: string
) {
  const kind = classifyClientError(error, preferredKind);
  const route = currentRoute();
  const { referenceId, shouldSend } = reportReference(
    kind,
    route,
    preferredReference
  );
  if (typeof window === "undefined" || !shouldSend)
    return { referenceId, kind };
  const payload = JSON.stringify({ referenceId, kind, route });
  void fetch("/api/observability/client-error", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
  return { referenceId, kind };
}

export function registerGlobalErrorReporting() {
  if (typeof window === "undefined") return () => undefined;
  const onError = (event: ErrorEvent) => {
    reportClientError(event.error || event.message);
  };
  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    reportClientError(event.reason);
  };
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);
  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
  };
}
