import { buildSyntaxTree, TreeNode } from "./regex";
import { createTransitionTable } from "./utils";

export interface Transition {
  from: number;
  to: Map<string, Set<number>>;
  start: boolean;
  accepting: boolean;
}

export interface NFANode {
  tag: number;
  isAccepting: boolean;
  next: { symbol: string; node: NFANode }[];
}

export interface NFA {
  start: NFANode;
  accepting: NFANode;
  transitions: Set<Transition>;
}

/* This returns nodes of a graph */
export function buildNFA(regex: string): NFA {
  const syntaxTree: TreeNode = buildSyntaxTree(regex);
  let tag = 0;

  function createNode(isAccepting: boolean = false): NFANode {
    return { tag: tag++, isAccepting, next: [] };
  }

  function createEdge(symbol: string, node: NFANode) {
    return { symbol: symbol, node: node };
  }

  function build(node: TreeNode, initial: NFANode): NFANode {
    let accepting: NFANode;

    switch (node.type) {
      case "lit":
        let symbol: string = node.value as string;
        accepting = createNode();
        // Push next edge
        initial.next.push(createEdge(symbol, accepting));
        break;
      //
      case "concat":
        accepting = initial;
        for (const part of node.parts!) {
          accepting = build(part, accepting);
        }
        break;
      //
      case "|":
        let returnables = [];

        for (const part of node.parts!) {
          let temp = createNode();
          initial.next.push(createEdge("&", temp));

          let returnable = build(part, temp);
          returnables.push(returnable);
        }

        accepting = createNode();

        for (const returnable of returnables) {
          returnable.next.push(createEdge("&", accepting));
        }
        break;
      //
      case "?":
      case "*":
      case "+":
        let temp = createNode();
        initial.next.push(createEdge("&", temp));

        let temp_accepting = build(node.sub!, temp);

        if (node.type === "*" || node.type === "+")
          temp_accepting.next.push(createEdge("&", temp));

        accepting = createNode();

        temp_accepting.next.push(createEdge("&", accepting));

        if (node.type === "*" || node.type === "?")
          initial.next.push(createEdge("&", accepting));

        break;
    }

    return accepting;
  }

  const start: NFANode = createNode();
  const accepting: NFANode = build(syntaxTree, start);

  accepting.isAccepting = true;

  const transitions: Set<Transition> = createTransitionTable(start);

  return { start: start, accepting: accepting, transitions: transitions };
}
