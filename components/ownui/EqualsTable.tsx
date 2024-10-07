export interface Equal {
  tag: number;
  equals: Array<number>;
}

interface EqualListProps {
  equalSet: Set<Equal>;
}

export default function EqualTable({ equalSet }: EqualListProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Estado
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Identicos
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from(equalSet).map((equal) => (
            <tr key={equal.tag}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {equal.tag}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {equal.equals.length > 0 ? equal.equals.join(", ") : "None"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
