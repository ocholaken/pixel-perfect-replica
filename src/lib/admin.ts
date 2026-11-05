export const ADMIN_EMAILS = [
  "samuleumtiti12@gmail.com",
  "ocholakenna1@gmail.com",
];

export const isAdmin = (email?: string | null): boolean =>
  Boolean(email && ADMIN_EMAILS.includes(email.toLowerCase().trim()));

export const isAdminEmail = isAdmin;
