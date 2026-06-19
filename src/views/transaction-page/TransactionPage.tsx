import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  useReactTable,
} from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { routes } from "@/constants/paths";

import AppAutoComplete from "@/components/app-components/app-auto-complete/AppAutoComplete";
import AppDatePicker from "@/components/app-components/app-datepicker/AppDatePicker";
import AppModal from "@/components/app-components/app-modal/AppModal";
import AppSwitch from "@/components/app-components/app-switch/AppSwitch";
import AppTextField from "@/components/app-components/app-text-field/AppTextField";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore";
import { usePrivilegeAccess } from "@/helpers/hooks/usePrivilegeAccess/usePrivilegeAccess";
import { SellingTypeService } from "@/helpers/services/SellingTypeService";
import { TransactionService } from "@/helpers/services/TransactionService";
import { VolumeService } from "@/helpers/services/VolumeService";
import type {
  TransactionDetailRow,
  TransactionTypeColorOption,
} from "@/interfaces/ITransactionService";
import { FormDataInitial, statusOptions, transactionWording } from "./TransactionPage.constant";
import TransactionStatusModal from "./components/transaction-status-modal/TransactionStatusModal";
import TransactionTableSection from "./components/transaction-table-section/TransactionTableSection";
import { monthFormatter } from "./utilities";
import type { IFormData, TransactionDayGroupedRow } from "./TransactionPage.interface";
import type { AutoCompleteOption } from "@/components/app-components/app-auto-complete/AppAutoComplete.interface";
import { useIsMobile } from "@/helpers/hooks/useMobile/useMobile";
import { formatDateAsYmd } from "@/lib/utils";

const TransactionPage = () => {
  // Base / Access
  const pageWording = transactionWording;

  const today = useMemo(() => new Date(), []);
  const initialYear = today.getFullYear();
  const initialMonth = today.getMonth() + 1;
  const initialDay = today.getDate();
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser);
  const transactionAccess = usePrivilegeAccess("Transaction");
  const canInsertTransaction = transactionAccess.canInsert;
  const canUpdateTransaction = transactionAccess.canUpdate;
  const canDeleteTransaction = transactionAccess.canDelete;
  const canSellTransaction = transactionAccess.canUpdate;

  // State
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isTypeColorOptionsLoading, setIsTypeColorOptionsLoading] = useState(false);
  const [isCategoryOptionsLoading, setIsCategoryOptionsLoading] = useState(false);
  const [isTypeOptionsLoading, setIsTypeOptionsLoading] = useState(false);
  const [isColorOptionsLoading, setIsColorOptionsLoading] = useState(false);
  const [isYearOptionsLoading, setIsYearOptionsLoading] = useState(false);
  const [isSellingTypeOptionsLoading, setIsSellingTypeOptionsLoading] = useState(false);
  const [isVolumeOptionsLoading, setIsVolumeOptionsLoading] = useState(false);
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
  const [isConfirmSellDetailModalOpen, setIsConfirmSellDetailModalOpen] =
    useState(false);
  const [isSellingDetailModalOpen, setIsSellingDetailModalOpen] =
    useState(false);
  const [isEditingSellingDetail, setIsEditingSellingDetail] = useState(false);
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
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("All");
  const [selectedColorFilter, setSelectedColorFilter] = useState("All");
  const [selectedYearFilter, setSelectedYearFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("RFS");
  const [isSoldFilter, setIsSoldFilter] = useState(false);
  const [categoryFilterOptions, setCategoryFilterOptions] = useState<AutoCompleteOption[]>([
    { value: "All", label: "All" },
  ]);
  const [typeFilterOptions, setTypeFilterOptions] = useState<AutoCompleteOption[]>([
    { value: "All", label: "All" },
  ]);
  const [colorFilterOptions, setColorFilterOptions] = useState<AutoCompleteOption[]>([
    { value: "All", label: "All" },
  ]);
  const [yearFilterOptions, setYearFilterOptions] = useState<AutoCompleteOption[]>([
    { value: "All", label: "All" },
  ]);
  const [sellingTypeOptions, setSellingTypeOptions] = useState<AutoCompleteOption[]>([]);
  const [sellingVolumeOptions, setSellingVolumeOptions] = useState<AutoCompleteOption[]>([]);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(10);
  const [appliedFilter, setAppliedFilter] = useState<IFormData>(FormDataInitial);
  const [appliedPeriodFilter, setAppliedPeriodFilter] = useState({
    year: String(initialYear),
    month: String(initialMonth),
    day: String(initialDay),
  });
  const [editingTransactionId, setEditingTransactionId] = useState<number | null>(
    null,
  );
  const [deletingTransaction, setDeletingTransaction] =
    useState<TransactionDetailRow | null>(null);
  const [sellingTransaction, setSellingTransaction] =
    useState<TransactionDetailRow | null>(null);
  const [editNoMesinInput, setEditNoMesinInput] = useState("");
  const [editNoRangkaInput, setEditNoRangkaInput] = useState("");
  const [editTypeColorIdInput, setEditTypeColorIdInput] = useState("");
  const [editYearInput, setEditYearInput] = useState("");
  const [editDateInput, setEditDateInput] = useState<Date | undefined>(undefined);
  const [editIsRFSInput, setEditIsRFSInput] = useState(true);
  const [sellingVolumeInput, setSellingVolumeInput] = useState("");
  const [sellingTypeInput, setSellingTypeInput] = useState("");
  const [sellingNumberInput, setSellingNumberInput] = useState("");
  const [sellingNameInput, setSellingNameInput] = useState("");
  const [sellingAddressInput, setSellingAddressInput] = useState("");
  const [sellingPhoneInput, setSellingPhoneInput] = useState("");
  const [sellingDateOutInput, setSellingDateOutInput] = useState<Date | undefined>(today);

  // Utility
  const handleCloseErrorModal = () => {
    setErrorMessage("");
    setIsShowError(false);
  };

  const handleCloseSuccessModal = () => {
    setSuccessMessage("");
    setIsShowSuccess(false);
    setIsConfirmUpdateDetailModalOpen(false);
    setIsConfirmSellDetailModalOpen(false);
    setIsSellingDetailModalOpen(false);
    setIsEditDetailModalOpen(false);
    setIsDetailModalOpen(false);
    resetEditDetailForm();
    resetSellingDetailForm();
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

  // Reset Form
  const resetInsertForm = () => {
    const now = new Date();

    setTypeColorIdInput("");
    setNoMesinInput("");
    setNoRangkaInput("");
    setYearInput(String(now.getFullYear()));
    setDateDOInput(now);
    setIsRFSInput(true);
  };

  const resetEditDetailForm = () => {
    setEditingTransactionId(null);
    setEditNoMesinInput("");
    setEditNoRangkaInput("");
    setEditTypeColorIdInput("");
    setEditYearInput("");
    setEditDateInput(undefined);
    setEditIsRFSInput(true);
  };

  const resetSellingDetailForm = () => {
    setSellingVolumeInput("");
    setSellingTypeInput("");
    setSellingNumberInput("");
    setSellingNameInput("");
    setSellingAddressInput("");
    setSellingPhoneInput("");
    setSellingDateOutInput(new Date());
    setIsEditingSellingDetail(false);
  };

  const fillSellingDetailForm = (transaction: TransactionDetailRow) => {
    setSellingVolumeInput(transaction.volumeId ? String(transaction.volumeId) : "");
    setSellingTypeInput(transaction.sellingTypeId ? String(transaction.sellingTypeId) : "");
    setSellingNumberInput(transaction.sellingNumber || "");
    setSellingNameInput(transaction.name || "");
    setSellingAddressInput(transaction.address || "");
    setSellingPhoneInput(transaction.phone || "");
    setSellingDateOutInput(transaction.dateOUT ? new Date(transaction.dateOUT) : new Date());
  };

  const fillEditDetailForm = (transaction: TransactionDetailRow) => {
    setEditingTransactionId(transaction.transactionId);
    setEditNoMesinInput(transaction.noMesin || "");
    setEditNoRangkaInput(transaction.noRangka || "");
    setEditTypeColorIdInput(String(transaction.typeColorId || ""));
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

  // API Call
  const handleFetchTypeColorOptions = useCallback(async () => {
    await TransactionService.getTypeColorOptions({
      setIsLoading: setIsTypeColorOptionsLoading,
    })
      .then((res) => {
        setTypeColorOptionList(res.data || []);
      })
      .catch((error) => {
        setErrorMessage(error.error.message);
        setIsShowError(true);
      });
  }, []);

  const handleFetchCategoryFilterOptions = useCallback(async () => {
    await TransactionService.getCategoryOptions({
      setIsLoading: setIsCategoryOptionsLoading,
    })
      .then((res) => {
        setCategoryFilterOptions([{ value: "All", label: "All" }, ...(res.data || [])]);
      })
      .catch((error) => {
        setErrorMessage(error.error.message);
        setIsShowError(true);
      });
  }, []);

  const handleFetchTypeFilterOptions = useCallback(async (categoryId: string) => {
    if (!categoryId) {
      setTypeFilterOptions([{ value: "All", label: "All" }]);
      return;
    }

    await TransactionService.getTypeOptionsByCategory({
      categoryId,
      setIsLoading: setIsTypeOptionsLoading,
    })
      .then((res) => {
        setTypeFilterOptions([{ value: "All", label: "All" }, ...(res.data || [])]);
      })
      .catch((error) => {
        setErrorMessage(error.error.message);
        setIsShowError(true);
      });
  }, []);

  const handleFetchColorFilterOptions = useCallback(async (typeId: string, categoryId: string) => {
    if (!typeId) {
      setColorFilterOptions([{ value: "All", label: "All" }]);
      return;
    }

    await TransactionService.getColorOptionsByType({
      categoryId: categoryId,
      typeId: typeId,
      setIsLoading: setIsColorOptionsLoading,
    })
      .then((res) => {
        setColorFilterOptions([{ value: "All", label: "All" }, ...(res.data || [])]);
      })
      .catch((error) => {
        setErrorMessage(error.error.message);
        setIsShowError(true);
      });
  }, []);

  const handleFetchYearFilterOptions = useCallback(async (
    categoryId: string,
    typeId: string,
    colorId: string,
  ) => {
    await TransactionService.getYearFilterOptions({
      categoryId: categoryId,
      typeId: typeId,
      colorId: colorId,
      setIsLoading: setIsYearOptionsLoading,
    })
      .then((res) => {
        setYearFilterOptions([{ value: "All", label: "All" }, ...(res.data || [])]);
      })
      .catch((error) => {
        setErrorMessage(error.error.message);
        setIsShowError(true);
      });
  }, []);

  const handleFetchSellingTypeOptions = useCallback(async () => {
    await SellingTypeService.getSellingTypeList({
      page: 1,
      pageSize: 9999,
      search: "",
      setIsLoading: setIsSellingTypeOptionsLoading,
    })
      .then((res) => {
        const mappedOptions = (res.data || []).map((item) => ({
          value: String(item.sellingTypeId),
          label: item.sellingTypeName,
        }));

        setSellingTypeOptions(mappedOptions);
      })
      .catch((error) => {
        setErrorMessage(error.error.message);
        setIsShowError(true);
      });
  }, []);

  const handleFetchSellingVolumeOptions = useCallback(async () => {
    await VolumeService.getVolumeList({
      page: 1,
      pageSize: 9999,
      search: "",
      setIsLoading: setIsVolumeOptionsLoading,
    })
      .then((res) => {
        const mappedOptions = (res.data || []).map((item) => ({
          value: String(item.volumeId),
          label: String(item.volume),
        }));

        setSellingVolumeOptions(mappedOptions);
      })
      .catch((error) => {
        setErrorMessage(error.error.message);
        setIsShowError(true);
      });
  }, []);

  const handleFetchTableTransactionData = useCallback(async () => {
    if (!isFilterApplied) {
      setTransactionList([]);
      return;
    }

    await TransactionService.getTableTransactionData({
      page: 1,
      pageSize: 1,
      search: "",
      transactionYear: appliedPeriodFilter.year,
      transactionMonth: appliedPeriodFilter.month,
      transactionDay: appliedPeriodFilter.day,
      categoryId: appliedFilter.category || "All",
      typeId: appliedFilter.type || "All",
      colorId: appliedFilter.color || "All",
      year: appliedFilter.year || "All",
      isRFS: appliedFilter.status === "RFS",
      isSold: appliedFilter.isSold,
      setIsLoading: setIsTableLoading,
    })
      .then((res) => {
        console.log('transaction data', res.data);
        setTransactionList(res.data || []);
      })
      .catch((error) => {
        setErrorMessage(error.error.message);
        setIsShowError(true);
      });
  }, [appliedFilter, appliedPeriodFilter, isFilterApplied]);

  const handleInsertTransaction = async () => {
    const userId = authenticatedUser?.userId;

    if (!userId) {
      setErrorMessage("Authenticated user not found. Please login again.");
      setIsShowError(true);
      return;
    }

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
        void handleFetchTableTransactionData();
      })
      .catch((error) => {
        setErrorMessage(error.error.message);
        setIsShowError(true);
      });
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
    const parsedTypeColorId = Number(editTypeColorIdInput);

    if (!transactionId || !dateInput) {
      setErrorMessage("No transaction selected to update.");
      setIsShowError(true);
      return;
    }

    if (!Number.isInteger(parsedTypeColorId) || parsedTypeColorId <= 0) {
      setErrorMessage("Type and Color must be selected");
      setIsShowError(true);
      return;
    }

    const parsedYear = Number(editYearInput);

    const dateValue = formatDateAsYmd(dateInput);
    const existingTransaction = selectedDetailRows.find(
      (item) => item.transactionId === transactionId,
    );

    await TransactionService.updateTransaction({
      transactionId,
      typeColorId: parsedTypeColorId,
      noMesin: editNoMesinInput.trim(),
      noRangka: editNoRangkaInput.trim(),
      year: parsedYear,
      isRFS: editIsRFSInput,
      dateDO: dateValue,
      dateOUT: existingTransaction?.dateOUT || null,
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading: setIsActionLoading,
    })
      .then(() => {
        setSuccessMessage("Transaction updated successfully.");
        setIsDetailModalOpen(false);
        setIsEditDetailModalOpen(false);
        setIsShowSuccess(true);
        setIsConfirmUpdateDetailModalOpen(false);
        void handleFetchTableTransactionData();
      })
      .catch((error) => {
        setErrorMessage(error.error.message);
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

    const deleteDetailResponse = await TransactionService.deleteTransactionDetail({
      transactionId: deletingTransaction.transactionId,
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading: setIsActionLoading,
    })
      .catch((error) => {
        setErrorMessage(error.error.message);
        setIsShowError(true);
        return null;
      });

    if (!deleteDetailResponse) {
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
        setIsDetailModalOpen(false);
        setIsShowSuccess(true);
        setIsConfirmDeleteDetailModalOpen(false);
        setDeletingTransaction(null);
        void handleFetchTableTransactionData();
      })
      .catch((error) => {
        setErrorMessage(error.error.message);
        setIsShowError(true);
      });
  };
  console.log(sellingTypeInput, 'sellingTypeInput');
  const handleSubmitSellingDetail = async () => {
    const userId = authenticatedUser?.userId;

    if (!userId) {
      setErrorMessage("Authenticated user not found. Please login again.");
      setIsShowError(true);
      return;
    }

    if (!sellingTransaction) {
      setErrorMessage("No transaction selected to sell.");
      setIsShowError(true);
      return;
    }

    if (
      !sellingVolumeInput.trim() ||
      !sellingTypeInput.trim() ||
      !sellingNumberInput.trim() ||
      !sellingNameInput.trim() ||
      !sellingAddressInput.trim() ||
      !sellingPhoneInput.trim()
    ) {
      setErrorMessage(
        "Please fill Volume, Selling Type, Number, Name, Address, and Phone.",
      );
      setIsShowError(true);
      return;
    }

    const parsedVolumeId = Number(sellingVolumeInput);
    const parsedSellingTypeId = Number(sellingTypeInput);

    if (!Number.isInteger(parsedVolumeId) || parsedVolumeId <= 0) {
      setErrorMessage("Volume must be selected.");
      setIsShowError(true);
      return;
    }

    if (!Number.isInteger(parsedSellingTypeId) || parsedSellingTypeId <= 0) {
      setErrorMessage("Selling Type must be selected.");
      setIsShowError(true);
      return;
    }

    if (!sellingNumberInput.trim()) {
      setErrorMessage("Selling Number is required.");
      setIsShowError(true);
      return;
    }

    if (!sellingDateOutInput) {
      setErrorMessage("Date Out is required.");
      setIsShowError(true);
      return;
    }

    const sellingDateOut = formatDateAsYmd(sellingDateOutInput);
    console.log('sellingTransaction', sellingTransaction)
    const payload = {
      transactionDetailId: sellingTransaction.transactionDetailId,
      transactionId: sellingTransaction.transactionId,
      volumeId: parsedVolumeId,
      sellingTypeId: parsedSellingTypeId,
      sellingNumber: sellingNumberInput.trim().toUpperCase(),
      name: sellingNameInput.trim(),
      address: sellingAddressInput.trim(),
      phone: sellingPhoneInput.trim(),
    };
    console.log('payload', payload)
    if (!isEditingSellingDetail) {
      if (!sellingTransaction.isRFS) {
        setErrorMessage("Only RFS transaction can be sold.");
        setIsShowError(true);
        return;
      }

      if (sellingTransaction.dateOUT) {
        setErrorMessage("Transaction is already sold.");
        setIsShowError(true);
        return;
      }

      await TransactionService.updateTransactionAsSold({
        transactionId: sellingTransaction.transactionId,
        dateOUT: sellingDateOut,
        userUp: userId,
        updatedAt: new Date().toISOString(),
        setIsLoading: setIsActionLoading,
      })
        .then(async () => {
          await TransactionService.insertTransactionDetail({
            ...payload,
            userIn: userId,
            setIsLoading: setIsActionLoading,
          });

          setSuccessMessage("Transaction has been marked as sold successfully.");
          setIsDetailModalOpen(false);
          setIsShowSuccess(true);
          setIsConfirmSellDetailModalOpen(false);
          setIsSellingDetailModalOpen(false);
          setSellingTransaction(null);
          resetSellingDetailForm();
          void handleFetchTableTransactionData();
        })
        .catch((error) => {
          setErrorMessage(error.error.message);
          setIsShowError(true);
        });

      return;
    }

    await TransactionService.updateTransactionAsSold({
      transactionId: sellingTransaction.transactionId,
      dateOUT: sellingDateOut,
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading: setIsActionLoading,
    })
      .then(async () => {
        const mutation = sellingTransaction.transactionDetailId
          ? TransactionService.updateTransactionDetail({
            ...payload,
            transactionDetailId: sellingTransaction.transactionDetailId,
            userUp: userId,
            updatedAt: new Date().toISOString(),
            setIsLoading: setIsActionLoading,
          })
          : TransactionService.insertTransactionDetail({
            ...payload,
            userIn: userId,
            setIsLoading: setIsActionLoading,
          });

        await mutation;
        setSuccessMessage("Selling detail updated successfully.");
        setIsShowSuccess(true);
        setIsSellingDetailModalOpen(false);
        setSellingTransaction(null);
        resetSellingDetailForm();
        void handleFetchTableTransactionData();
      })
      .catch((error) => {
        setErrorMessage(error.error.message);
        setIsShowError(true);
      });
  };

  const validateSellingDetailForm = () => {
    if (!sellingTransaction) {
      setErrorMessage("No transaction selected to sell.");
      setIsShowError(true);
      return false;
    }

    if (
      !sellingVolumeInput.trim() ||
      !sellingTypeInput.trim() ||
      !sellingNumberInput.trim() ||
      !sellingNameInput.trim() ||
      !sellingAddressInput.trim() ||
      !sellingPhoneInput.trim()
    ) {
      setErrorMessage(
        "Please fill Volume, Selling Type, Number, Name, Address, and Phone.",
      );
      setIsShowError(true);
      return false;
    }

    const parsedVolumeId = Number(sellingVolumeInput);
    const parsedSellingTypeId = Number(sellingTypeInput);

    if (!Number.isInteger(parsedVolumeId) || parsedVolumeId <= 0) {
      setErrorMessage("Volume must be selected.");
      setIsShowError(true);
      return false;
    }

    if (!Number.isInteger(parsedSellingTypeId) || parsedSellingTypeId <= 0) {
      setErrorMessage("Selling Type must be selected.");
      setIsShowError(true);
      return false;
    }

    if (!sellingNumberInput.trim()) {
      setErrorMessage("Selling Number is required.");
      setIsShowError(true);
      return false;
    }

    if (!sellingDateOutInput) {
      setErrorMessage("Date Out is required.");
      setIsShowError(true);
      return false;
    }

    return true;
  };

  // Modal / Action Handler
  const handleOpenAddModal = async () => {
    if (!canInsertTransaction) {
      setErrorMessage("You do not have permission to insert this transaction.");
      setIsShowError(true);
      return;
    }

    resetInsertForm();
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

  const handleOpenSellDetailRow = (row: TransactionDetailRow) => {
    if (!canSellTransaction) {
      setErrorMessage("You do not have permission to sell this transaction.");
      setIsShowError(true);
      return;
    }

    if (!row.isRFS) {
      setErrorMessage("Only RFS transaction can be sold.");
      setIsShowError(true);
      return;
    }

    if (row.dateOUT) {
      setErrorMessage("Transaction is already sold.");
      setIsShowError(true);
      return;
    }

    resetSellingDetailForm();
    setIsEditingSellingDetail(false);
    setSellingTransaction(row);
    setIsSellingDetailModalOpen(true);
  };

  const handleOpenConfirmSellDetailModal = () => {
    if (!validateSellingDetailForm()) {
      return;
    }

    setIsSellingDetailModalOpen(false);
    setIsConfirmSellDetailModalOpen(true);
  };

  const handleOpenEditSellingDetailRow = async (row: TransactionDetailRow) => {
    if (!canSellTransaction) {
      setErrorMessage("You do not have permission to edit selling detail.");
      setIsShowError(true);
      return;
    }

    if (!row.dateOUT) {
      setErrorMessage("Selling detail can only be edited for sold transactions.");
      setIsShowError(true);
      return;
    }

    const detailResponse = await TransactionService.getTransactionDetailByTransactionId({
      transactionId: row.transactionId,
      setIsLoading: setIsActionLoading,
    }).catch((error) => {
      setErrorMessage(error.error.message);
      setIsShowError(true);
      return null;
    });

    if (!detailResponse) {
      return;
    }

    const detail = detailResponse.data;

    if (!detail?.transactionDetailId) {
      setErrorMessage("Selling detail not found for this transaction.");
      setIsShowError(true);
      return;
    }
    const sellingDetailRow: TransactionDetailRow = {
      ...row,
      transactionDetailId: detail.transactionDetailId,
      volumeId: detail?.volumeId || null,
      volumeLabel: null,
      sellingTypeId: detail?.sellingTypeId || null,
      sellingTypeName: null,
      sellingNumber: detail?.sellingNumber || null,
      name: detail?.name || null,
      address: detail?.address || null,
      phone: detail?.phone || null,
    };

    setSellingTransaction(sellingDetailRow);
    setIsEditingSellingDetail(true);
    fillSellingDetailForm(sellingDetailRow);
    setIsSellingDetailModalOpen(true);
  };

  const handleOpenPrintDetailRow = (row: TransactionDetailRow) => {
    const printPath = routes.transactionPrint.replace(
      ":transactionId",
      String(row.transactionId),
    );

    window.open(printPath, "_blank", "noopener,noreferrer");
  };

  const handleOpenConfirmAddModal = () => {
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

    setIsConfirmAddModalOpen(true);
  };

  const handleOpenDetailModal = (row: TransactionDayGroupedRow) => {
    console.log('open detail', row.details);
    setSelectedDetailRows(row.details);
    setSelectedDetailTitle(
      `${row.categoryName} - ${row.typeName} (${row.typeCode})`,
    );
    setIsDetailModalOpen(true);
  };

  const handlePreviousTablePage = () => {
    setTablePage((previous) => Math.max(previous - 1, 1));
  };

  const handleNextTablePage = () => {
    if (!hasNextTablePage) {
      return;
    }

    setTablePage((previous) => previous + 1);
  };

  const handleTablePageSizeChange = (nextPageSize: number) => {
    setTablePageSize(nextPageSize);
    setTablePage(1);
  };

  const handleApplyFilters = () => {
    setTablePage(1);
    setAppliedPeriodFilter({
      year: selectedPeriodYear,
      month: selectedPeriodMonth,
      day: selectedPeriodDay,
    });
    setAppliedFilter({
      category: selectedCategoryFilter === "All" ? "" : selectedCategoryFilter,
      type: selectedTypeFilter === "All" ? "" : selectedTypeFilter,
      color: selectedColorFilter === "All" ? "" : selectedColorFilter,
      year: selectedYearFilter === "All" ? "" : selectedYearFilter,
      status: selectedStatusFilter,
      isSold: isSoldFilter,
    });
    setIsFilterApplied(true);
  };

  // Validation
  const validateEditDetailForm = () => {
    if (!editingTransactionId) {
      setErrorMessage("No transaction selected to update.");
      setIsShowError(true);
      return false;
    }

    if (
      !editTypeColorIdInput.trim() ||
      !editNoMesinInput.trim() ||
      !editNoRangkaInput.trim() ||
      !editYearInput.trim() ||
      !editDateInput
    ) {
      setErrorMessage(
        "Please fill Type and Color, No Mesin, No Rangka, Year, and transaction date.",
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

  // useMemo
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

  const dayTransactionList = useMemo(() => {
    return transactionList;
  }, [transactionList]);

  const isTypeFilterDisabled = !selectedCategoryFilter;
  const isColorFilterDisabled = !selectedTypeFilter;
  const isDayPickerDisabled = !isMonthSelected;

  const filteredTransactionList = useMemo(() => {
    if (!isFilterApplied) {
      return [];
    }

    return dayTransactionList;
  }, [dayTransactionList, isFilterApplied]);

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

  const groupedTransactionRowCount = groupedTransactionRows.length;

  const paginatedGroupedTransactionRows = useMemo(() => {
    const from = (tablePage - 1) * tablePageSize;
    const to = from + tablePageSize;

    return groupedTransactionRows.slice(from, to);
  }, [groupedTransactionRows, tablePage, tablePageSize]);

  const hasNextTablePage = useMemo(() => {
    return tablePage * tablePageSize < groupedTransactionRowCount;
  }, [groupedTransactionRowCount, tablePage, tablePageSize]);

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
    data: paginatedGroupedTransactionRows,
    columns: transactionColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // useEffect
  useEffect(() => {
    void handleFetchTableTransactionData();
  }, [
    handleFetchTableTransactionData,
    isFilterApplied,
    appliedFilter,
    appliedPeriodFilter,
  ]);

  useEffect(() => {
    const maxPage = Math.max(
      1,
      Math.ceil(groupedTransactionRowCount / tablePageSize),
    );

    if (tablePage > maxPage) {
      setTablePage(maxPage);
    }
  }, [groupedTransactionRowCount, tablePage, tablePageSize]);

  useEffect(() => {
    setIsFilterApplied(false);
    setTablePage(1);
  }, [selectedPeriodYear, selectedPeriodMonth, selectedPeriodDay]);

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
    setTablePage(1);
  }, [
    selectedCategoryFilter,
    selectedTypeFilter,
    selectedColorFilter,
    selectedYearFilter,
    selectedStatusFilter,
    isSoldFilter,
  ]);

  useEffect(() => {
    if (!isAddModalOpen && !isEditDetailModalOpen) {
      return;
    }

    void handleFetchTypeColorOptions();
  }, [handleFetchTypeColorOptions, isAddModalOpen, isEditDetailModalOpen]);

  useEffect(() => {
    if (!isSellingDetailModalOpen) {
      return;
    }

    void handleFetchSellingTypeOptions();
    void handleFetchSellingVolumeOptions();
  }, [
    handleFetchSellingTypeOptions,
    handleFetchSellingVolumeOptions,
    isSellingDetailModalOpen,
  ]);

  useEffect(() => {
    const initializeFilterOptions = async () => {
      await handleFetchCategoryFilterOptions();
      await handleFetchTypeFilterOptions("All");
      await handleFetchColorFilterOptions("All", "All");
      await handleFetchYearFilterOptions("All", "All", "All");
    };

    void initializeFilterOptions();
  }, [
    handleFetchCategoryFilterOptions,
    handleFetchTypeFilterOptions,
    handleFetchColorFilterOptions,
    handleFetchYearFilterOptions,
  ]);

  return (
    <div>
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
            {pageWording.title}
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
            value={selectedPeriodYear}
            options={periodYearOptions}
            onValueChange={setSelectedPeriodYear}
          />
          <AppAutoComplete
            label="Transaction Month"
            placeholder="Select month"
            searchPlaceholder="Search month"
            emptyMessage="No month found"
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
            isLoading={isCategoryOptionsLoading}
            value={selectedCategoryFilter}
            options={categoryFilterOptions}
            onValueChange={(value) => {
              const nextCategoryValue = value || "All";

              setSelectedCategoryFilter(nextCategoryValue);
              setSelectedTypeFilter("All");
              setSelectedColorFilter("All");
              setSelectedYearFilter("All");
              setTypeFilterOptions([{ value: "All", label: "All" }]);
              setColorFilterOptions([{ value: "All", label: "All" }]);
              void handleFetchTypeFilterOptions(nextCategoryValue);
              void handleFetchColorFilterOptions("All", nextCategoryValue);
              void handleFetchYearFilterOptions(nextCategoryValue, "All", "All");
            }}
          />
          <AppAutoComplete
            label="Type"
            placeholder={isTypeFilterDisabled ? "Choose category first" : "Select type"}
            searchPlaceholder="Search type"
            emptyMessage={isTypeFilterDisabled ? "Choose category first" : "No type found"}
            isLoading={isTypeOptionsLoading}
            disabled={isTypeFilterDisabled}
            value={selectedTypeFilter}
            options={typeFilterOptions}
            onValueChange={(value) => {
              const nextTypeValue = value || "All";

              setSelectedTypeFilter(nextTypeValue);
              setSelectedColorFilter("All");
              setSelectedYearFilter("All");
              setColorFilterOptions([{ value: "All", label: "All" }]);
              void handleFetchColorFilterOptions(nextTypeValue, selectedCategoryFilter);
              void handleFetchYearFilterOptions(
                selectedCategoryFilter,
                nextTypeValue,
                "All",
              );
            }}
          />
          <AppAutoComplete
            label="Color"
            placeholder={isColorFilterDisabled ? "Choose type first" : "Select color"}
            searchPlaceholder="Search color"
            emptyMessage={isColorFilterDisabled ? "Choose type first" : "No color found"}
            isLoading={isColorOptionsLoading}
            disabled={isColorFilterDisabled}
            value={selectedColorFilter}
            options={colorFilterOptions}
            onValueChange={(value) => {
              const nextColorValue = value || "All";

              setSelectedColorFilter(nextColorValue);
              setSelectedYearFilter("All");
              void handleFetchYearFilterOptions(
                selectedCategoryFilter,
                selectedTypeFilter,
                nextColorValue,
              );
            }}
          />
          <AppAutoComplete
            label="Year"
            placeholder="Select year"
            searchPlaceholder="Search year"
            emptyMessage="No year found"
            isLoading={isYearOptionsLoading}
            value={selectedYearFilter}
            options={yearFilterOptions}
            onValueChange={(value) => {
              setSelectedYearFilter(value || "All");
            }}
          />
          <AppAutoComplete
            label="Status"
            placeholder="Select status"
            searchPlaceholder="Search status"
            emptyMessage="No status found"
            value={selectedStatusFilter}
            options={statusOptions}
            onValueChange={setSelectedStatusFilter}
          />
          <AppSwitch
            classNames={{
              field: useIsMobile() ? "" : "mt-8",
            }}
            label={isSoldFilter ? "Sold" : "Not Sold"}
            checked={isSoldFilter}
            onCheckedChange={setIsSoldFilter}
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
        isLoading={isTableLoading}
        page={tablePage}
        pageSize={tablePageSize}
        rowCount={groupedTransactionRowCount}
        hasNextPage={hasNextTablePage}
        onPreviousPage={handlePreviousTablePage}
        onNextPage={handleNextTablePage}
        onPageSizeChange={handleTablePageSizeChange}
        emptyMessage={
          isFilterApplied
            ? "No transaction found for selected filters."
            : "Please set filters and click Apply."
        }
        detailOpen={isDetailModalOpen}
        onDetailOpenChange={setIsDetailModalOpen}
        detailTitle={selectedDetailTitle}
        detailRows={selectedDetailRows}
        canUpdateDetail={canUpdateTransaction}
        canDeleteDetail={canDeleteTransaction}
        canSellDetail={canSellTransaction}
        onEditDetailRow={handleOpenEditDetailRow}
        onDeleteDetailRow={handleOpenDeleteDetailRow}
        onSellDetailRow={handleOpenSellDetailRow}
        onEditSellingDetailRow={handleOpenEditSellingDetailRow}
        onPrintDetailRow={handleOpenPrintDetailRow}
      />

      <AppModal
        open={isAddModalOpen}
        onOpenChange={(open: boolean) => {
          setIsAddModalOpen(open);

          if (!open) {
            resetInsertForm();
          }
        }}
        title={pageWording.addModalTitle}
        description={pageWording.addModalDescription}
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
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <AppAutoComplete
              label="Type and Color"
              placeholder="Select type and color"
              searchPlaceholder="Search type and color"
              emptyMessage="No type and color found"
              required={true}
              isLoading={isTypeColorOptionsLoading}
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
          </div>
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
      </AppModal>

      <AppModal
        open={isConfirmAddModalOpen}
        onOpenChange={setIsConfirmAddModalOpen}
        title={pageWording.confirmAddModalTitle}
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
          {pageWording.confirmAddQuestionActionText}{" "}
          for <strong>{dateDOInput ? formatDateAsYmd(dateDOInput) : getSelectedDateString()}</strong>?
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
        title={pageWording.editModalTitle}
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
        <AppAutoComplete
          label="Type and Color"
          placeholder="Select type and color"
          searchPlaceholder="Search type and color"
          emptyMessage="No type and color found"
          required={true}
          isLoading={isTypeColorOptionsLoading}
          value={editTypeColorIdInput}
          options={typeColorAutoCompleteOptions}
          onValueChange={(value) => {
            setEditTypeColorIdInput(value);
          }}
        />
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
          label={pageWording.editDateLabel}
          placeholder={pageWording.editDatePlaceholder}
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
        title={pageWording.confirmUpdateModalTitle}
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
        open={isConfirmSellDetailModalOpen}
        onOpenChange={(open) => {
          setIsConfirmSellDetailModalOpen(open);
        }}
        title={isEditingSellingDetail ? "Confirm Update Selling Detail" : "Confirm Sell Transaction"}
        showCloseButton={true}
        footer={
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              disabled={isActionLoading}
              onClick={() => {
                setIsConfirmSellDetailModalOpen(false);
                setIsSellingDetailModalOpen(true);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isActionLoading}
              onClick={handleSubmitSellingDetail}
            >
              {isActionLoading ? "Saving..." : "Confirm"}
            </Button>
          </div>
        }
      >
        {isEditingSellingDetail ? (
          <p className="text-sm">
            Update selling detail for transaction <strong>{sellingTransaction?.noMesin || "-"}</strong> /{" "}
            <strong>{sellingTransaction?.noRangka || "-"}</strong>?
          </p>
        ) : (
          <p className="text-sm">
            Mark transaction <strong>{sellingTransaction?.noMesin || "-"}</strong> /{" "}
            <strong>{sellingTransaction?.noRangka || "-"}</strong> as sold for{" "}
            <strong>{sellingDateOutInput ? formatDateAsYmd(sellingDateOutInput) : "-"}</strong>?
          </p>
        )}
      </AppModal>

      <AppModal
        open={isSellingDetailModalOpen}
        onOpenChange={(open) => {
          setIsSellingDetailModalOpen(open);

          if (!open) {
            resetSellingDetailForm();
            setSellingTransaction(null);
          }
        }}
        title={isEditingSellingDetail ? "Edit Selling Detail" : "Add Selling Detail"}
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
                setIsSellingDetailModalOpen(false);
                setSellingTransaction(null);
                resetSellingDetailForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isActionLoading}
              onClick={handleOpenConfirmSellDetailModal}
            >
              {isActionLoading ? "Saving..." : "Submit"}
            </Button>
          </div>
        }
      >
        <div className="grid md:grid-cols-2 gap-2">
          <AppDatePicker
            label="Date Out"
            placeholder="Pick date out"
            required={true}
            value={sellingDateOutInput}
            onValueChange={setSellingDateOutInput}
          />
          <AppAutoComplete
            label="Volume"
            placeholder="Select volume"
            searchPlaceholder="Search volume"
            emptyMessage="No volume found"
            required={true}
            isLoading={isVolumeOptionsLoading}
            value={sellingVolumeInput}
            options={sellingVolumeOptions}
            onValueChange={setSellingVolumeInput}
          />
          <AppAutoComplete
            label="Penjualan"
            placeholder="Select penjualan"
            searchPlaceholder="Search penjualan"
            emptyMessage="No penjualan found"
            required={true}
            isLoading={isSellingTypeOptionsLoading}
            value={sellingTypeInput}
            options={sellingTypeOptions}
            onValueChange={setSellingTypeInput}
          />
          <AppTextField
            label="No"
            placeholder="Input no"
            required={true}
            value={sellingNumberInput}
            onChange={setSellingNumberInput}
            isCapital
          />
          <AppTextField
            label="Name"
            placeholder="Input name"
            required={true}
            value={sellingNameInput}
            onChange={setSellingNameInput}
            isCapital
          />
          <AppTextField
            label="Address"
            placeholder="Input address"
            required={true}
            value={sellingAddressInput}
            onChange={setSellingAddressInput}
            isCapital
          />
          <AppTextField
            label="Phone"
            placeholder="Input phone"
            required={true}
            value={sellingPhoneInput}
            onChange={setSellingPhoneInput}
          />
        </div>
      </AppModal>

      <AppModal
        open={isConfirmDeleteDetailModalOpen}
        onOpenChange={setIsConfirmDeleteDetailModalOpen}
        title={pageWording.confirmDeleteModalTitle}
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

      <TransactionStatusModal
        open={isShowError}
        onOpenChange={setIsShowError}
        title="Error"
        message={errorMessage}
        onClose={handleCloseErrorModal}
      />

      <TransactionStatusModal
        open={isShowSuccess}
        onOpenChange={setIsShowSuccess}
        title="Success"
        message={successMessage}
        onClose={handleCloseSuccessModal}
      />
    </div>
  );
};

export default TransactionPage;
