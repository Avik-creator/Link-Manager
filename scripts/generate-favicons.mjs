import sharp from 'sharp';

// Crimson red on dark background (for dark theme)
const darkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#E63946"/>
  <path d="M11.5 18.5L13.5 20.5C14.88 21.88 17.12 21.88 18.5 20.5L20.5 18.5C21.88 17.12 21.88 14.88 20.5 13.5L20 13" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20.5 13.5L18.5 11.5C17.12 10.12 14.88 10.12 13.5 11.5L11.5 13.5C10.12 14.88 10.12 17.12 11.5 18.5L12 19" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// White background version (for light theme)
const lightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#E63946"/>
  <path d="M11.5 18.5L13.5 20.5C14.88 21.88 17.12 21.88 18.5 20.5L20.5 18.5C21.88 17.12 21.88 14.88 20.5 13.5L20 13" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20.5 13.5L18.5 11.5C17.12 10.12 14.88 10.12 13.5 11.5L11.5 13.5C10.12 14.88 10.12 17.12 11.5 18.5L12 19" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Apple icon (180x180)
const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" fill="none">
  <rect width="180" height="180" rx="40" fill="#E63946"/>
  <path d="M64 104L76 116C83.7 123.7 96.3 123.7 104 116L116 104C123.7 96.3 123.7 83.7 116 76L113.2 73.2" stroke="white" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M116 76L104 64C96.3 56.3 83.7 56.3 76 64L64 76C56.3 83.7 56.3 96.3 64 104L66.8 106.8" stroke="white" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const buf = Buffer.from(darkSvg);
const lightBuf = Buffer.from(lightSvg);
const appleBuf = Buffer.from(appleSvg);

await Promise.all([
  sharp(buf).resize(32, 32).png().toFile('public/icon-dark-32x32.png'),
  sharp(lightBuf).resize(32, 32).png().toFile('public/icon-light-32x32.png'),
  sharp(buf).resize(16, 16).png().toFile('public/favicon-16x16.png'),
  sharp(appleBuf).resize(180, 180).png().toFile('public/apple-icon.png'),
  sharp(buf).resize(192, 192).png().toFile('public/icon-192x192.png'),
  sharp(buf).resize(512, 512).png().toFile('public/icon-512x512.png'),
]);

console.log('All favicons generated successfully');
