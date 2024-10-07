import { buildNFA, NFANode } from "./thompson";
import { enclosure, move } from "./utils";
import { getSymbols } from "./utils";

export interface Transition {
  from: number;
  to: Map<string, number>;
  start: boolean;
  accepting: boolean;
}

export interface State {
  id: number;
  nfaStates: Set<NFANode>;
  isMarked: boolean;
}

export interface DFA {
  transitions: Set<Transition>;
  states: Set<State>;
}

export function buildDFA(regex: string): DFA {
  const stateSet: Set<State> = new Set<State>();
  const transitionSet: Set<Transition> = new Set<Transition>();

  const addState = (
    id: number,
    nfaStates: Set<NFANode>,
    marked: boolean = false,
  ): void => {
    stateSet.add({ id, nfaStates, isMarked: marked });
  };

  const findUnmarkedState = (): State | null => {
    for (const state of stateSet) {
      if (!state.isMarked) {
        return state;
      }
    }
    return null;
  };

  const areSetsEqual = (setA: Set<NFANode>, setB: Set<NFANode>): boolean => {
    if (setA.size !== setB.size) return false;
    return [...setA].every((item) => setB.has(item));
  };

  const addTransition = (from: number, symbol?: string, to?: number): void => {
    const existingTransition = Array.from(transitionSet).find(
      (t) => t.from === from,
    );

    const isStart = from === 0; // Mark as start if from is 0
    const fromState = Array.from(stateSet).find((state) => state.id === from);
    const isAccepting = fromState
      ? Array.from(fromState.nfaStates).some((state) => state.isAccepting)
      : false; // Check if any nfaStates are accepting

    if (existingTransition) {
      if (symbol && to !== undefined) {
        existingTransition.to.set(symbol, to);
        existingTransition.start = isStart; // Update start property
        existingTransition.accepting = isAccepting; // Update accepting property
      }
    } else {
      if (symbol && to !== undefined) {
        transitionSet.add({
          from,
          to: new Map<string, number>([[symbol, to]]),
          start: isStart, // Set start property
          accepting: isAccepting, // Set accepting property
        });
      }
    }
  };

  const constructDFA = () => {
    const nfa = buildNFA(regex).start;
    const symbols = getSymbols(regex);
    let stateId = 0;
    const initialEnclosure = new Set<NFANode>([nfa]);

    addState(stateId, enclosure(initialEnclosure));

    while (true) {
      const currentState = findUnmarkedState();
      if (!currentState) break;

      currentState.isMarked = true;

      for (const symbol of symbols) {
        const nextStates = enclosure(move(currentState.nfaStates, symbol));
        const existingState = Array.from(stateSet).find((state) =>
          areSetsEqual(state.nfaStates, nextStates),
        );

        if (!existingState && nextStates.size > 0) {
          addState(++stateId, nextStates);
        }

        const transitionId = existingState ? existingState.id : stateId;

        if (nextStates.size > 0) {
          addTransition(currentState.id, symbol, transitionId);
        } else {
          addTransition(currentState.id);
        }
      }
    }
  };

  constructDFA();

  return { states: stateSet, transitions: transitionSet };
}
