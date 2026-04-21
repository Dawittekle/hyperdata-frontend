import { useState, useEffect } from "react";
import { useDataService } from "@/app/lib/generic-base-data-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import AddBasedataForm from "./addBasedataFormDynamic";
import UpdateBasedataFormDynamic from "./updateBasedataFormDynamic";

import { DeleteBasedata } from "./deleteBasedata";
import { BaseDataActionCell } from "./BaseDataActionCell";
import { ColumnDef } from "@tanstack/react-table";
import { useBasedata, useBasedataDialect } from "@/lib/hooks/useBasedata";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Dialect, DialectBasedata } from "@/app/types/basedate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialogLeft";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "deleted", label: "Deleted" },
];

export function DialectCRUD() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const queryClient = useQueryClient();
  const dataService = useDataService("dialect");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [verificationStatus, setVerificationStatus] = useState<string>();
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const { data: dialectData, isLoading: isdialectLoading } = useBasedataDialect(
    {
      page,
      pageSize,
      servicename: "Dialect",
      searchQuery: debouncedSearch,
      verificationStatus,
    }
  );
  const paginateddialectData = dialectData?.data.result || [];
  const dialectTotalElements = dialectData?.data?.total || 0;
  const dialectTotalPages = dialectData?.data.totalPages || 0;
  const companyStartRecord = paginateddialectData.length
    ? (page - 1) * pageSize + 1
    : 0;
  const companyEndRecord = Math.min(page * pageSize, dialectTotalElements);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      currentItem
        ? dataService.update(currentItem.id, data)
        : dataService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dialect"] });
      setIsDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dialect"] }),
  });

  type FormField = {
    name: string;
    label: string;
    type: "text" | "select";
    required?: boolean;
    options?: { value: string; label: string }[];
  };

  const formFields: FormField[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "code", label: "Code", type: "text" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
    },
  ];

  const columns: ColumnDef<DialectBasedata>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "language",
      header: "Language",
      cell: ({ row }) => (
        <BaseDataActionCell
          renderEdit={({ isOpen, onClose }) => (
            <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
              <DialogContent>
                <UpdateBasedataFormDynamic
                  isOpen={isOpen}
                  intialdata={row.original}
                  onClose={onClose}
                  servicename="dialect"
                  coloumn_name="language_id"
                  foriegnData="language"
                />
              </DialogContent>
            </Dialog>
          )}
          renderDelete={({ isOpen, onClose }) => (
            <DeleteBasedata
              isOpen={isOpen}
              onClose={onClose}
              service_id={row.original.id}
              servicename="dialect"
            />
          )}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        <Button
          onClick={() => {
            setCurrentItem(null);
            setIsDialogOpen(true);
          }}
        >
          Add Dialect
        </Button>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <p className="mb-8 font-bold">Add New Dialect</p>
          </DialogHeader>
          <AddBasedataForm
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            servicename="dialect"
            coloumn_name="language_id"
            foriegnData="language"
          />
        </DialogContent>
      </Dialog>
      <DataTable
        columns={columns}
        data={paginateddialectData}
        isLoading={isdialectLoading}
        pagination={{
          pageCount: dialectTotalPages,
          page,
          setPage: handlePageChange,
          pageSize,
          setPageSize: handlePageSizeChange,
          showingText:
            dialectTotalElements > 0
              ? `Showing ${companyStartRecord} to ${companyEndRecord} out of ${dialectTotalElements} records`
              : "",
        }}
      />
    </div>
  );
}
