const authEventTarget = new EventTarget();

export const dispatchLogoutEvent = () => {
  authEventTarget.dispatchEvent(new Event('app:logout'));
};

export const onLogoutEvent = (handler) => {
  authEventTarget.addEventListener('app:logout', handler);
  return () => authEventTarget.removeEventListener('app:logout', handler);
};
