type NodeType = 'paragraph' | 'code' | 'text' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'strong' | 'em';

export class Node {
    type: NodeType;
    value: string | null;
    children: Node[];
    parent: Node | null;

    constructor(type: NodeType, value: string | null, children: Node[]) {
        this.type = type;
        this.value = value;
        this.children = children;
        this.parent = null;
    }

    appendChild(node: Node) {
        this.children.push(node);
        node.parent = this;
    }

    appendValue(text: string) {
        this.value += text;
    }

    setValue(text: string) {
        this.value = text;
    }

    setType(type: NodeType) {
        this.type = type;
    }
}
