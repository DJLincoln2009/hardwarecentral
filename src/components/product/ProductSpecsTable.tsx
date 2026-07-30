interface ProductSpecsTableProps {
  specs: { label: string; value: string }[];
}

function ProductSpecsTable({ specs }: ProductSpecsTableProps) {
  if (specs.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <tbody>
          {specs.map((spec, i) => (
            <tr
              key={spec.label}
              className={i !== specs.length - 1 ? 'border-b border-graphite-100' : ''}
            >
              <th
                scope="row"
                className="py-2 pr-4 text-left font-mono text-xs font-medium text-graphite-600 whitespace-nowrap"
              >
                {spec.label}
              </th>
              <td className="py-2 text-graphite-900">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductSpecsTable;
