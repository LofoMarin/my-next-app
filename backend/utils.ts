import { NFANode, Transition as TransitionT } from "./thompson";
import { Transition as TransitionD } from "./subsets";

export function enclosure(states: Set<NFANode>): Set<NFANode> {
  const set = new Set<NFANode>();

  const traverse = (state: NFANode) => {
    if (set.has(state)) return;
    set.add(state);

    state.next.forEach((edge) => {
      if (edge.symbol === "&") traverse(edge.node);
    });
  };

  states.forEach(traverse);

  return set;
}

export function move(states: Set<NFANode>, symbol: string): Set<NFANode> {
  const set = new Set<NFANode>();

  states.forEach((state) => {
    state.next.forEach((edge) => {
      if (edge.symbol === symbol) set.add(edge.node);
    });
  });

  return set;
}

export function getSymbols(regex: string): Set<string> {
  const excludedChars = /[()|+*?]/g;

  const set = new Set<string>();

  for (const char of regex) {
    // If the character is not in the excluded list, add it to the set
    if (!excludedChars.test(char)) {
      set.add(char);
    }
  }

  return set;
}

export function createTransitionTable(initialNode: NFANode): Set<TransitionT> {
  const transitionSet: Set<TransitionT> = new Set<TransitionT>();
  const visited: Set<number> = new Set<number>(); // To avoid processing the same node multiple times

  function traverse(node: NFANode, isStart: boolean) {
    if (visited.has(node.tag)) {
      return; // If we've already visited this node, skip it
    }
    visited.add(node.tag);

    const transitionMap: Map<string, Set<number>> = new Map<
      string,
      Set<number>
    >();

    for (const { symbol, node: nextNode } of node.next) {
      // If the symbol already exists in the map, add the next node to the set
      if (!transitionMap.has(symbol)) {
        transitionMap.set(symbol, new Set<number>());
      }
      transitionMap.get(symbol)!.add(nextNode.tag); // Add the next node's tag to the set

      traverse(nextNode, false); // Recursively traverse the next node
    }

    transitionSet.add({
      from: node.tag,
      to: transitionMap,
      start: isStart, // Set start based on whether this is the initial node
      accepting: node.isAccepting, // Set accepting based on the node's isAccepting property
    });
  }

  traverse(initialNode, true); // Start traversal with the initial node as the start
  return transitionSet;
}

export interface RecognitionResult {
  recognized: boolean;
  route: string[];
}

export function recognizeString(
  transitions: Set<TransitionD>,
  input: string,
): RecognitionResult {
  const excludedChars = /[()|+*?]/g;

  if (excludedChars.test(input)) {
    throw new Error("Invalid chars in input string");
  }

  // Find the start state
  const startTransition = Array.from(transitions).find((t) => t.start);
  if (!startTransition) {
    throw new Error("No start state found in transitions");
  }

  let currentState = startTransition.from;
  const route: string[] = [currentState.toString()];

  for (const char of input) {
    const currentTransition = Array.from(transitions).find(
      (t) => t.from === currentState,
    );
    if (!currentTransition) {
      return { recognized: false, route };
    }

    const nextState = currentTransition.to.get(char);
    if (nextState === undefined) {
      return { recognized: false, route };
    }

    route.push(`${char} -> ${nextState}`);
    currentState = nextState;
  }

  const finalTransition = Array.from(transitions).find(
    (t) => t.from === currentState,
  );
  const recognized = finalTransition ? finalTransition.accepting : false;

  return { recognized, route };
}

type Transition = TransitionD | TransitionT;

interface CytoscapeNode {
  data: {
    id: string;
    label: string;
    start: boolean;
    accepting: boolean;
  };
  classes?: string;
}

interface CytoscapeEdge {
  data: {
    id: string;
    source: string;
    target: string;
    label: string;
  };
}

export interface CytoscapeData {
  nodes: CytoscapeNode[];
  edges: CytoscapeEdge[];
}

export function generateCytoscapeData(transitions: Set<Transition>): CytoscapeData {
  const nodes: CytoscapeNode[] = [];
  const edges: CytoscapeEdge[] = [];
  const processedNodes = new Set<number>();

  transitions.forEach((transition) => {
    // Add node if not already processed
    if (!processedNodes.has(transition.from)) {
      const classes: string[] = [];
      if (transition.start) classes.push('start');
      if (transition.accepting) classes.push('accept');

      nodes.push({
        data: {
          id: transition.from.toString(),
          label: transition.from.toString(),
          start: transition.start,
          accepting: transition.accepting,
        },
        classes: classes.join(' ')
      });
      processedNodes.add(transition.from);
    }

    // Process transitions
    transition.to.forEach((toValue, symbol) => {
      if (toValue instanceof Set) {
        // Handle TransitionT
        toValue.forEach((to) => {
          addNodeAndEdge(transition.from, to, symbol);
        });
      } else {
        // Handle TransitionD
        addNodeAndEdge(transition.from, toValue, symbol);
      }
    });
  });

  function addNodeAndEdge(from: number, to: number, symbol: string) {
    // Add target node if not already processed
    if (!processedNodes.has(to)) {
      const targetTransition = Array.from(transitions).find(t => t.from === to);
      const classes: string[] = [];
      if (targetTransition?.start) classes.push('start');
      if (targetTransition?.accepting) classes.push('accept');

      nodes.push({
        data: {
          id: to.toString(),
          label: to.toString(),
          start: targetTransition ? targetTransition.start : false,
          accepting: targetTransition ? targetTransition.accepting : false,
        },
        classes: classes.join(' ')
      });
      processedNodes.add(to);
    }

    // Add edge
    edges.push({
      data: {
        id: `${from}-${symbol}-${to}`,
        source: from.toString(),
        target: to.toString(),
        label: symbol,
      },
    });
  }

  return { nodes, edges };
}