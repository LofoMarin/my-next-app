interface TransitionD {
  from: number;
  to: Map<string, number>;
  start: boolean;
  accepting: boolean;
}

interface TransitionT {
  from: number;
  to: Map<string, Set<number>>;
  start: boolean;
  accepting: boolean;
}

type Transition = TransitionD | TransitionT;

interface TransitionTableProps {
  transitions: Set<Transition>;
}

export default function TransitionTable({ transitions }: TransitionTableProps) {
  const renderToCell = (to: Map<string, number | Set<number>>) => {
    return Array.from(to.entries()).map(([symbol, target], index) => (
      <div key={index}>
        {symbol} →{" "}
        {target instanceof Set ? Array.from(target).join(", ") : target}
      </div>
    ));
  };

  return (
    <table className="min-w-full bg-white border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="py-2 px-4 border-b">Desde</th>
          <th className="py-2 px-4 border-b">Hacia</th>
        </tr>
      </thead>
      <tbody>
        {Array.from(transitions).map((transition, index) => (
          <tr
            key={index}
            className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
          >
            <td className="py-2 px-4 border-b">{transition.from}</td>
            <td className="py-2 px-4 border-b">
              {renderToCell(transition.to)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
