
import { Node } from './node';

export class MdToHtml {
    md: string;
    lines: Node[] = [];
    currentNode: Node | null = null;
    isLineEmpty: boolean = true;

    constructor() {
        this.md = '';
        
        const paragraphNode = new Node('paragraph', null, []);
        const textNode = new Node('text', '', []);

        paragraphNode.appendChild(textNode);

        this.lines.push(paragraphNode);
        this.currentNode = textNode;
    }

    append(md: string): { lastLineUpdated?: Node, newLines?: Node[] } {
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
                const paragraphNode = new Node('paragraph', null, []);
                const textNode = new Node('text', '', []);

                paragraphNode.appendChild(textNode);
                this.lines.push(paragraphNode);

                this.currentNode = textNode;
                continue;
            }

            if (!this.currentNode) continue;
                
            this.currentNode.appendValue(char);

            if (this.currentNode.value?.endsWith('```') && this.currentNode.parent?.type === 'paragraph') {
                this.currentNode.value = this.currentNode.value?.replace(/```$/, '');
                
                const codeNode = new Node('code', null, []);
                const textNode = new Node('text', '', []);

                codeNode.appendChild(textNode);
                this.lines.push(codeNode);

                this.currentNode = textNode;
                continue;
            }

            if (this.currentNode.value?.endsWith('```')) {
                this.currentNode.value = this.currentNode.value?.replace(/```$/, '');

                const paragraphNode = new Node('paragraph', null, []);
                const textNode = new Node('text', '', []);

                paragraphNode.appendChild(textNode);
                this.lines.push(paragraphNode);

                this.currentNode = textNode;
                continue;
            }

            const matchedHeading = this.matchHeading(this.currentNode.value || '');
            if (matchedHeading) {
                const lastLine = this.lines[this.lines.length - 1];
                lastLine.setType(`h${matchedHeading}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');

                this.currentNode.value = this.currentNode.value?.replace(/^(#{1,6})\s/, '') || '';
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
                lastLineUpdated: this.lines[lineCount-1],
                newLines: this.lines.slice(lineCount),
            }
        }
    }

    getHtml(lines: Node[]): string {
        let html = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            console.log('line', line)
            if (line.type === 'paragraph') {
                html += `<p>${this.getHtml(line.children || [])}</p>`;
            } else if (line.type === 'code') {
                html += `<code>${this.getHtml(line.children || [])}</code>`;
            } else if (line.type === 'h1') {
                html += `<h1>${this.getHtml(line.children || [])}</h1>`;
            } else if (line.type === 'h2') {
                html += `<h2>${this.getHtml(line.children || [])}</h2>`;
            } else if (line.type === 'h3') {
                html += `<h3>${this.getHtml(line.children || [])}</h3>`;
            }
              else if (line.type === 'h4') {
                html += `<h4>${this.getHtml(line.children || [])}</h4>`;
            }
              else if (line.type === 'h5') {
                html += `<h5>${this.getHtml(line.children || [])}</h5>`;
            }
              else if (line.type === 'h6') {
                html += `<h6>${this.getHtml(line.children || [])}</h6>`;
            } else if (line.type === 'strong') {
                html += `<strong>${this.getHtml(line.children || [])}</strong>`;
            } else if (line.type === 'em') {
                html += `<em>${this.getHtml(line.children || [])}</em>`;
            }
            else if (line.type === 'text') {
                html += line.value || '';
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

hello

how are you
`));

console.log(mdToHtml.append(`**hello**`));

console.log(mdToHtml.append(`

\`\`\`
hello
\`\`\`
`).newLines?.forEach(line => {console.log(line)}));

console.log(mdToHtml.getHtml(mdToHtml.lines));
