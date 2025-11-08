import ResultsTable from '../ResultsTable'

export default function ResultsTableExample() {
  const columns = ["Vendor Name", "Total Spend", "Order Count"];
  const rows = [
    ["Acme Corp", "$12,400", "45"],
    ["TechSupply", "$9,800", "32"],
    ["GlobalParts", "$8,600", "28"],
    ["FastShip", "$7,200", "21"],
    ["QuickBuy", "$6,500", "19"],
  ];

  return <ResultsTable columns={columns} rows={rows} />
}
