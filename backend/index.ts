import { buildNFA, NFA, Transition as TransitionT } from "./thompson";
import { buildDFA, DFA, State, Transition as TransitionD } from "./subsets";
import { buildODFA, Equal, ODFA } from "./significants";
import {
  recognizeString,
  generateCytoscapeData,
  CytoscapeData,
  getSymbols,
  RecognitionResult,
} from "./utils";

export type AutomatonType = "nfa" | "dfa" | "odfa";

export interface Automaton {
  type: AutomatonType;
  symbols: Set<string>;
  transitions: Set<TransitionT | TransitionD>;
  states?: Set<State>;
  equals?: Set<Equal>;
  cytoscape_data: CytoscapeData;
  recognize_string?: (input: string) => RecognitionResult;
}

export function createAutomaton(type: AutomatonType, regex: string): Automaton {
  switch (type) {
    case "nfa":
      const nfa: NFA = buildNFA(regex);
      return {
        type: "nfa",
        symbols: getSymbols(regex),
        transitions: nfa.transitions,
        cytoscape_data: generateCytoscapeData(nfa.transitions),
      };
    case "dfa":
      const dfa: DFA = buildDFA(regex);
      return {
        type: "dfa",
        symbols: getSymbols(regex),
        transitions: dfa.transitions,
        states: dfa.states,
        cytoscape_data: generateCytoscapeData(dfa.transitions),
        recognize_string: (input: string) =>
          recognizeString(dfa.transitions, input),
      };
    case "odfa":
      const odfa: ODFA = buildODFA(regex);
      return {
        type: "odfa",
        symbols: getSymbols(regex),
        transitions: odfa.transitions,
        states: odfa.states,
        equals: odfa.equals,
        cytoscape_data: generateCytoscapeData(odfa.transitions),
        recognize_string: (input: string) =>
          recognizeString(odfa.transitions, input),
      };
  }
}
