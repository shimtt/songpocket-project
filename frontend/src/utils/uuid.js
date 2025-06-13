export function getOrCreateUUID() {
  let uuid = localStorage.getItem('uuid');
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem('uuid', uuid);
  }
  return uuid;
}