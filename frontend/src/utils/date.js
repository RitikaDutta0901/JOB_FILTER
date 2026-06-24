export const formatDateLong = (isoString) => {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  if (isNaN(d)) return 'N/A';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export const formatDateShort = (isoString) => {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  if (isNaN(d)) return 'N/A';
  return d.toLocaleDateString('en-US');
};

export const toInputDate = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d)) return '';
  return d.toISOString().slice(0, 10);
};

export const toInputDateTimeLocal = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d)) return '';
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0,16);
};
