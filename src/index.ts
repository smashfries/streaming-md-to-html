import { Node } from './node';
import Prism from 'prismjs'
import loadLanguages from 'prismjs/components/index.js'

loadLanguages(['python'])


export class MdToHtml {
    md: string;
    lines: Node[] = [];
    currentNode: Node | null = null;
    isLineEmpty: boolean = true;
    lastListNode: Node | null = null; // Track last list node

    constructor() {
        this.md = '';

        const paragraphNode = new Node('paragraph', null, []);
        const textNode = new Node('text', '', []);

        paragraphNode.appendChild(textNode);

        this.lines.push(paragraphNode);
        this.currentNode = textNode;
    }

    append(md: string): { lastLineUpdated?: Node, newLines?: Node[] }  {
        console.log('md', md)
        this.md += md;

        const lineCount = this.lines.length;

        if (!this.currentNode) {
            return {
            };
        }

        for (let i = 0; i < md.length; i++) {
            const char = md[i];
            if (char === '\n' && this.currentNode.parent?.type !== 'code') {
                if (this.isLineEmpty) continue; // Prevent extra empty paragraphs
                const paragraphNode = new Node('paragraph', null, []);
                const textNode = new Node('text', '', []);

                paragraphNode.appendChild(textNode);
                this.lines.push(paragraphNode);

                this.currentNode = textNode;
                this.isLineEmpty = true;
                continue;
            }

            this.isLineEmpty = false;
            if (!this.currentNode) continue;

            this.currentNode.appendValue(char);

            // if (this.currentNode.parent?.type === 'code' && !this.currentNode.parent?.metaData && this.currentNode.value?.endsWith('\n')) {
            //     this.currentNode.parent.metaData = {
            //         language: this.currentNode.value.slice(0, -1),
            //     }
            //     console.log('language', this.currentNode.parent?.metaData?.language)
            //     this.currentNode.value = '';
            //     continue;
            // }

            // Detect headings (h1 - h6)
            const headingMatch = md.slice(i).match(/^(#{1,6})\s+(.*)/);
            if (headingMatch) {
                const level = headingMatch[1].length;
                const headingText = headingMatch[2].trim();

                i += headingMatch[0].length - 1; // Move cursor to end of heading line

                // Ensure the previous paragraph is removed if it's empty
                if (this.currentNode.parent?.type === 'paragraph' && this.currentNode.value?.trim() === '') {
                    this.lines.pop();
                }
                //@ts-expect-error
                const headingNode = new Node(`h${level}`, null, []);

                // Ensure no # remain in the heading text
                if(this.currentNode.value) {
                    this.currentNode.value = this.currentNode.value.replace(/#/g, '');
                }
                const textNode = new Node('text', headingText, []);
                headingNode.appendChild(textNode);
                this.lines.push(headingNode);

                this.currentNode = textNode;
                continue;
            }

            // Detect Ordered, Unordered, and Task Lists
            const listMatch = md.slice(i).match(/^(\s*)([-+]|\d+\.)\s+(?:\[(x| )\]\s+)?(.*)/);
            if (listMatch) {
                const indentation = listMatch[1].length;
                const listType = /^\d+\./.test(listMatch[2]) ? 'ol' : 'ul';
                const isTask = listMatch[3] !== undefined;
                const isChecked = listMatch[3] === 'x';

                // Extract list text BEFORE modifying `currentNode.value`
                let listItemText = listMatch[4].trim();

                i += listMatch[0].length - 1; // Move cursor to end of the list item

                if (this.currentNode.parent?.type === 'paragraph') {
                    this.lines.pop(); // Remove last paragraph to avoid unnecessary <p> around lists
                }

                // Find or create the parent list
                if (!this.lastListNode || this.lastListNode.type !== listType) {
                    this.lastListNode = new Node(listType, null, []);
                    this.lines.push(this.lastListNode);
                }

                // Create list item
                const listItem = new Node('li', null, []);
                if (isTask) {
                    const checkbox = new Node('checkbox', isChecked ? 'checked' : '', []);
                    listItem.appendChild(checkbox);
                }

                // Ensure list item text is properly added with NO trailing characters
                const newTextNode = new Node('text', listItemText, []);
                listItem.appendChild(newTextNode);
                this.lastListNode.appendChild(listItem);

                this.currentNode = newTextNode;
                continue;
            }

            // Detect opening code block with possible language
            if (char === '`' && md.slice(i, i + 3) === '```' && this.currentNode.parent?.type === 'paragraph') {
                i += 2; // Move past ```
                
                // Look ahead for language
                const restOfMd = md.slice(i + 1);
                const match = restOfMd.match(/^([\w+-]+)/);
                const language = match ? match[1].trim() : null;

                console.log('Extracted Language:', language);

                // Move past language identifier if present
                if (language) {
                    i += language.length;
                }

                const codeNode = new Node('code', null, []);
                codeNode.metaData = { language };

                // Ensure no stray backtick remain inside the code block
                if (this.currentNode.value) {
                    this.currentNode.value = this.currentNode.value.replace(/`$/, '').trim();
                }

                const textNode = new Node('text', '', []);
                codeNode.appendChild(textNode);
                this.lines.push(codeNode);

                this.currentNode = textNode;
                continue;
            }

            // Detect inline code ex- (`{a+b}`)
            if (char === '`' && md[i + 1] !== '`' && this.currentNode.parent?.type !== 'code') { 
                let j = i + 1;
                while (j < md.length && md[j] !== '`') {
                    j++;
                }

                if (j < md.length) { // Closing backtick found
                    const inlineCodeText = md.slice(i + 1, j).trim();
                    i = j; // Move past closing backtick

                    console.log('Extracted Inline Code:', inlineCodeText);

                    const codeNode = new Node('code-inline', null, []);
                    const textNode = new Node('text', inlineCodeText, []);

                    // Ensure no stray backtick remain inside the code block
                    if (this.currentNode.value) {
                        this.currentNode.value = this.currentNode.value.replace(/`$/, '').trim();
                    }

                    codeNode.appendChild(textNode);
                    this.currentNode.parent?.appendChild(codeNode);

                    const newTextNode = new Node('text', '', []);
                    this.currentNode.parent?.appendChild(newTextNode);
                    this.currentNode = newTextNode;

                    continue;
                }
            }

            if (this.currentNode.value?.endsWith('```')) {
                this.currentNode.value = this.currentNode.value?.replace(/```$/, '');
                console.log('language', this.currentNode.parent?.metaData?.language)
                this.currentNode.value = Prism.highlight(this.currentNode.value || '', Prism.languages[this.currentNode.parent?.metaData?.language || 'plaintext'], this.currentNode.parent?.metaData?.language || 'plaintext');

                const paragraphNode = new Node('paragraph', null, []);
                const textNode = new Node('text', '', []);

                paragraphNode.appendChild(textNode);
                this.lines.push(paragraphNode);

                this.currentNode = textNode;
                continue;
            }

            const strongMatch = this.currentNode.value?.match(/(\*\*|__)(.+)(\1)/);
            if (strongMatch) {
                const text = strongMatch[2] as string;
                console.log('strongMatch', text)
                this.currentNode.value = this.currentNode.value?.replace(/(\*\*|__)(.+)(\1)/, '') || '';

                const parentNode = this.currentNode.parent;
                const strongNode = new Node('strong', null, []);
                const textNode = new Node('text', text, []);

                strongNode.appendChild(textNode);
                parentNode?.appendChild(strongNode);

                const newTextNode = new Node('text', '', []);

                parentNode?.appendChild(newTextNode);

                this.currentNode = newTextNode;
                continue;
            }

            const emMatch = this.currentNode.value?.match(/^(?:[^*_]*)(\*|_)([^*_]+)(\1)$/);
            if (emMatch) {
                const text = emMatch[2] as string;
                console.log('emMatch', text)
                this.currentNode.value = this.currentNode.value?.replace(/(\*|_)([^*_]+)(\1)/, '') || '';

                const parentNode = this.currentNode.parent;
                const emNode = new Node('em', null, []);
                const textNode = new Node('text', text, []);

                emNode.appendChild(textNode);
                parentNode?.appendChild(emNode);

                const newTextNode = new Node('text', '', []);
                parentNode?.appendChild(newTextNode);

                this.currentNode = newTextNode;
                continue;
            }

        }

        // return this.getHtml(this.lines);
        if (lineCount === this.lines.length) {
            return {
                lastLineUpdated: this.lines[lineCount - 1],
            }
        } else {
            return {
                lastLineUpdated: this.lines[lineCount - 1],
                newLines: this.lines.slice(lineCount),
            }
        }
    }

    getHtml(lines: Node[]): string {
        let html = '';
        let lastListType: string | null = null; // Track last list type

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            console.log('line', line);
        
            switch (line.type) {
                case 'paragraph':
                    if (line.children?.length === 1 && line.children[0].value === '') continue;
                    html += `<p>${this.getHtml(line.children || [])}</p>`;
                    break;
                case 'code-inline':
                    html += `<code>${this.getHtml(line.children || [])}</code>`;
                    break;
                case 'code':
                    const languageClass = line.metaData?.language ? ` class="language-${line.metaData?.language}"` : '';
                    html += `<pre><code${languageClass}>${this.getHtml(line.children || [])}</code></pre>`;
                    break;
                case 'ul':
                case 'ol':
                    if (line.type !== lastListType) {
                        html += `<${line.type}>`;
                    }
                    html += this.getHtml(line.children || []);
                    if (i === lines.length - 1 || lines[i + 1].type !== line.type) {
                        html += `</${line.type}>`;
                    }
                    lastListType = line.type;
                    break;
                case 'li':
                    html += `<li>${this.getHtml(line.children || [])}</li>`;
                    break;
                case 'checkbox':
                    html += `<input type="checkbox"${line.value === 'checked' ? ' checked' : ''}>`;
                    break;
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                    html += `<${line.type}>${this.getHtml(line.children || [])}</${line.type}>`;
                    break;
                case 'strong':
                    html += `<strong>${this.getHtml(line.children || [])}</strong>`;
                    break;
                case 'em':
                    html += `<em>${this.getHtml(line.children || [])}</em>`;
                    break;
                case 'text':
                    html += line.value || '';
                    break;
                default:
                    console.warn(`Unknown line type: ${line.type}`);
                    break;
            }
        }

        return html;
    }

    private matchHeading(str: string): number | null {
        const match = str.match(/^(#{1,6})\s(.*)/);
        if (match) {
            return match[1].length;
        }

        return null;
    }
}

const mdToHtml = new MdToHtml();
mdToHtml.append(`Hello

World

he#llo
### hello`);

mdToHtml.append(`Hello`);

mdToHtml.append(`World\n`);
mdToHtml.append(`he#l__lo__s hello *hi* dk\n`);
// console.log(mdToHtml.append(`## a`));
console.log(mdToHtml.append(`
## a

\`javascript\`

how are you
`));

console.log(mdToHtml.append(`**hello**`));

console.log(mdToHtml.append(`

\`\`\`python
print('hello')
\`\`\`

\`\`\`javascript
console.log('world')
\`\`\`

\`\`\`html
<h1>hello</h1>
\`\`\`

\`\`\`
<h1>hello</h1>
\`\`\`
`).newLines?.forEach(line => {console.log(line)}));

mdToHtml.append(`- Item 1
- Item 2
    - Item 2.1
    - Item 2.2
- Item 3
`);
// console.log(mdToHtml.getHtml(mdToHtml.lines));

mdToHtml.append(`1. First
2. Second
3. Third
`);
// console.log(mdToHtml.getHtml(mdToHtml.lines));

mdToHtml.append(`- [ ] Task 1
- [x] Task 2
- [ ] Task 3
`);
console.log(mdToHtml.getHtml(mdToHtml.lines));
