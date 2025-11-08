import SqlDisplay from '../SqlDisplay'

export default function SqlDisplayExample() {
  const exampleSql = `SELECT vendor_name, SUM(amount) as total_spend
FROM transactions
WHERE date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY vendor_name
ORDER BY total_spend DESC
LIMIT 5;`;

  return <SqlDisplay sql={exampleSql} />
}
