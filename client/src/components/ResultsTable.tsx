import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ResultsTableProps {
  columns: string[];
  rows: any[][];
}

export default function ResultsTable({ columns, rows }: ResultsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Query Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border max-h-[500px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index} className="font-medium">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center text-muted-foreground"
                  >
                    No results found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} data-testid={`cell-${rowIndex}-${cellIndex}`}>
                        {cell !== null && cell !== undefined ? String(cell) : "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {rows.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Showing {rows.length} {rows.length === 1 ? "row" : "rows"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
