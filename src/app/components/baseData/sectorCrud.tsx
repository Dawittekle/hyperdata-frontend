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
import { useBasedataAll } from "@/lib/hooks/useBasedata";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Sector } from "@/app/types/basedate";
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

export function SectorCRUD() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const queryClient = useQueryClient();
  const dataService = useDataService("sector");
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

  const { data: sectorData, isLoading: issectorLoading } = useBasedataAll({
    page,
    pageSize,
    servicename: "sector",
    searchQuery: debouncedSearch,
    verificationStatus,
  });
  const paginatedsectorData = sectorData?.data.result || [];
  const sectorTotalElements = sectorData?.data?.total || 0;
  const sectorTotalPages = sectorData?.data.totalPages || 0;
  const companyStartRecord = paginatedsectorData.length
    ? (page - 1) * pageSize + 1
    : 0;
  const companyEndRecord = Math.min(page * pageSize, sectorTotalElements);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      currentItem
        ? dataService.update(currentItem.id, data)
        : dataService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sector"] });
      setIsDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sector"] }),
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

  const columns: ColumnDef<Sector>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "",
      header: "Action",
      cell: ({ row }) => (
        <BaseDataActionCell
          renderEdit={({ isOpen, onClose }) => (
            <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
              <DialogContent>
                <UpdateBasedataFormDynamic
                  isOpen={isOpen}
                  intialdata={row.original}
                  onClose={onClose}
                  servicename="sector"
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
              servicename="sector"
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
          Add sector
        </Button>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <p className="mb-8 font-bold ">Add New sector</p>
          </DialogHeader>
          <AddBasedataForm
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            servicename="sector"
            coloumn_name=""
            foriegnData=""
          />
        </DialogContent>
      </Dialog>
      <DataTable
        columns={columns}
        data={paginatedsectorData}
        isLoading={issectorLoading}
        pagination={{
          pageCount: sectorTotalPages,
          page,
          setPage: handlePageChange,
          pageSize,
          setPageSize: handlePageSizeChange,
          showingText:
            sectorTotalElements > 0
              ? `Showing ${companyStartRecord} to ${companyEndRecord} out of ${sectorTotalElements} records`
              : "",
        }}
      />
    </div>
  );
}
