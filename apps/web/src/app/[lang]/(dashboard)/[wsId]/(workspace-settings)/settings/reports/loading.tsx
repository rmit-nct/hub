import { DataTable } from '@/components/ui/custom/tables/data-table';
import { Separator } from '@/components/ui/separator';

export default function Loading() {
  return (
    <>
      <div className="border-border bg-foreground/5 flex flex-col justify-between gap-4 rounded-lg border p-4 text-transparent md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold">reports</h1>
          <p className="">description</p>
        </div>
      </div>
      <Separator className="my-4" />
      <DataTable namespace="secret-data-table" />
    </>
  );
}
