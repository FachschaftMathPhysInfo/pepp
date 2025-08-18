export function setCookie(name: string, value: string, days: number): void {
  let expires = "";
  if (typeof document !== "undefined" && days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + value + expires + "; path=/";
  }
}

export function getCookie(name: string): string | null {
  if (typeof document !== "undefined") {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      const c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

export function deleteCookie(name: string): void {
  if (typeof document !== "undefined") {
    document.cookie = name + "=; Max-Age=-99999999;";
  }
}
