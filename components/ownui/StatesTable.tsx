interface NFANode {
  tag: number;
  isAccepting: boolean;
  next: { symbol: string; node: NFANode }[];
}

interface State {
  id: number;
  nfaStates: Set<NFANode>;
  isMarked: boolean;
}

interface StateTableProps {
  states: Set<State>;
  type: string;
}

export default function StateTable({ states, type }: StateTableProps) {
  return (
    <table className="min-w-full bg-white border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="py-2 px-4 border-b">Estados</th>
          <th className="py-2 px-4 border-b">{type === "dfa"? "Estados del NFA" : "Estados signficativos del NFA"}</th>
        </tr>
      </thead>
      <tbody>
        {Array.from(states).map((state, index) => (
          <tr
            key={index}
            className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
          >
            <td className="py-2 px-4 border-b">{state.id}</td>
            <td className="py-2 px-4 border-b">
              {Array.from(state.nfaStates)
                .map((nfaState) => nfaState.tag)
                .join(", ")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
