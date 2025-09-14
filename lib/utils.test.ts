import {
  formatBytes,
  formatDate,
  formatRelativeTime,
  validateEmail,
  getFileIcon,
  getFileTypeColor,
  generateAvatar,
  truncateText,
  slugify,
} from './utils';

describe('utils', () => {
  describe('formatBytes', () => {
    it('formats bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
      expect(formatBytes(1536)).toBe('1.5 KB');
    });

    it('handles custom decimal places', () => {
      expect(formatBytes(1536, 3)).toBe('1.500 KB');
      expect(formatBytes(1536, 0)).toBe('2 KB');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const formatted = formatDate(date);
      expect(formatted).toContain('Jan 15, 2024');
    });

    it('handles string dates', () => {
      const formatted = formatDate('2024-01-15T10:30:00.000Z');
      expect(formatted).toContain('Jan 15, 2024');
    });
  });

  describe('formatRelativeTime', () => {
    const now = new Date();
    
    it('returns "just now" for recent timestamps', () => {
      const recent = new Date(now.getTime() - 30000); // 30 seconds ago
      expect(formatRelativeTime(recent)).toBe('just now');
    });

    it('returns minutes for timestamps within an hour', () => {
      const minutes = new Date(now.getTime() - 300000); // 5 minutes ago
      expect(formatRelativeTime(minutes)).toBe('5 minutes ago');
    });

    it('returns hours for timestamps within a day', () => {
      const hours = new Date(now.getTime() - 7200000); // 2 hours ago
      expect(formatRelativeTime(hours)).toBe('2 hours ago');
    });
  });

  describe('validateEmail', () => {
    it('validates correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.edu')).toBe(true);
      expect(validateEmail('student123@university.ac.uk')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('getFileIcon', () => {
    it('returns correct icons for file types', () => {
      expect(getFileIcon('pdf')).toBe('📄');
      expect(getFileIcon('docx')).toBe('📘');
      expect(getFileIcon('pptx')).toBe('📊');
      expect(getFileIcon('jpg')).toBe('🖼️');
      expect(getFileIcon('unknown')).toBe('📎');
    });

    it('handles case insensitive file types', () => {
      expect(getFileIcon('PDF')).toBe('📄');
      expect(getFileIcon('DOCX')).toBe('📘');
    });
  });

  describe('getFileTypeColor', () => {
    it('returns correct colors for file types', () => {
      expect(getFileTypeColor('pdf')).toContain('bg-red-100');
      expect(getFileTypeColor('docx')).toContain('bg-blue-100');
      expect(getFileTypeColor('pptx')).toContain('bg-orange-100');
      expect(getFileTypeColor('jpg')).toContain('bg-green-100');
      expect(getFileTypeColor('unknown')).toContain('bg-gray-100');
    });
  });

  describe('generateAvatar', () => {
    it('generates correct initials', () => {
      const avatar = generateAvatar('John Doe');
      expect(avatar.initials).toBe('JD');
      expect(avatar.size).toBe(40);
      expect(avatar.backgroundColor).toMatch(/^hsl\(\d+, 50%, 60%\)$/);
    });

    it('handles single names', () => {
      const avatar = generateAvatar('John');
      expect(avatar.initials).toBe('J');
    });

    it('handles custom size', () => {
      const avatar = generateAvatar('John Doe', 50);
      expect(avatar.size).toBe(50);
    });

    it('generates consistent colors for same name', () => {
      const avatar1 = generateAvatar('John Doe');
      const avatar2 = generateAvatar('John Doe');
      expect(avatar1.backgroundColor).toBe(avatar2.backgroundColor);
    });
  });

  describe('truncateText', () => {
    it('truncates long text', () => {
      const longText = 'This is a very long text that should be truncated';
      const truncated = truncateText(longText, 20);
      expect(truncated).toBe('This is a very long ...');
      expect(truncated.length).toBe(23); // 20 + '...'
    });

    it('returns original text if shorter than limit', () => {
      const shortText = 'Short text';
      const result = truncateText(shortText, 20);
      expect(result).toBe(shortText);
    });
  });

  describe('slugify', () => {
    it('converts text to slug format', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Test 123 File')).toBe('test-123-file');
      expect(slugify('Special!@# Characters$%^')).toBe('special-characters');
    });

    it('handles multiple spaces', () => {
      expect(slugify('Multiple   Spaces')).toBe('multiple-spaces');
    });

    it('handles empty string', () => {
      expect(slugify('')).toBe('');
    });
  });
});