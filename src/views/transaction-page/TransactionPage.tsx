import { useEffect, useMemo, useState } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  useReactTable,
} from "@tanstack/react-table";
import { Eye } from "lucide-react";

import AppAutoComplete from "@/components/app-components/app-auto-complete/AppAutoComplete";
import AppDatePicker from "@/components/app-components/app-datepicker/AppDatePicker";
import AppModal from "@/components/app-components/app-modal/AppModal";
import AppSwitch from "@/components/app-components/app-switch/AppSwitch";
import AppTextField from "@/components/app-components/app-text-field/AppTextField";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore";
import { usePrivillegeAccess } from "@/helpers/hooks/usePrivillegeAccess/usePrivillegeAccess";
import { TransactionService } from "@/helpers/services/TransactionService";
import type {
  TransactionDetailRow,
  TransactionTypeColorOption,
} from "@/interfaces/ITransactionService";
import { transactionModeWordingList } from "./TransactionPage.constant";
import TransactionErrorModal from "./components/transaction-error-modal/TransactionErrorModal";
import TransactionTableSection from "./components/transaction-table-section/TransactionTableSection";
import { monthFormatter } from "./utilities";
import type { TransactionPageProps } from "./TransactionPage.interface";
import AppBackButton from "@/components/app-layout/app-back-button/AppBackButton";

type TransactionDayGroupedRow = {
  key: string;
  categoryName: string;
  typeName: string;
  typeCode: string;
  year: number;
  quantity: number;
  details: TransactionDetailRow[];
};

const TransactionPage = (props: TransactionPageProps) => {
  const { mode } = props;

  const today = useMemo(() => new Date(), []);
  const initialYear = today.getFullYear();
  const initialMonth = today.getMonth() + 1;
  const initialDay = today.getDate();
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser);
  const transactionAccess = usePrivillegeAccess(
    mode === "DO" ? "Delivery Order" : "Selling",
  );
  const canInsertTransaction = transactionAccess.canInsert;
  const canUpdateTransaction = transactionAccess.canUpdate;
  const canDeleteTransaction = transactionAccess.canDelete;

  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isShowSuccess, setIsShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isShowError, setIsShowError] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmAddModalOpen, setIsConfirmAddModalOpen] = useState(false);
  const [isEditDetailModalOpen, setIsEditDetailModalOpen] = useState(false);
  const [isConfirmUpdateDetailModalOpen, setIsConfirmUpdateDetailModalOpen] =
    useState(false);
  const [isConfirmDeleteDetailModalOpen, setIsConfirmDeleteDetailModalOpen] =
    useState(false);
  const [transactionList, setTransactionList] = useState<
    TransactionDetailRow[]
  >([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailRows, setSelectedDetailRows] = useState<
    TransactionDetailRow[]
  >([]);
  const [selectedDetailTitle, setSelectedDetailTitle] = useState("");
  const [typeColorOptionList, setTypeColorOptionList] = useState<
    TransactionTypeColorOption[]
  >([]);
  const [sellableTransactionList, setSellableTransactionList] = useState<
    TransactionDetailRow[]
  >([]);
  const [typeColorIdInput, setTypeColorIdInput] = useState("");
  const [noMesinInput, setNoMesinInput] = useState("");
  const [noRangkaInput, setNoRangkaInput] = useState("");
  const [yearInput, setYearInput] = useState("");
  const [dateDOInput, setDateDOInput] = useState<Date | undefined>(undefined);
  const [isRFSInput, setIsRFSInput] = useState(true);
  const [selectedPeriodYear, setSelectedPeriodYear] = useState(
    String(initialYear),
  );
  const [selectedPeriodMonth, setSelectedPeriodMonth] = useState(
    String(initialMonth),
  );
  const [selectedPeriodDay, setSelectedPeriodDay] = useState(
    String(initialDay),
  );
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("");
  const [selectedColorFilter, setSelectedColorFilter] = useState("");
  const [selectedYearFilter, setSelectedYearFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState({
    category: "",
    type: "",
    color: "",
    year: "",
    status: "",
  });
  const [appliedPeriodFilter, setAppliedPeriodFilter] = useState({
    year: String(initialYear),
    month: String(initialMonth),
    day: String(initialDay),
  });
  const [selectedSellTransactionId, setSelectedSellTransactionId] =
    useState("");
  const [editingTransactionId, setEditingTransactionId] = useState<number | null>(
    null,
  );
  const [deletingTransaction, setDeletingTransaction] =
    useState<TransactionDetailRow | null>(null);
  const [editNoMesinInput, setEditNoMesinInput] = useState("");
  const [editNoRangkaInput, setEditNoRangkaInput] = useState("");
  const [editYearInput, setEditYearInput] = useState("");
  const [editDateInput, setEditDateInput] = useState<Date | undefined>(undefined);
  const [editIsRFSInput, setEditIsRFSInput] = useState(true);

  const handleCloseErrorModal = () => {
    setErrorMessage("");
    setIsShowError(false);
  };

  const resetEditDetailForm = () => {
    setEditingTransactionId(null);
    setEditNoMesinInput("");
    setEditNoRangkaInput("");
    setEditYearInput("");
    setEditDateInput(undefined);
    setEditIsRFSInput(true);
  };

  const fillEditDetailForm = (transaction: TransactionDetailRow) => {
    setEditingTransactionId(transaction.transactionId);
    setEditNoMesinInput(transaction.noMesin || "");
    setEditNoRangkaInput(transaction.noRangka || "");
    setEditYearInput(String(transaction.year || ""));
    setEditDateInput(
      transaction.dateDO
        ? new Date(transaction.dateDO)
        : transaction.dateOUT
          ? new Date(transaction.dateOUT)
          : undefined,
    );
    setEditIsRFSInput(Boolean(transaction.isRFS));
  };

  const formatDateAsYmd = (value: Date) => {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  };

  const getSelectedDateString = () => {
    const currentYear = Number(selectedPeriodYear) || today.getFullYear();
    const parsedMonth = Number(selectedPeriodMonth);
    const resolvedMonth =
      Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
        ? parsedMonth
        : today.getMonth() + 1;
    const parsedDay = Number(selectedPeriodDay);
    const maxDay = new Date(currentYear, resolvedMonth, 0).getDate();
    const resolvedDay =
      Number.isInteger(parsedDay) && parsedDay >= 1 && parsedDay <= maxDay
        ? parsedDay
        : today.getDate();

    return `${currentYear}-${String(resolvedMonth).padStart(2, "0")}-${String(resolvedDay).padStart(2, "0")}`;
  };

  const handleFetchTypeColorOptions = async () => {
    await TransactionService.getTypeColorOptions()
      .then((res) => {
        setTypeColorOptionList(res.data || []);
      })
      .catch((error) => {
        setErrorMessage(error.message);
        setIsShowError(true);
      });
  };

  const handleFetchSellableTransactions = async () => {
    await TransactionService.getSellableTransactionsByDate({
      date: getSelectedDateString(),
    })
      .then((res) => {
        setSellableTransactionList(res.data || []);
      })
      .catch((error) => {
        setErrorMessage(error.message);
        setIsShowError(true);
      });
  };

  const resetInsertForm = () => {
    const now = new Date();

    setTypeColorIdInput("");
    setNoMesinInput("");
    setNoRangkaInput("");
    setYearInput(String(now.getFullYear()));
    setDateDOInput(now);
    setIsRFSInput(true);
    setSelectedSellTransactionId("");
  };

  const handleOpenAddModal = async () => {
    if (!canInsertTransaction) {
      setErrorMessage("You do not have permission to insert this transaction.");
      setIsShowError(true);
      return;
    }

    resetInsertForm();

    if (mode === "DO") {
      await handleFetchTypeColorOptions();
    }

    if (mode === "SELLING") {
      await handleFetchSellableTransactions();
    }

    setIsAddModalOpen(true);
  };

  const handleOpenEditDetailRow = (row: TransactionDetailRow) => {
    if (!canUpdateTransaction) {
      setErrorMessage("You do not have permission to update this transaction.");
      setIsShowError(true);
      return;
    }

    fillEditDetailForm(row);
    setIsEditDetailModalOpen(true);
  };

  const validateEditDetailForm = () => {
    if (!editingTransactionId) {
      setErrorMessage("No transaction selected to update.");
      setIsShowError(true);
      return false;
    }

    if (
      !editNoMesinInput.trim() ||
      !editNoRangkaInput.trim() ||
      !editYearInput.trim() ||
      !editDateInput
    ) {
      setErrorMessage(
        "Please fill No Mesin, No Rangka, Year, and transaction date.",
      );
      setIsShowError(true);
      return false;
    }

    const parsedYear = Number(editYearInput);

    if (!Number.isInteger(parsedYear) || parsedYear <= 0) {
      setErrorMessage("Year must be a valid number");
      setIsShowError(true);
      return false;
    }

    return true;
  };

  const handleOpenConfirmUpdateDetailModal = () => {
    if (!validateEditDetailForm()) {
      return;
    }

    setIsConfirmUpdateDetailModalOpen(true);
  };

  const handleOpenDeleteDetailRow = (row: TransactionDetailRow) => {
    if (!canDeleteTransaction) {
      setErrorMessage("You do not have permission to delete this transaction.");
      setIsShowError(true);
      return;
    }

    setDeletingTransaction(row);
    setIsConfirmDeleteDetailModalOpen(true);
  };

  const handleOpenConfirmAddModal = () => {
    if (mode === "DO") {
      if (
        !typeColorIdInput.trim() ||
        !noMesinInput.trim() ||
        !noRangkaInput.trim() ||
        !yearInput.trim() ||
        !dateDOInput
      ) {
        setErrorMessage(
          "Please fill Type and Color, No Mesin, No Rangka, Year, and Date DO",
        );
        setIsShowError(true);
        return;
      }
    }

    if (mode === "SELLING" && !selectedSellTransactionId.trim()) {
      setErrorMessage("Please select transaction to sell");
      setIsShowError(true);
      return;
    }

    setIsConfirmAddModalOpen(true);
  };

  const handleApplyFilters = () => {
    setAppliedPeriodFilter({
      year: selectedPeriodYear,
      month: selectedPeriodMonth,
      day: selectedPeriodDay,
    });
    setAppliedFilter({
      category: selectedCategoryFilter,
      type: selectedTypeFilter,
      color: selectedColorFilter,
      year: selectedYearFilter,
      status: selectedStatusFilter,
    });
    setIsFilterApplied(true);
  };

  const handleInsertTransaction = async () => {
    const userId = authenticatedUser?.userId;

    if (!userId) {
      setErrorMessage("Authenticated user not found. Please login again.");
      setIsShowError(true);
      return;
    }

    if (mode === "DO") {
      const parsedTypeColorId = Number(typeColorIdInput);
      const parsedYear = Number(yearInput);

      if (!Number.isInteger(parsedTypeColorId) || parsedTypeColorId <= 0) {
        setErrorMessage("Type and Color must be selected");
        setIsShowError(true);
        return;
      }

      if (!Number.isInteger(parsedYear) || parsedYear <= 0) {
        setErrorMessage("Year must be a valid number");
        setIsShowError(true);
        return;
      }

      if (!dateDOInput) {
        setErrorMessage("Date DO is required");
        setIsShowError(true);
        return;
      }

      await TransactionService.insertTransaction({
        typeColorId: parsedTypeColorId,
        noMesin: noMesinInput.trim(),
        noRangka: noRangkaInput.trim(),
        year: parsedYear,
        isRFS: isRFSInput,
        dateDO: formatDateAsYmd(dateDOInput),
        dateOUT: null,
        userIn: userId,
        setIsLoading: setIsActionLoading,
      })
        .then(() => {
          setSuccessMessage("Delivery Order has been added successfully.");
          setIsShowSuccess(true);
          setIsConfirmAddModalOpen(false);
          setIsAddModalOpen(false);
          resetInsertForm();
          handleFetchTransactionByDay();
        })
        .catch((error) => {
          setErrorMessage(error.message);
          setIsShowError(true);
        });

      return;
    }

    if (mode === "SELLING") {
      const parsedTransactionId = Number(selectedSellTransactionId);

      if (!Number.isInteger(parsedTransactionId) || parsedTransactionId <= 0) {
        setErrorMessage("Transaction to sell must be selected");
        setIsShowError(true);
        return;
      }

      await TransactionService.updateTransactionAsSold({
        transactionId: parsedTransactionId,
        dateOUT: getSelectedDateString(),
        userUp: userId,
        updatedAt: new Date().toISOString(),
        setIsLoading: setIsActionLoading,
      })
        .then(() => {
          setSuccessMessage("Transaction has been marked as sold successfully.");
          setIsShowSuccess(true);
          setIsConfirmAddModalOpen(false);
          setIsAddModalOpen(false);
          resetInsertForm();
          handleFetchTransactionByDay();
        })
        .catch((error) => {
          setErrorMessage(error.message);
          setIsShowError(true);
        });
    }
  };

  const handleOpenDetailModal = (row: TransactionDayGroupedRow) => {
    setSelectedDetailRows(row.details);
    setSelectedDetailTitle(
      `${row.categoryName} - ${row.typeName} (${row.typeCode})`,
    );
    setIsDetailModalOpen(true);
  };

  const handleUpdateDetailTransaction = async () => {
    const userId = authenticatedUser?.userId;

    if (!userId) {
      setErrorMessage("Authenticated user not found. Please login again.");
      setIsShowError(true);
      return;
    }

    if (!validateEditDetailForm()) {
      return;
    }

    const transactionId = editingTransactionId;
    const dateInput = editDateInput;

    if (!transactionId || !dateInput) {
      setErrorMessage("No transaction selected to update.");
      setIsShowError(true);
      return;
    }

    const parsedYear = Number(editYearInput);

    const dateValue = formatDateAsYmd(dateInput);

    await TransactionService.updateTransaction({
      transactionId,
      noMesin: editNoMesinInput.trim(),
      noRangka: editNoRangkaInput.trim(),
      year: parsedYear,
      isRFS: editIsRFSInput,
      dateDO: mode === "DO" ? dateValue : null,
      dateOUT: mode === "SELLING" ? dateValue : null,
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading: setIsActionLoading,
    })
      .then(() => {
        setSuccessMessage("Transaction updated successfully.");
        setIsShowSuccess(true);
        setIsConfirmUpdateDetailModalOpen(false);
        setIsEditDetailModalOpen(false);
        resetEditDetailForm();
        handleFetchTransactionByDay();
      })
      .catch((error) => {
        setErrorMessage(error.message);
        setIsShowError(true);
      });
  };

  const handleDeleteDetailTransaction = async () => {
    const userId = authenticatedUser?.userId;

    if (!userId) {
      setErrorMessage("Authenticated user not found. Please login again.");
      setIsShowError(true);
      return;
    }

    if (!deletingTransaction) {
      setErrorMessage("No transaction selected to delete.");
      setIsShowError(true);
      return;
    }

    await TransactionService.deleteTransaction({
      transactionId: deletingTransaction.transactionId,
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading: setIsActionLoading,
    })
      .then(() => {
        setSuccessMessage("Transaction deleted successfully.");
        setIsShowSuccess(true);
        setIsConfirmDeleteDetailModalOpen(false);
        setDeletingTransaction(null);
        handleFetchTransactionByDay();
      })
      .catch((error) => {
        setErrorMessage(error.message);
        setIsShowError(true);
      });
  };

  const handleFetchTransactionByDay = async () => {
    if (!isFilterApplied) {
      setTransactionList([]);
      return;
    }

    const activeFilter = isFilterApplied
      ? appliedFilter
      : {
        category: "",
        type: "",
        color: "",
        year: "",
        status: "",
      };
    const parsedTransactionYear = Number(activeFilter.year);
    const parsedPeriodYear = Number(appliedPeriodFilter.year);
    const parsedPeriodMonth = Number(appliedPeriodFilter.month);
    const parsedPeriodDay = Number(appliedPeriodFilter.day);

    const periodYear = Number.isInteger(parsedPeriodYear) && parsedPeriodYear > 0
      ? parsedPeriodYear
      : today.getFullYear();
    const periodMonth =
      Number.isInteger(parsedPeriodMonth)
      && parsedPeriodMonth >= 1
      && parsedPeriodMonth <= 12
        ? parsedPeriodMonth
        : undefined;
    const periodDay =
      periodMonth
      && Number.isInteger(parsedPeriodDay)
      && parsedPeriodDay >= 1
      && parsedPeriodDay <= new Date(periodYear, periodMonth, 0).getDate()
        ? parsedPeriodDay
        : undefined;

    await TransactionService.getTransactionsByModeYear({
      mode,
      year: periodYear,
      month: periodMonth,
      day: periodDay,
      categoryName: activeFilter.category || undefined,
      typeName: activeFilter.type || undefined,
      colorName: activeFilter.color || undefined,
      transactionYear:
        activeFilter.year && Number.isInteger(parsedTransactionYear)
          ? parsedTransactionYear
          : undefined,
      status:
        activeFilter.status === "RFS" || activeFilter.status === "NRFS"
          ? activeFilter.status
          : undefined,
      setIsLoading: setIsTableLoading,
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
  const parsedSelectedPeriodMonth = useMemo(
    () => Number(selectedPeriodMonth),
    [selectedPeriodMonth],
  );
  const isMonthSelected = useMemo(
    () =>
      Number.isInteger(parsedSelectedPeriodMonth)
      && parsedSelectedPeriodMonth >= 1
      && parsedSelectedPeriodMonth <= 12,
    [parsedSelectedPeriodMonth],
  );
  const maxDayInSelectedMonth = useMemo(() => {
    if (!isMonthSelected) {
      return 31;
    }

    const periodYear = Number(selectedPeriodYear) || today.getFullYear();

    return new Date(periodYear, parsedSelectedPeriodMonth, 0).getDate();
  }, [isMonthSelected, parsedSelectedPeriodMonth, selectedPeriodYear, today]);

  const periodYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearRange = Array.from({ length: 16 }, (_, index) => currentYear - 10 + index);

    return yearRange.map((yearValue) => ({
      value: String(yearValue),
      label: String(yearValue),
    }));
  }, []);

  const periodMonthOptions = useMemo(() => {
    const monthOptions = Array.from({ length: 12 }, (_, index) => {
      const monthValue = index + 1;

      return {
        value: String(monthValue),
        label: monthFormatter.format(new Date(2000, index, 1)),
      };
    });

    return [{ value: "", label: "All Month" }, ...monthOptions];
  }, []);

  const periodDayOptions = useMemo(() => {
    const dayOptions = Array.from({ length: maxDayInSelectedMonth }, (_, index) => {
      const dayValue = index + 1;

      return {
        value: String(dayValue),
        label: String(dayValue),
      };
    });

    return [{ value: "", label: "All Day" }, ...dayOptions];
  }, [maxDayInSelectedMonth]);

  const typeColorAutoCompleteOptions = useMemo(() => {
    return typeColorOptionList.map((option) => ({
      value: String(option.typeColorId),
      label: `${option.typeName || "-"} (${option.typeCode || "-"}) / ${option.colorName || "-"}`,
    }));
  }, [typeColorOptionList]);

  const sellableTransactionOptions = useMemo(() => {
    return sellableTransactionList.map((transaction) => ({
      value: String(transaction.transactionId),
      label: `${transaction.noMesin} / ${transaction.noRangka} - ${transaction.typeName || "-"} (${transaction.typeCode || "-"})`,
    }));
  }, [sellableTransactionList]);

  const dayTransactionList = useMemo(() => {
    if (mode === "SELLING") {
      return transactionList.filter((transaction) => transaction.isRFS);
    }

    return transactionList;
  }, [mode, transactionList]);

  const categoryOptions = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(dayTransactionList.map((item) => item.categoryName || "-")),
    ).sort((a, b) => a.localeCompare(b));

    return [
      { value: "", label: "All" },
      ...uniqueCategories.map((category) => ({
      value: category,
      label: category,
      })),
    ];
  }, [dayTransactionList]);

  const typeOptions = useMemo(() => {
    const filteredByCategory = dayTransactionList.filter((item) => {
      if (!selectedCategoryFilter) {
        return true;
      }

      return (item.categoryName || "-") === selectedCategoryFilter;
    });

    const uniqueTypes = Array.from(
      new Set(filteredByCategory.map((item) => item.typeName || "-")),
    ).sort((a, b) => a.localeCompare(b));

    return [
      { value: "", label: "All" },
      ...uniqueTypes.map((typeName) => ({
      value: typeName,
      label: typeName,
      })),
    ];
  }, [dayTransactionList, selectedCategoryFilter]);

  const colorOptions = useMemo(() => {
    const filteredRows = dayTransactionList.filter((item) => {
      if (
        selectedCategoryFilter
        && (item.categoryName || "-") !== selectedCategoryFilter
      ) {
        return false;
      }

      if (selectedTypeFilter && (item.typeName || "-") !== selectedTypeFilter) {
        return false;
      }

      return true;
    });

    const uniqueColors = Array.from(
      new Set(filteredRows.map((item) => item.colorName || "-")),
    ).sort((a, b) => a.localeCompare(b));

    return [
      { value: "", label: "All" },
      ...uniqueColors.map((colorName) => ({
      value: colorName,
      label: colorName,
      })),
    ];
  }, [dayTransactionList, selectedCategoryFilter, selectedTypeFilter]);

  const yearOptions = useMemo(() => {
    const filteredRows = dayTransactionList.filter((item) => {
      if (
        selectedCategoryFilter
        && (item.categoryName || "-") !== selectedCategoryFilter
      ) {
        return false;
      }

      if (selectedTypeFilter && (item.typeName || "-") !== selectedTypeFilter) {
        return false;
      }

      if (selectedColorFilter && (item.colorName || "-") !== selectedColorFilter) {
        return false;
      }

      return true;
    });

    const uniqueYears = Array.from(
      new Set(filteredRows.map((item) => String(item.year))),
    ).sort((a, b) => Number(a) - Number(b));

    return [
      { value: "", label: "All" },
      ...uniqueYears.map((yearValue) => ({
      value: yearValue,
      label: yearValue,
      })),
    ];
  }, [dayTransactionList, selectedCategoryFilter, selectedTypeFilter, selectedColorFilter]);

  const statusOptions = mode === "SELLING"
    ? [
      { value: "", label: "All" },
      { value: "RFS", label: "RFS" },
    ]
    : [
      { value: "", label: "All" },
      { value: "RFS", label: "RFS" },
      { value: "NRFS", label: "NRFS" },
    ];

  const isTypeFilterDisabled = !selectedCategoryFilter;
  const isColorFilterDisabled = !selectedTypeFilter;
  const isDayPickerDisabled = !isMonthSelected;

  const filteredTransactionList = useMemo(() => {
    if (!isFilterApplied) {
      return [];
    }

    return dayTransactionList.filter((transaction) => {
      if (
        appliedFilter.category
        && (transaction.categoryName || "-") !== appliedFilter.category
      ) {
        return false;
      }

      if (
        appliedFilter.type
        && (transaction.typeName || "-") !== appliedFilter.type
      ) {
        return false;
      }

      if (
        appliedFilter.color
        && (transaction.colorName || "-") !== appliedFilter.color
      ) {
        return false;
      }

      if (appliedFilter.year && String(transaction.year) !== appliedFilter.year) {
        return false;
      }

      if (appliedFilter.status === "RFS" && !transaction.isRFS) {
        return false;
      }

      if (appliedFilter.status === "NRFS" && transaction.isRFS) {
        return false;
      }

      return true;
    });
  }, [appliedFilter, dayTransactionList, isFilterApplied]);

  const groupedTransactionRows = useMemo<TransactionDayGroupedRow[]>(() => {
    const groupedMap = new Map<string, TransactionDayGroupedRow>();

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

  const transactionColumns: ColumnDef<TransactionDayGroupedRow>[] = [
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
    handleFetchTransactionByDay();
  }, [
    mode,
    isFilterApplied,
    appliedFilter,
    appliedPeriodFilter,
  ]);

  useEffect(() => {
    setIsFilterApplied(false);
  }, [mode, selectedPeriodYear, selectedPeriodMonth, selectedPeriodDay]);

  useEffect(() => {
    if (isMonthSelected) {
      return;
    }

    if (selectedPeriodDay) {
      setSelectedPeriodDay("");
    }
  }, [isMonthSelected, selectedPeriodDay]);

  useEffect(() => {
    setIsFilterApplied(false);
  }, [
    selectedCategoryFilter,
    selectedTypeFilter,
    selectedColorFilter,
    selectedYearFilter,
    selectedStatusFilter,
  ]);

  return (
    <div>
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-3">
          <AppBackButton />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
            {modeWording.title}
          </h1>
        </div>
        <p className="mb-3 text-muted-foreground">
          Use year, month, and day picker below (with All Month/All Day option)
          in a single page.
        </p>
      </div>

      <div className="mb-6">
        <div className="mb-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <AppAutoComplete
            label="Transaction Year"
            placeholder="Select year"
            searchPlaceholder="Search year"
            emptyMessage="No year found"
            isLoading={isTableLoading}
            value={selectedPeriodYear}
            options={periodYearOptions}
            onValueChange={setSelectedPeriodYear}
          />
          <AppAutoComplete
            label="Transaction Month"
            placeholder="Select month"
            searchPlaceholder="Search month"
            emptyMessage="No month found"
            isLoading={isTableLoading}
            value={selectedPeriodMonth}
            options={periodMonthOptions}
            onValueChange={(value) => {
              setSelectedPeriodMonth(value);
              setSelectedPeriodDay("");
            }}
          />
          <AppAutoComplete
            label="Transaction Day"
            placeholder={isDayPickerDisabled ? "Choose month first" : "Select day"}
            searchPlaceholder="Search day"
            emptyMessage={isDayPickerDisabled ? "Choose month first" : "No day found"}
            isLoading={isTableLoading}
            disabled={isDayPickerDisabled}
            value={selectedPeriodDay}
            options={periodDayOptions}
            onValueChange={setSelectedPeriodDay}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <AppAutoComplete
            label="Category"
            placeholder="Select category"
            searchPlaceholder="Search category"
            emptyMessage="No category found"
            isLoading={isTableLoading}
            value={selectedCategoryFilter}
            options={categoryOptions}
            onValueChange={(value) => {
              setSelectedCategoryFilter(value);
              setSelectedTypeFilter("");
              setSelectedColorFilter("");
              setSelectedYearFilter("");
            }}
          />
          <AppAutoComplete
            label="Type"
            placeholder={isTypeFilterDisabled ? "Choose category first" : "Select type"}
            searchPlaceholder="Search type"
            emptyMessage={isTypeFilterDisabled ? "Choose category first" : "No type found"}
            isLoading={isTableLoading}
            disabled={isTypeFilterDisabled}
            value={selectedTypeFilter}
            options={typeOptions}
            onValueChange={(value) => {
              setSelectedTypeFilter(value);
              setSelectedColorFilter("");
              setSelectedYearFilter("");
            }}
          />
          <AppAutoComplete
            label="Color"
            placeholder={isColorFilterDisabled ? "Choose type first" : "Select color"}
            searchPlaceholder="Search color"
            emptyMessage={isColorFilterDisabled ? "Choose type first" : "No color found"}
            isLoading={isTableLoading}
            disabled={isColorFilterDisabled}
            value={selectedColorFilter}
            options={colorOptions}
            onValueChange={(value) => {
              setSelectedColorFilter(value);
              setSelectedYearFilter("");
            }}
          />
          <AppAutoComplete
            label="Year"
            placeholder="Select year"
            searchPlaceholder="Search year"
            emptyMessage="No year found"
            isLoading={isTableLoading}
            value={selectedYearFilter}
            options={yearOptions}
            onValueChange={setSelectedYearFilter}
          />
          <AppAutoComplete
            label="Status"
            placeholder="Select status"
            searchPlaceholder="Search status"
            emptyMessage="No status found"
            isLoading={isTableLoading}
            value={selectedStatusFilter}
            options={statusOptions}
            onValueChange={setSelectedStatusFilter}
          />
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Pick period in this page using Year, Month, Day. Month and Day can be
          set to All.
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Choose Category first to enable Type filter, then choose Type first to
          enable Color filter.
        </p>

        <div className="mt-3 flex justify-end gap-2">
          {canInsertTransaction ? (
            <Button type="button" variant="outline" onClick={handleOpenAddModal}>
              Add New
            </Button>
          ) : null}
          <Button type="button" onClick={handleApplyFilters}>
            Apply
          </Button>
        </div>
      </div>

      <TransactionTableSection
        table={table}
        emptyMessage={
          isTableLoading
            ? "Loading transactions..."
            : isFilterApplied
              ? "No transaction found for selected filters."
              : "Please set filters and click Apply."
        }
        detailOpen={isDetailModalOpen}
        onDetailOpenChange={setIsDetailModalOpen}
        detailTitle={selectedDetailTitle}
        detailRows={selectedDetailRows}
        canUpdateDetail={canUpdateTransaction}
        canDeleteDetail={canDeleteTransaction}
        onEditDetailRow={handleOpenEditDetailRow}
        onDeleteDetailRow={handleOpenDeleteDetailRow}
      />

      <AppModal
        open={isAddModalOpen}
        onOpenChange={(open: boolean) => {
          setIsAddModalOpen(open);

          if (!open) {
            resetInsertForm();
          }
        }}
        title={mode === "DO" ? "Add Delivery Order" : "Add Selling"}
        description={mode === "DO" ? "Fill the form below to add delivery order" : "Select transaction to mark as sold"}
        classNames={{
          content: "sm:max-w-2xl",
        }}
        showCloseButton={true}
        footer={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                resetInsertForm();
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleOpenConfirmAddModal}>
              Save
            </Button>
          </div>
        }
      >
        {mode === "DO" ? (
          <>
            <AppAutoComplete
              label="Type and Color"
              placeholder="Select type and color"
              searchPlaceholder="Search type and color"
              emptyMessage="No type and color found"
              required={true}
              value={typeColorIdInput}
              options={typeColorAutoCompleteOptions}
              onValueChange={(value) => {
                setTypeColorIdInput(value);
              }}
            />
            <AppTextField
              label="No Rangka"
              placeholder="Input no rangka"
              required={true}
              value={noRangkaInput}
              onChange={setNoRangkaInput}
              isCapital
            />
            <AppTextField
              label="No Mesin"
              placeholder="Input no mesin"
              required={true}
              value={noMesinInput}
              onChange={setNoMesinInput}
              isCapital
            />
            <AppTextField
              label="Year"
              placeholder="2026"
              required={true}
              type="number"
              value={yearInput}
              onChange={setYearInput}
            />
            <AppDatePicker
              label="Date DO"
              placeholder="Pick date DO"
              required={true}
              value={dateDOInput}
              onValueChange={setDateDOInput}
            />
            <AppSwitch
              label={
                isRFSInput
                  ? "Ready For Sale (RFS)"
                  : "Not Ready For Sale (NRFS)"
              }
              checked={isRFSInput}
              onCheckedChange={setIsRFSInput}
              withoutMargin
            />
          </>
        ) : (
          <>
            <AppAutoComplete
              label="Transaction to Sell"
              placeholder="Select transaction"
              searchPlaceholder="Search no mesin / no rangka"
              emptyMessage="No transaction available to sell"
              required={true}
              value={selectedSellTransactionId}
              options={sellableTransactionOptions}
              onValueChange={(value) => {
                setSelectedSellTransactionId(value);
              }}
            />
            {!sellableTransactionOptions.length ? (
              <p className="text-sm text-muted-foreground">
                No available transaction can be sold on this date.
              </p>
            ) : null}
          </>
        )}
      </AppModal>

      <AppModal
        open={isConfirmAddModalOpen}
        onOpenChange={setIsConfirmAddModalOpen}
        title={
          mode === "DO" ? "Confirm Add Delivery Order" : "Confirm Selling"
        }
        showCloseButton={true}
        footer={
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              disabled={isActionLoading}
              onClick={() => setIsConfirmAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isActionLoading}
              onClick={handleInsertTransaction}
            >
              {isActionLoading ? "Saving..." : "Confirm"}
            </Button>
          </div>
        }
      >
        <p className="text-sm">
          {mode === "DO"
            ? "Add Delivery Order"
            : "Mark selected transaction as sold"}{" "}
          for <strong>{getSelectedDateString()}</strong>?
        </p>
      </AppModal>

      <AppModal
        open={isEditDetailModalOpen}
        onOpenChange={(open) => {
          setIsEditDetailModalOpen(open);

          if (!open) {
            setIsConfirmUpdateDetailModalOpen(false);
            resetEditDetailForm();
          }
        }}
        title={mode === "DO" ? "Edit Delivery Order" : "Edit Selling"}
        showCloseButton={true}
        classNames={{
          content: "sm:max-w-2xl",
        }}
        footer={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isActionLoading}
              onClick={() => {
                setIsEditDetailModalOpen(false);
                setIsConfirmUpdateDetailModalOpen(false);
                resetEditDetailForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isActionLoading}
              onClick={handleOpenConfirmUpdateDetailModal}
            >
              Update
            </Button>
          </div>
        }
      >
        <AppTextField
          label="No Rangka"
          placeholder="Input no rangka"
          required={true}
          value={editNoRangkaInput}
          onChange={setEditNoRangkaInput}
          isCapital
        />
        <AppTextField
          label="No Mesin"
          placeholder="Input no mesin"
          required={true}
          value={editNoMesinInput}
          onChange={setEditNoMesinInput}
          isCapital
        />
        <AppTextField
          label="Year"
          placeholder="2026"
          required={true}
          type="number"
          value={editYearInput}
          onChange={setEditYearInput}
        />
        <AppDatePicker
          label={mode === "DO" ? "Date DO" : "Date OUT"}
          placeholder={mode === "DO" ? "Pick date DO" : "Pick date OUT"}
          required={true}
          value={editDateInput}
          onValueChange={setEditDateInput}
        />
        <AppSwitch
          label={
            editIsRFSInput
              ? "Ready For Sale (RFS)"
              : "Not Ready For Sale (NRFS)"
          }
          checked={editIsRFSInput}
          onCheckedChange={setEditIsRFSInput}
          withoutMargin
        />
      </AppModal>

      <AppModal
        open={isConfirmUpdateDetailModalOpen}
        onOpenChange={setIsConfirmUpdateDetailModalOpen}
        title={mode === "DO" ? "Confirm Update Delivery Order" : "Confirm Update Selling"}
        showCloseButton={true}
        footer={
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              disabled={isActionLoading}
              onClick={() => setIsConfirmUpdateDetailModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isActionLoading}
              onClick={handleUpdateDetailTransaction}
            >
              {isActionLoading ? "Saving..." : "Confirm"}
            </Button>
          </div>
        }
      >
        <p className="text-sm">
          Update transaction <strong>{editNoMesinInput || "-"}</strong> /{" "}
          <strong>{editNoRangkaInput || "-"}</strong>?
        </p>
      </AppModal>

      <AppModal
        open={isConfirmDeleteDetailModalOpen}
        onOpenChange={setIsConfirmDeleteDetailModalOpen}
        title={mode === "DO" ? "Confirm Delete Delivery Order" : "Confirm Delete Selling"}
        showCloseButton={true}
        footer={
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              disabled={isActionLoading}
              onClick={() => {
                setIsConfirmDeleteDetailModalOpen(false);
                setDeletingTransaction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isActionLoading}
              onClick={handleDeleteDetailTransaction}
            >
              {isActionLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        }
      >
        <p className="text-sm">
          Delete transaction <strong>{deletingTransaction?.noMesin || "-"}</strong> /{" "}
          <strong>{deletingTransaction?.noRangka || "-"}</strong>?
        </p>
      </AppModal>

      <TransactionErrorModal
        open={isShowError}
        onOpenChange={setIsShowError}
        errorMessage={errorMessage}
        onClose={handleCloseErrorModal}
      />

      <AppModal
        open={isShowSuccess}
        onOpenChange={setIsShowSuccess}
        title="Success"
        showCloseButton={true}
        footer={
          <div className="flex w-full justify-center">
            <Button
              type="button"
              onClick={() => {
                setSuccessMessage("");
                setIsShowSuccess(false);
              }}
            >
              OK
            </Button>
          </div>
        }
      >
        <p>{successMessage}</p>
      </AppModal>
    </div>
  );
};

export default TransactionPage;
