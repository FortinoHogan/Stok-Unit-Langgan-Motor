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
import { routes } from "@/constants/paths";
import { TransactionService } from "@/helpers/services/TransactionService";
import { transactionModeWordingList } from "../../TransactionPage.constant";
import TransactionErrorModal from "../transaction-error-modal/TransactionErrorModal";
import TransactionTableSection from "../transaction-table-section/TransactionTableSection";
import TodayButton from "../today-button/TodayButton";
import type {
  TransactionMonthDetailPageProps,
  TransactionGroupedRow,
} from "./TransactionMonthDetailPage.interface";
import { getDayIndex, getMonthIndex, monthFormatter } from "../../utilities";
import { Eye } from "lucide-react";
import type { TransactionDetailRow } from "@/interfaces/ITransactionService";
import AppBackButton from "@/components/app-layout/app-back-button/AppBackButton";

const TransactionMonthDetailPage = (props: TransactionMonthDetailPageProps) => {
  const { mode } = props;

  const navigate = useNavigate();
  const { year: yearParam, month: monthParam } = useParams();

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
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedDayDate, setSelectedDayDate] = useState<Date | undefined>(
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

  const handleSelectDay = (day: number) => {
    const detailPathTemplate =
      mode === "DO" ? routes.deliveryOrderDayDetail : routes.sellingDayDetail;

    navigate(
      detailPathTemplate
        .replace(":year", String(selectedYear))
        .replace(":month", String(selectedMonth))
        .replace(":day", String(day)),
    );
  };

  const handleGoToSelectedDay = () => {
    if (!selectedDayDate) return;
    const day = selectedDayDate.getDate();
    handleSelectDay(day);
  };

  const getSelectedDayQuantity = () => {
    if (!selectedDayDate) return 0;
    const day = selectedDayDate.getDate();
    return dayQuantityMap[day] || 0;
  };

  const handleOpenDetailModal = (row: TransactionGroupedRow) => {
    setSelectedDetailRows(row.details);
    setSelectedDetailTitle(
      `${row.categoryName} - ${row.typeName} (${row.typeCode})`,
    );
    setIsDetailModalOpen(true);
  };

  const handleFetchTransactionByMonth = async () => {
    if (!isValidYear || !isValidMonth) {
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
  const todayMonth = useMemo(() => new Date().getMonth() + 1, []);
  const todayDay = useMemo(() => new Date().getDate(), []);
  const selectedYear = useMemo(() => Number(yearParam), [yearParam]);
  const selectedMonth = useMemo(() => Number(monthParam), [monthParam]);
  const isValidYear = useMemo(
    () => Number.isInteger(selectedYear) && selectedYear > 0,
    [selectedYear],
  );
  const isValidMonth = useMemo(
    () =>
      Number.isInteger(selectedMonth) &&
      selectedMonth >= 1 &&
      selectedMonth <= 12,
    [selectedMonth],
  );

  const monthTransactionList = useMemo(() => {
    return transactionList.filter((transaction) => {
      const month = getMonthIndex(
        mode === "DO" ? transaction.dateDO : transaction.dateOUT,
      );
      return month === selectedMonth;
    });
  }, [mode, selectedMonth, transactionList]);

  const dayQuantityMap = useMemo(() => {
    const quantityMap: Record<number, number> = {};

    monthTransactionList.forEach((transaction) => {
      const day = getDayIndex(
        mode === "DO" ? transaction.dateDO : transaction.dateOUT,
      );

      if (day !== null) {
        quantityMap[day] = (quantityMap[day] || 0) + 1;
      }
    });

    return quantityMap;
  }, [mode, monthTransactionList]);

  const displayDays = useMemo(() => {
    const dayList = Object.keys(dayQuantityMap).map((day) => Number(day));
    const shouldIncludeToday =
      selectedYear === todayYear && selectedMonth === todayMonth;

    if (!shouldIncludeToday) {
      return dayList.sort((a, b) => a - b);
    }

    return [...new Set([...dayList, todayDay])].sort((a, b) => a - b);
  }, [
    dayQuantityMap,
    selectedMonth,
    selectedYear,
    todayDay,
    todayMonth,
    todayYear,
  ]);

  const filteredTransactionList = useMemo(() => {
    if (!displayDays.length) {
      return [];
    }

    return monthTransactionList.filter((transaction) => {
      const day = getDayIndex(
        mode === "DO" ? transaction.dateDO : transaction.dateOUT,
      );
      return day === selectedDay;
    });
  }, [displayDays.length, mode, monthTransactionList, selectedDay]);

  const groupedTransactionRows = useMemo<TransactionGroupedRow[]>(() => {
    const groupedMap = new Map<string, TransactionGroupedRow>();

    filteredTransactionList.forEach((transaction) => {
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
  }, [filteredTransactionList]);

  const transactionColumns: ColumnDef<TransactionGroupedRow>[] = [
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
    handleFetchTransactionByMonth();
  }, [mode, selectedYear, selectedMonth, isValidYear, isValidMonth, todayYear]);

  useEffect(() => {
    const shouldUseTodayDay =
      selectedYear === todayYear && selectedMonth === todayMonth;

    if (shouldUseTodayDay) {
      setSelectedDay(todayDay);
      setSelectedDayDate(new Date());
      return;
    }

    if (displayDays.length) {
      setSelectedDay(displayDays[0]);
      const dayDate = new Date(selectedYear, selectedMonth - 1, displayDays[0]);
      setSelectedDayDate(dayDate);
      return;
    }

    setSelectedDay(1);
    const dayDate = new Date(selectedYear, selectedMonth - 1, 1);
    setSelectedDayDate(dayDate);
  }, [
    displayDays,
    selectedMonth,
    selectedYear,
    todayDay,
    todayMonth,
    todayYear,
  ]);

  return (
    <div>
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-3">
          <AppBackButton />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
            {modeWording.title} -{" "}
            {monthFormatter.format(new Date(2000, selectedMonth - 1, 1))}{" "}
            {isValidYear ? selectedYear : "-"}
          </h1>
        </div>
        <p className="text-muted-foreground">
          Showing transaction list of{" "}
          {monthFormatter.format(new Date(2000, selectedMonth - 1, 1))}{" "}
          {isValidYear ? selectedYear : "-"}.
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1 max-w-3xs">
            <AppDatePicker
              label="Select Transaction Day"
              placeholder="Pick a day"
              value={selectedDayDate}
              onValueChange={setSelectedDayDate}
              viewMode="day"
              lockedYear={selectedYear}
              lockedMonth={selectedMonth}
              withoutMargin
            />
          </div>
          <div className="text-right pb-0 flex">
            <p className="text-muted-foreground mb-1">Quantity: &nbsp;</p>
            <p className="font-semibold">
              {getSelectedDayQuantity()} {modeWording.cardAction}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleGoToSelectedDay}
            disabled={!selectedDayDate}
          >
            View Selected Day
          </Button>
          <TodayButton onGoToToday={handleGoToToday} activeDate={activeDate} />
        </div>
      </div>

      <TransactionTableSection
        table={table}
        emptyMessage={
          isLoading
            ? "Loading transactions..."
            : "No transaction found for this month."
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

export default TransactionMonthDetailPage;
