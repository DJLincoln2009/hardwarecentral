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
                className="w-[35%] min-w-[100px] py-3.5 pr-4 pl-5 text-left font-mono text-xs font-medium text-muted max-md:whitespace-normal max-md:align-top max-md:pb-1.5 max-md:pl-4 max-md:pr-3 max-md:text-[11px]"
              >
                {spec.label}
              </th>
              <td className="py-3.5 pr-5 text-foreground max-md:py-1.5 max-md:pr-4 max-md:pl-3 max-md:text-xs max-md:leading-relaxed">
                {spec.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductSpecsTable;
