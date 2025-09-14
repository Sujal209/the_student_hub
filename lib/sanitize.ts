// Input sanitization utilities
export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .trim();
};

export const sanitizeSearchQuery = (query: string): string => {
  return query
    .replace(/[<>'"&]/g, '') // Remove HTML/XSS characters
    .replace(/[;()]/g, '') // Remove SQL injection characters
    .trim()
    .substring(0, 100); // Limit length
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};