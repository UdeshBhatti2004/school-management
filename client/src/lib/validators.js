export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PHONE_REGEX = /^[6-9]\d{9}$/;

export const isValidEmail = (email) => EMAIL_REGEX.test(email);

export const isValidPhone = (phone) => PHONE_REGEX.test(phone);