import { MdToHtml } from '../index';

describe('MdToHtml', () => {
    let parser: MdToHtml;

    beforeEach(() => {
        parser = new MdToHtml();
    });
    // test for plain text/ paragraph
    test('should parse plain text correctly', () => {
        parser.append('Hello, World!');
        const html = parser.getHtml(parser.lines);
        expect(html).toBe('<p>Hello, World!</p>');
    });

    // test for headings
    test('should convert Markdown headings to HTML', () => {
        parser.append('# Heading 1');
        parser.append('## Heading 2');
        parser.append('### Heading 3');

        const html = parser.getHtml(parser.lines);
        expect(html).toContain('<h1>Heading 1</h1>');
        expect(html).toContain('<h2>Heading 2</h2>');
        expect(html).toContain('<h3>Heading 3</h3>');
    });

    // test for bold and italic
    test('should convert bold and italic text', () => {
        parser.append('**bold** and *italic* text');

        const html = parser.getHtml(parser.lines);
        expect(html).toContain('<strong>bold</strong>');
        expect(html).toContain('<em>italic</em>');
    });

    // test for inline code
    test('should convert inline code', () => {
        parser.append('This is `inline code` inside text.');
        const html = parser.getHtml(parser.lines);
        expect(html).toContain('<code>inline code</code>');
    });

    // test for code blocks with languages
    test('should convert code blocks with languages', () => {
        parser.append('```javascript\nconsole.log("Hello");\n```');

        const html = parser.getHtml(parser.lines);
        expect(html).toContain('<pre><code class=\"language-javascript\">\nconsole<span class=\"token punctuation\">.</span><span class=\"token function\">log</span><span class=\"token punctuation\">(</span><span class=\"token string\">\"Hello\"</span><span class=\"token punctuation\">)</span><span class=\"token punctuation\">;</span>\n</code></pre>');
    });

    // test for unordered lists
    test('should convert unordered lists', () => {
        parser.append('- Item 1\n- Item 2\n- Item 3');

        const html = parser.getHtml(parser.lines);
        expect(html).toContain('<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>');
    });

    // test for ordered lists
    test('should convert ordered lists', () => {
        parser.append('1. First\n2. Second\n3. Third');

        const html = parser.getHtml(parser.lines);
        expect(html).toContain('<ol><li>First</li><li>Second</li><li>Third</li></ol>');
    });

    // test for task lists
    test('should convert task lists', () => {
        parser.append('- [ ] Task 1\n- [x] Task 2\n- [ ] Task 3');

        const html = parser.getHtml(parser.lines);
        expect(html).toContain('<li><input type=\"checkbox\">Task 1</li>');
        expect(html).toContain('<li><input type=\"checkbox\" checked>Task 2</li>');
        expect(html).toContain('<li><input type=\"checkbox\">Task 3</li>');
    });

    // test for multiple lines and paragraphs
    test('should handle multiple lines and paragraphs', () => {
        parser.append('Hello\n\nWorld');
        const html = parser.getHtml(parser.lines);
        expect(html).toBe('<p>Hello</p><p>World</p>');
    });

});
