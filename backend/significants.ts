import { buildDFA } from "./subsets";
import { NFANode } from "./thompson";

interface Transition {
  from: number;
  to: Map<string, number>;
  start: boolean;
  accepting: boolean;
}

interface State {
  id: number;
  nfaStates: Set<NFANode>;
  isMarked: boolean;
}

export interface Equal {
  tag: number;
  equals: Array<number>;
}

export interface ODFA {
  transitions: Set<Transition>;
  states: Set<State>;
  equals: Set<Equal>;
}

export function buildODFA(regex: string): ODFA {
  const dfa = buildDFA(regex);

  function isSignificant(state: NFANode): boolean {
    for (const edge of state.next) {
      if (edge.symbol === "&") return false;
    }
    return true;
  }

  dfa.states.forEach((entry) => {
    const statesToRemove: NFANode[] = [];

    entry.nfaStates.forEach((state) => {
      if (!isSignificant(state)) {
        statesToRemove.push(state);
      }
    });

    // Remove insignificant states after iteration
    statesToRemove.forEach((state) => entry.nfaStates.delete(state));
  });

  const areSetsEqual = (setA: Set<NFANode>, setB: Set<NFANode>): boolean => {
    if (setA.size !== setB.size) return false;
    return [...setA].every((item) => setB.has(item));
  };

  const equals = new Set<Equal>();

  function addEqual(tagI: number, tagJ: number): void {
    for (const equal of equals) {
      if (equal.tag === tagI) {
        equal.equals.push(tagJ);
        return;
      }
    }
    equals.add({ tag: tagI, equals: [tagJ] });
  }

  //Get equals
  const significantStatesArray = Array.from(dfa.states);
  for (let i = 0; i < significantStatesArray.length; i++) {
    for (let j = i + 1; j < significantStatesArray.length; j++) {
      if (
        areSetsEqual(
          significantStatesArray[i].nfaStates,
          significantStatesArray[j].nfaStates,
        )
      ) {
        // Create a tag for the current state
        const tagI = significantStatesArray[i].id;
        const tagJ = significantStatesArray[j].id;

        addEqual(tagI, tagJ);
      }
    }
  }

  // Delete equals from transitions
  for (const equal of equals) {
    const transitionsToRemove: Transition[] = [];

    for (const entry of dfa.transitions) {
      // 1st case: delete a row
      if (equal.equals.includes(entry.from)) {
        transitionsToRemove.push(entry);
      }
      // 2nd case: replace a transition
      entry.to.forEach((val, key) => {
        if (equal.equals.includes(val)) {
          entry.to.set(key, equal.tag);
        }
      });
    }

    transitionsToRemove.forEach((transition) =>
      dfa.transitions.delete(transition),
    );
  }

  return { states: dfa.states, transitions: dfa.transitions, equals: equals };
}
