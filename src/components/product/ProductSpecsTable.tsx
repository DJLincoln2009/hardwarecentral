interface ProductSpecsTableProps {
  specs: { label: string; value: string }[];
}

function ProductSpecsTable({ specs }: ProductSpecsTableProps) {
  if (specs.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
      <table className="w-full text-sm">
        <tbody>
          {specs.map((spec, i) => (
            <tr key={spec.label} className={i % 2 === 1 ? 'bg-surface-muted/50' : ''}>
              <th
                scope="row"
                className="w-[38%] whitespace-nowrap py-3.5 pr-4 pl-5 text-left font-mono text-xs font-medium text-muted"
              >
                {spec.label}
              </th>
              <td className="py-3.5 pr-5 text-foreground">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductSpecsTable;
