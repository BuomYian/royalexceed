"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { bulkImportInventory } from "@/lib/actions/inventory";
import { INVENTORY_CSV_COLUMNS } from "@/lib/validations/inventory";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CsvImportDialog() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([]);
  const [pending, setPending] = useState(false);

  function handleFile(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setRows(result.data);
        setErrors([]);
      },
    });
  }

  async function handleImport() {
    setPending(true);
    try {
      const result = await bulkImportInventory(rows);
      if (result.success) {
        toast.success(`Imported ${result.data.imported} unit(s)`);
        if (result.data.errors.length) setErrors(result.data.errors);
        else {
          setOpen(false);
          setRows([]);
        }
      } else {
        toast.error(result.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <Upload className="h-4 w-4" /> Bulk import
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk import inventory</DialogTitle>
          <DialogDescription>
            Upload a CSV with columns: {INVENTORY_CSV_COLUMNS.join(", ")}
          </DialogDescription>
        </DialogHeader>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="text-sm"
        />

        {rows.length > 0 && (
          <p className="text-sm text-muted-foreground">{rows.length} row(s) parsed and ready to import.</p>
        )}

        {errors.length > 0 && (
          <div className="max-h-40 overflow-y-auto rounded-md border border-destructive/40 bg-destructive/5 p-2 text-sm">
            {errors.map((e, i) => (
              <p key={i} className="text-destructive">
                Row {e.row}: {e.message}
              </p>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={pending || rows.length === 0}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Import {rows.length > 0 ? `${rows.length} row(s)` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
