import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figure', 'figcaption',
    'video', 'source', 'iframe', 'br', 'hr', 'span', 'div', 'section',
    'article', 'aside', 'details', 'summary', 'mark', 'time', 'del', 'ins',
    'sub', 'sup', 'small', 'thead', 'tbody', 'tfoot',
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['class', 'id', 'style', 'data-*'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    a: ['href', 'target', 'rel', 'title'],
    iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
    source: ['src', 'type'],
    video: ['controls', 'width', 'height', 'poster'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
};

export function sanitize(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}
