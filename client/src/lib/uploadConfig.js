export const UPLOAD_LIMITS = {
  document: 20 * 1024 * 1024, // 20 MB
  image: 10 * 1024 * 1024, // 10 MB
  video: 50 * 1024 * 1024, // 50 MB
  archive: 25 * 1024 * 1024, // 25 MB
};

export const UPLOAD_LIMIT_LABELS = {
  document: "20 MB",
  image: "10 MB",
  video: "50 MB",
  archive: "25 MB",
};

export const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "csv",

  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",

  "zip",
  "rar",

  "mp4",
  "mov",
  "avi",
  "mkv",
];