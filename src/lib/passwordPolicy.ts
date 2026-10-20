export const PASSWORD_POLICY_MESSAGE =
  "استخدمي 10 أحرف على الأقل مع حرف واحد ورقم واحد.";

export function passwordMeetsPolicy(password: string) {
  return (
    password.length >= 10 &&
    /[A-Za-z\u00C0-\u024F\u0600-\u06FF]/.test(password) &&
    /[\d\u0660-\u0669]/.test(password)
  );
}
