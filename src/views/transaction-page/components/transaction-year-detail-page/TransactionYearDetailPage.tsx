import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  useReactTable,
} from "@tanstack/react-table";

import AppDatePicker from "@/components/app-components/app-datepicker/AppDatePicker";
import { Button } from "@/components/ui/button";
import { TransactionService } from "@/helpers/services/TransactionService";
import type { TransactionDetailRow } from "@/interfaces/ITransactionService";
import { transactionModeWordingList } from "../../TransactionPage.constant";
import TransactionErrorModal from "../transaction-error-modal/TransactionErrorModal";
import TransactionTableSection from "../transaction-table-section/TransactionTableSection";
import TodayButton from "../today-button/TodayButton";
import type {
  TransactionYearDetailPageProps,
  TransactionYearGroupedRow,
} from "./TransactionYearDetailPage.interface";
import { routes } from "@/constants/paths";
import { Eye } from "lucide-react";
import AppBackButton from "@/components/app-layout/app-back-button/AppBackButton";

const getMonthIndex = (dateText?: string | null) => {
  if (!dateText) {
    return null;
  }

  const parsed = new Date(dateText);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getMonth() + 1;
};

const TransactionYearDetailPage = (props: TransactionYearDetailPageProps) => {
  const { mode } = props;

  const navigate = useNavigate();
  const { year: yearParam } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isShowError, setIsShowError] = useState(false);
  const [transactionList, setTransactionList] = useState<
    TransactionDetailRow[]
  >([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailRows, setSelectedDetailRows] = useState<
    TransactionDetailRow[]
  >([]);
  const [selectedDetailTitle, setSelectedDetailTitle] = useState("");
  const [activeDate, setActiveDate] = useState(new Date());
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date | undefined>(
    new Date(),
  );

  const handleGoToToday = () => {
    const today = new Date();
    setActiveDate(today);
    const detailPathTemplate =
      mode === "DO" ? routes.deliveryOrderDayDetail : routes.sellingDayDetail;

    navigate(
      detailPathTemplate
        .replace(":year", String(today.getFullYear()))
        .replace(":month", String(today.getMonth() + 1))
        .replace(":day", String(today.getDate())),
    );
  };

  const handleCloseErrorModal = () => {
    setErrorMessage("");
    setIsShowError(false);
  };

  const handleSelectMonth = (month: number) => {
    const detailPathTemplate =
      mode === "DO"
        ? routes.deliveryOrderMonthDetail
        : routes.sellingMonthDetail;

    navigate(
      detailPathTemplate
        .replace(":year", String(selectedYear))
        .replace(":month", String(month)),
    );
  };

  const handleGoToSelectedMonth = () => {
    if (!selectedMonthDate) return;
    const month = selectedMonthDate.getMonth() + 1;
    handleSelectMonth(month);
  };

  const getSelectedMonthQuantity = () => {
    if (!selectedMonthDate) return 0;
    const month = selectedMonthDate.getMonth() + 1;
    return monthQuantityMap[month] || 0;
  };

  const handleOpenDetailModal = (row: TransactionYearGroupedRow) => {
    setSelectedDetailRows(row.details);
    setSelectedDetailTitle(
      `${row.categoryName} - ${row.typeName} (${row.typeCode})`,
    );
    setIsDetailModalOpen(true);
  };

  const handleFetchTransactionByYear = async () => {
    if (!isValidYear) {
      navigate(routes.notFound, { replace: true });
      return;
    }

    const distinctYearResponse =
      await TransactionService.getDistinctTransactionYears();
    const validYearList =
      mode === "DO"
        ? distinctYearResponse.dateDOYears
        : distinctYearResponse.dateOUTYears;

    const hasTransactionInYear = validYearList.includes(selectedYear);

    if (!hasTransactionInYear && selectedYear !== todayYear) {
      navigate(routes.notFound, { replace: true });
      return;
    }

    await TransactionService.getTransactionsByModeYear({
      mode,
      year: selectedYear,
      setIsLoading,
    })
      .then((res) => {
        setTransactionList(res.data || []);
      })
      .catch((error) => {
        setErrorMessage(error.message);
        setIsShowError(true);
      });
  };

  const modeWording = useMemo(() => transactionModeWordingList[mode], [mode]);
  const todayYear = useMemo(() => new Date().getFullYear(), []);
  const selectedYear = useMemo(() => Number(yearParam), [yearParam]);
  const isValidYear = useMemo(
    () => Number.isInteger(selectedYear) && selectedYear > 0,
    [selectedYear],
  );

  const monthQuantityMap = useMemo(() => {
    const quantityMap: Record<number, number> = {};

    transactionList.forEach((transaction) => {
      const month = getMonthIndex(
        mode === "DO" ? transaction.dateDO : transaction.dateOUT,
      );

      if (month !== null) {
        quantityMap[month] = (quantityMap[month] || 0) + 1;
      }
    });

    return quantityMap;
  }, [transactionList, mode]);

  const groupedTransactionRows = useMemo<TransactionYearGroupedRow[]>(() => {
    const groupedMap = new Map<string, TransactionYearGroupedRow>();

    transactionList.forEach((transaction) => {
      const categoryName = transaction.categoryName || "-";
      const typeName = transaction.typeName || "-";
      const typeCode = transaction.typeCode || "-";
      const key = `${categoryName}|${typeName}|${typeCode}|${transaction.year}`;

      const existing = groupedMap.get(key);

      if (existing) {
        existing.quantity += 1;
        existing.details.push(transaction);
        return;
      }

      groupedMap.set(key, {
        key,
        categoryName,
        typeName,
        typeCode,
        year: transaction.year,
        quantity: 1,
        details: [transaction],
      });
    });

    return Array.from(groupedMap.values());
  }, [transactionList]);

  const transactionColumns: ColumnDef<TransactionYearGroupedRow>[] = [
    {
      accessorKey: "categoryName",
      header: "Category",
    },
    {
      accessorKey: "typeName",
      header: "Type Name",
    },
    {
      accessorKey: "typeCode",
      header: "Type Code",
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleOpenDetailModal(row.original)}
        >
          <Eye className="size-4" />
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: groupedTransactionRows,
    columns: transactionColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    handleFetchTransactionByYear();
  }, [mode, selectedYear, isValidYear, todayYear]);

  return (
    <div>
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-3">
          <AppBackButton />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
            {modeWording.title} - {isValidYear ? selectedYear : "-"}
          </h1>
        </div>
        <p className="text-muted-foreground">
          Showing transaction list of year {isValidYear ? selectedYear : "-"}.
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1 max-w-3xs">
            <AppDatePicker
              label="Select Transaction Month"
              placeholder="Pick a month"
              value={selectedMonthDate}
              onValueChange={setSelectedMonthDate}
              viewMode="month"
              lockedYear={selectedYear}
              withoutMargin
            />
          </div>
          <div className="text-right pb-0 flex">
            <p className="text-muted-foreground mb-1">Quantity: &nbsp;</p>
            <p className="font-semibold">
              {getSelectedMonthQuantity()} {modeWording.cardAction}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleGoToSelectedMonth}
            disabled={!selectedMonthDate}
          >
            View Selected Month
          </Button>
          <TodayButton onGoToToday={handleGoToToday} activeDate={activeDate} />
        </div>
      </div>

      <TransactionTableSection
        table={table}
        emptyMessage={
          isLoading
            ? "Loading transactions..."
            : "No transaction found for this year."
        }
        detailOpen={isDetailModalOpen}
        onDetailOpenChange={setIsDetailModalOpen}
        detailTitle={selectedDetailTitle}
        detailRows={selectedDetailRows}
      />

      <TransactionErrorModal
        open={isShowError}
        onOpenChange={setIsShowError}
        errorMessage={errorMessage}
        onClose={handleCloseErrorModal}
      />
    </div>
  );
};

export default TransactionYearDetailPage;
