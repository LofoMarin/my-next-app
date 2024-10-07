// Define the node types
export type NodeType = "concat" | "|" | "*" | "+" | "?" | "lit";

// Define the structure for a tree node
export interface TreeNode {
  type: NodeType;
  value?: string;
  parts?: TreeNode[];
  sub?: TreeNode;
}

// Function to create a tree node
function createNode(
  type: NodeType,
  value?: string,
  parts?: TreeNode[],
  sub?: TreeNode,
): TreeNode {
  return { type, value, parts, sub };
}

// Function to build the syntax tree
export function buildSyntaxTree(regex: string): TreeNode {
  let index = 0;

  function parseExpression(): TreeNode {
    const parts: TreeNode[] = [parseTerm()];
    while (index < regex.length && regex[index] === "|") {
      index++; // Consume '|'
      if (index === regex.length) {
        throw new Error("Unexpected end of input after '|'");
      }
      parts.push(parseTerm());
    }
    return parts.length > 1 ? createNode("|", undefined, parts) : parts[0];
  }

  function parseTerm(): TreeNode {
    const parts: TreeNode[] = [];
    while (index < regex.length && !")|".includes(regex[index])) {
      parts.push(parseFactor());
    }
    if (parts.length === 0) {
      throw new Error("Empty term is not allowed");
    }
    return parts.length > 1 ? createNode("concat", undefined, parts) : parts[0];
  }

  function parseFactor(): TreeNode {
    let node = parseAtom();
    if (index < regex.length) {
      if (regex[index] === "*") {
        index++; // Consume '*'
        node = createNode("*", undefined, undefined, node);
      } else if (regex[index] === "+") {
        index++; // Consume '+'
        node = createNode("+", undefined, undefined, node);
      } else if (regex[index] === "?") {
        index++; // Consume '+'
        node = createNode("?", undefined, undefined, node);
      }
    }
    return node;
  }

  function parseAtom(): TreeNode {
    if (index >= regex.length) {
      throw new Error("Unexpected end of input");
    }
    if (regex[index] === "(") {
      index++; // Consume '('
      const node = parseExpression();
      if (index >= regex.length || regex[index] !== ")") {
        throw new Error("Unmatched parenthesis");
      }
      index++; // Consume ')'
      return node;
    } else if ("|)*+?".includes(regex[index])) {
      throw new Error(
        `Unexpected operator '${regex[index]}' at position ${index}`,
      );
    } else {
      return createNode("lit", regex[index++]);
    }
  }

  return parseExpression();
}
