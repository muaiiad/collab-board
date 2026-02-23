class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

export default class Queue {
  constructor() {
    this.head = null; // front
    this.tail = null; // rear
    this.length = 0;
  }

  enqueue(value) {
    const node = new Node(value);

    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }

    this.length++;
    return this.length;
  }

  dequeue() {
    if (!this.head) return undefined;

    const value = this.head.value;
    this.head = this.head.next;
    this.length--;

    if (!this.head) this.tail = null; // queue became empty
    return value;
  }

  peek() {
    return this.head ? this.head.value : undefined;
  }

  isEmpty() {
    return this.length === 0;
  }

  size() {
    return this.length;
  }
}
