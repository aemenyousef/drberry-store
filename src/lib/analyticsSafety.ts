export function safelyInvokeAnalytics(callback: () => void) {
  try {
    callback();
    return true;
  } catch {
    return false;
  }
}
