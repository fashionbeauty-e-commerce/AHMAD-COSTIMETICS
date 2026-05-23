const normalizeEmailList = (value) =>
  (value || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const getAdminEmails = () => normalizeEmailList(process.env.ADMIN_EMAILS);

export const getSuperAdminEmails = () => normalizeEmailList(process.env.SUPER_ADMIN_EMAILS);

export const isAdminEmail = (email) => {
  const normalizedEmail = email?.toLowerCase().trim();
  return normalizedEmail ? getAdminEmails().includes(normalizedEmail) : false;
};

export const isSuperAdminEmail = (email) => {
  const normalizedEmail = email?.toLowerCase().trim();
  return normalizedEmail ? getSuperAdminEmails().includes(normalizedEmail) : false;
};
