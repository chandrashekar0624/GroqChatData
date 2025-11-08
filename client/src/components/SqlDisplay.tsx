import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface SqlDisplayProps {
  sql: string;
}

export default function SqlDisplay({ sql }: SqlDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="text-lg">Generated SQL</CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          data-testid="button-copy-sql"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-muted p-4 max-h-[300px] overflow-auto">
          <pre className="font-mono text-sm" data-testid="text-sql-query">
            <code>{sql}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
