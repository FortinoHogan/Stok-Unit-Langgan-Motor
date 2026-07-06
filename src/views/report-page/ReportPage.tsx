import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import {
    Document,
    Page,
    Text,
    View,
    pdf,
} from "@react-pdf/renderer";

import AppAutoComplete from "@/components/app-components/app-auto-complete/AppAutoComplete";
import { Button } from "@/components/ui/button";
import { ReportService } from "@/helpers/services/ReportService";
import { TransactionService } from "@/helpers/services/TransactionService";
import { monthFormatter } from "@/views/transaction-page/utilities";
import TransactionStatusModal from "@/views/transaction-page/components/transaction-status-modal/TransactionStatusModal";
import ReportTableSection from "./components/report-table-section/ReportTableSection";
import {
    exportStyles,
    reportEventOptions,
    reportFilterInitial,
} from "./ReportPage.constant";
import type {
    ReportAppliedFilter,
    ReportAppliedPeriodFilter,
    ReportCategoryTotal,
    ReportRow,
} from "./ReportPage.interface";
import type { ReportTransactionSummaryRow } from "@/interfaces/IReportService.interface";
import AppCard from "@/components/app-components/app-card/AppCard";
import { formatExportDate, formatLongDate } from "@/lib/utils";

const ReportPage = () => {
    const today = useMemo(() => new Date(), []);
    const initialYear = today.getFullYear();
    const initialMonth = today.getMonth() + 1;
    const initialDay = "";

    const [isTableLoading, setIsTableLoading] = useState(false);
    const [isCategoryOptionsLoading, setIsCategoryOptionsLoading] = useState(false);
    const [isTypeOptionsLoading, setIsTypeOptionsLoading] = useState(false);
    const [isColorOptionsLoading, setIsColorOptionsLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [isShowError, setIsShowError] = useState(false);

    const [transactionList, setTransactionList] = useState<ReportTransactionSummaryRow[]>([]);
    const [startingBalance, setStartingBalance] = useState<ReportTransactionSummaryRow[]>([]);
    const [endingBalance, setEndingBalance] = useState<ReportTransactionSummaryRow[]>([]);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedDetailRows, setSelectedDetailRows] = useState<ReportTransactionSummaryRow[]>([]);
    const [selectedDetailTitle, setSelectedDetailTitle] = useState("");

    const [selectedPeriodYear, setSelectedPeriodYear] = useState(String(initialYear));
    const [selectedPeriodMonth, setSelectedPeriodMonth] = useState(String(initialMonth));
    const [selectedPeriodDay, setSelectedPeriodDay] = useState(String(initialDay));

    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
    const [selectedTypeFilter, setSelectedTypeFilter] = useState("All");
    const [selectedColorFilter, setSelectedColorFilter] = useState("All");
    const [selectedReportEvent, setSelectedReportEvent] = useState<"delivery-order" | "selling">("delivery-order");

    const [categoryFilterOptions, setCategoryFilterOptions] = useState([
        { value: "All", label: "All" },
    ]);
    const [typeFilterOptions, setTypeFilterOptions] = useState([
        { value: "All", label: "All" },
    ]);
    const [colorFilterOptions, setColorFilterOptions] = useState([
        { value: "All", label: "All" },
    ]);

    const [isFilterApplied, setIsFilterApplied] = useState(false);
    const [tablePage, setTablePage] = useState(1);
    const [tablePageSize, setTablePageSize] = useState(10);

    const [appliedPeriodFilter, setAppliedPeriodFilter] =
        useState<ReportAppliedPeriodFilter>({
            year: String(initialYear),
            month: String(initialMonth),
            day: String(initialDay),
        });
    const [appliedFilter, setAppliedFilter] = useState<ReportAppliedFilter>(
        reportFilterInitial,
    );

    const handleCloseErrorModal = () => {
        setErrorMessage("");
        setIsShowError(false);
    };

    const handleOpenDetailModal = (row: ReportRow) => {
        setSelectedDetailRows(row.details);
        setSelectedDetailTitle(`${row.categoryName} - ${row.typeName} (${row.typeCode})`);
        setIsDetailModalOpen(true);
    };

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
            categoryId,
            typeId,
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

    const handleFetchTableReportData = useCallback(async () => {
        if (!isFilterApplied) {
            setTransactionList([]);
            return;
        }

        await ReportService.getTableReportData({
            transactionYear: appliedPeriodFilter.year,
            transactionMonth: appliedPeriodFilter.month,
            transactionDay: appliedPeriodFilter.day,
            categoryId: appliedFilter.categoryId,
            typeId: appliedFilter.typeId,
            colorId: appliedFilter.colorId,
            reportEvent: appliedFilter.reportEvent,
            setIsLoading: setIsTableLoading,
        })
            .then((res) => {
                setTransactionList(res.data || []);
            })
            .catch((error) => {
                setErrorMessage(error.error.message);
                setIsShowError(true);
            });
    }, [appliedFilter, appliedPeriodFilter, isFilterApplied]);

    const handleFetchBalance = useCallback(async () => {
        await ReportService.getBalance({
            transactionYear: appliedPeriodFilter.year,
            transactionMonth: appliedPeriodFilter.month,
            transactionDay: appliedPeriodFilter.day,
            categoryId: appliedFilter.categoryId,
            typeId: appliedFilter.typeId,
            colorId: appliedFilter.colorId,
            reportEvent: appliedFilter.reportEvent,
            setIsLoading: setIsTableLoading,
        })
            .then((res) => {
                setStartingBalance(res.data?.beginningRows || []);
                setEndingBalance(res.data?.endingRows || []);
            })
            .catch((error) => {
                setErrorMessage(error.error.message);
                setIsShowError(true);
            });
    }, [appliedFilter, appliedPeriodFilter, isFilterApplied]);

    const handleExportFile = async () => {
        await ReportService.getBalance({
            transactionYear: selectedPeriodYear,
            transactionMonth: selectedPeriodMonth,
            transactionDay: selectedPeriodDay,
            categoryId: selectedCategoryFilter,
            typeId: selectedTypeFilter,
            colorId: selectedColorFilter,
            reportEvent: selectedReportEvent,
            setIsLoading: setIsTableLoading,
        })
            .then(async (res) => {
                const endingRows = res.data?.endingRows || [];

                const groupedByCategory = endingRows.reduce((map, row) => {
                    const categoryName = row.categoryName || "-";
                    const previous = map.get(categoryName) || [];
                    map.set(categoryName, [...previous, row]);
                    return map;
                }, new Map<string, ReportTransactionSummaryRow[]>());

                const sortedCategories = Array.from(groupedByCategory.entries()).sort(
                    (a, b) => a[0].localeCompare(b[0]),
                );

                const today = new Date();
                const parsedYear = Number(selectedPeriodYear) || today.getFullYear();
                const parsedMonth = Number(selectedPeriodMonth) || today.getMonth() + 1;
                const parsedDay = Number(selectedPeriodDay);

                const endOfSelectedMonth = new Date(parsedYear, parsedMonth, 0);
                const dayIsAll = !selectedPeriodDay;

                const resolvedPeriodDate = dayIsAll
                    ? new Date(
                        Math.min(
                            endOfSelectedMonth.getTime(),
                            today.getTime(),
                        ),
                    )
                    : new Date(parsedYear, parsedMonth - 1, parsedDay || 1);

                const periodLabel = formatLongDate(resolvedPeriodDate);

                const ExportDocument = () => (
                    <Document title="Unsold Transactions Report">
                        <Page size="A4" style={exportStyles.page}>
                            <View style={exportStyles.header}>
                                <Text style={exportStyles.title}>Unsold Transactions (Ending Balance)</Text>
                                <Text style={exportStyles.subtitle}>
                                    Period: {periodLabel}
                                </Text>
                            </View>

                            {sortedCategories.length === 0 ? (
                                <Text style={exportStyles.empty}>No unsold transaction data.</Text>
                            ) : (
                                sortedCategories.map(([categoryName, rows]) => (
                                    <View key={categoryName}>
                                        <Text style={exportStyles.categoryTitle}>{categoryName}</Text>

                                        <View style={exportStyles.tableHeader}>
                                            <Text style={exportStyles.colCode}>Code</Text>
                                            <Text style={exportStyles.colName}>Name</Text>
                                            <Text style={exportStyles.colColor}>Color</Text>
                                            <Text style={exportStyles.colRangka}>No Rangka</Text>
                                            <Text style={exportStyles.colMesin}>No Mesin</Text>
                                            <Text style={exportStyles.colDate}>Date DO</Text>
                                        </View>

                                        {rows
                                            .slice()
                                            .sort((a, b) => {
                                                if ((a.typeCode || "") !== (b.typeCode || "")) {
                                                    return (a.typeCode || "").localeCompare(b.typeCode || "");
                                                }

                                                const aDate = a.dateDO ? new Date(a.dateDO).getTime() : Number.POSITIVE_INFINITY;
                                                const bDate = b.dateDO ? new Date(b.dateDO).getTime() : Number.POSITIVE_INFINITY;

                                                if (aDate !== bDate) {
                                                    return aDate - bDate;
                                                }

                                                if ((a.typeName || "") !== (b.typeName || "")) {
                                                    return (a.typeName || "").localeCompare(b.typeName || "");
                                                }

                                                if ((a.colorName || "") !== (b.colorName || "")) {
                                                    return (a.colorName || "").localeCompare(b.colorName || "");
                                                }

                                                return (a.noRangka || "").localeCompare(b.noRangka || "");
                                            })
                                            .map((row) => (
                                                <View key={row.transactionId} style={exportStyles.tableRow}>
                                                    <Text style={exportStyles.colCode}>{row.typeCode || "-"}</Text>
                                                    <Text style={exportStyles.colName}>{row.typeName || "-"}</Text>
                                                    <Text style={exportStyles.colColor}>{row.colorName || "-"}</Text>
                                                    <Text style={exportStyles.colRangka}>{row.noRangka || "-"}</Text>
                                                    <Text style={exportStyles.colMesin}>{row.noMesin || "-"}</Text>
                                                    <Text style={exportStyles.colDate}>{formatExportDate(row.dateDO)}</Text>
                                                </View>
                                            ))}
                                    </View>
                                ))
                            )}
                        </Page>
                    </Document>
                );

                const blob = await pdf(<ExportDocument />).toBlob();
                const url = URL.createObjectURL(blob);
                window.open(url, "_blank", "noopener,noreferrer");
            })
            .catch((error) => {
                setErrorMessage(error.error.message);
                setIsShowError(true);
            });
    };

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
        return Array.from({ length: 12 }, (_, index) => {
            const monthValue = index + 1;

            return {
                value: String(monthValue),
                label: monthFormatter.format(new Date(2000, index, 1)),
            };
        });
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

    const groupedTransactionRows = useMemo<ReportRow[]>(() => {
        const groupedMap = new Map<string, ReportRow>();

        transactionList.forEach((transaction) => {
            const categoryName = transaction.categoryName || "-";
            const typeName = transaction.typeName || "-";
            const typeCode = transaction.typeCode || "-";
            const key = `${categoryName}|${typeName}|${typeCode}`;

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
                quantity: 1,
                details: [transaction],
            });
        });

        return Array.from(groupedMap.values()).sort((a, b) => {
            if (a.categoryName !== b.categoryName) {
                return a.categoryName.localeCompare(b.categoryName);
            }

            if (a.typeName !== b.typeName) {
                return a.typeName.localeCompare(b.typeName);
            }

            return a.typeCode.localeCompare(b.typeCode);
        });
    }, [transactionList]);

    const groupedTransactionRowCount = groupedTransactionRows.length;

    const paginatedGroupedTransactionRows = useMemo(() => {
        const from = (tablePage - 1) * tablePageSize;
        const to = from + tablePageSize;

        return groupedTransactionRows.slice(from, to);
    }, [groupedTransactionRows, tablePage, tablePageSize]);

    const hasNextTablePage = useMemo(() => {
        return tablePage * tablePageSize < groupedTransactionRowCount;
    }, [groupedTransactionRowCount, tablePage, tablePageSize]);

    const categoryTotals = useMemo<ReportCategoryTotal[]>(() => {
        const totalsMap = new Map<string, number>();

        groupedTransactionRows.forEach((row) => {
            totalsMap.set(row.categoryName, (totalsMap.get(row.categoryName) || 0) + row.quantity);
        });

        return Array.from(totalsMap.entries())
            .map(([categoryName, total]) => ({ categoryName, total }))
            .sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    }, [groupedTransactionRows]);

    const subtotalForSelectedCategory = useMemo(() => {
        return groupedTransactionRows.reduce((sum, row) => sum + row.quantity, 0);
    }, [groupedTransactionRows]);

    const grandTotal = useMemo(() => {
        return categoryTotals.reduce((sum, item) => sum + item.total, 0);
    }, [categoryTotals]);

    const selectedCategoryLabel = useMemo(() => {
        return (
            categoryFilterOptions.find((option) => option.value === selectedCategoryFilter)?.label ||
            "Selected Category"
        );
    }, [categoryFilterOptions, selectedCategoryFilter]);

    const createBalanceSummary = (
        transactions: ReportTransactionSummaryRow[],
    ) => {
        const groupedMap = new Map<string, ReportRow>();

        transactions.forEach((transaction) => {
            const categoryName = transaction.categoryName || "-";
            const typeName = transaction.typeName || "-";
            const typeCode = transaction.typeCode || "-";

            const key = `${categoryName}|${typeName}|${typeCode}`;

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
                quantity: 1,
                details: [transaction],
            });
        });

        const rows = Array.from(groupedMap.values()).sort((a, b) => {
            if (a.categoryName !== b.categoryName) {
                return a.categoryName.localeCompare(b.categoryName);
            }

            if (a.typeName !== b.typeName) {
                return a.typeName.localeCompare(b.typeName);
            }

            return a.typeCode.localeCompare(b.typeCode);
        });

        const categoryTotals = Array.from(
            rows.reduce((map, row) => {
                map.set(
                    row.categoryName,
                    (map.get(row.categoryName) || 0) + row.quantity,
                );

                return map;
            }, new Map<string, number>()),
        )
            .map(([categoryName, total]) => ({
                categoryName,
                total,
            }))
            .sort((a, b) =>
                a.categoryName.localeCompare(b.categoryName),
            );

        const subtotal = rows.reduce(
            (sum, row) => sum + row.quantity,
            0,
        );

        const grandTotal = categoryTotals.reduce(
            (sum, item) => sum + item.total,
            0,
        );

        return {
            rows,
            categoryTotals,
            subtotal,
            grandTotal,
        };
    };

    const startingBalanceSummary = useMemo(
        () => createBalanceSummary(startingBalance),
        [startingBalance],
    );

    const endingBalanceSummary = useMemo(
        () => createBalanceSummary(endingBalance),
        [endingBalance],
    );

    const reportColumns: ColumnDef<ReportRow>[] = [
        {
            accessorKey: "categoryName",
            header: "Category",
        },
        {
            accessorKey: "typeName",
            header: "Type",
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
        columns: reportColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

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
            categoryId: selectedCategoryFilter,
            typeId: selectedTypeFilter,
            colorId: selectedColorFilter,
            reportEvent: selectedReportEvent,
        });
        setIsFilterApplied(true);
    };

    useEffect(() => {
        void handleFetchTableReportData();
        void handleFetchBalance();
    }, [handleFetchTableReportData, isFilterApplied, appliedFilter, appliedPeriodFilter]);

    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(groupedTransactionRowCount / tablePageSize));

        if (tablePage > maxPage) {
            setTablePage(maxPage);
        }
    }, [groupedTransactionRowCount, tablePage, tablePageSize]);

    useEffect(() => {
        if (!selectedPeriodDay) {
            return;
        }

        const parsedSelectedDay = Number(selectedPeriodDay);

        if (parsedSelectedDay > maxDayInSelectedMonth) {
            setSelectedPeriodDay("");
        }
    }, [maxDayInSelectedMonth, selectedPeriodDay]);

    useEffect(() => {
        setIsFilterApplied(false);
        setTablePage(1);
    }, [
        selectedPeriodYear,
        selectedPeriodMonth,
        selectedPeriodDay,
        selectedCategoryFilter,
        selectedTypeFilter,
        selectedColorFilter,
        selectedReportEvent,
    ]);

    useEffect(() => {
        const initializeFilterOptions = async () => {
            await handleFetchCategoryFilterOptions();
            await handleFetchTypeFilterOptions("All");
            await handleFetchColorFilterOptions("All", "All");
        };

        void initializeFilterOptions();
    }, [
        handleFetchCategoryFilterOptions,
        handleFetchTypeFilterOptions,
        handleFetchColorFilterOptions,
    ]);

    return (
        <div>
            <div className="mb-4">
                <div className="mb-2 flex items-center gap-3">
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                        Report
                    </h1>
                </div>
                <p className="mb-3 text-muted-foreground">
                    Show Delivery Order or Selling quantity by Year, Month, and Day. Day supports All Day.
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
                            setSelectedPeriodMonth(value || String(initialMonth));
                            setSelectedPeriodDay("");
                        }}
                    />
                    <AppAutoComplete
                        label="Transaction Day"
                        placeholder="Select day"
                        searchPlaceholder="Search day"
                        emptyMessage="No day found"
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
                            setTypeFilterOptions([{ value: "All", label: "All" }]);
                            setColorFilterOptions([{ value: "All", label: "All" }]);
                            void handleFetchTypeFilterOptions(nextCategoryValue);
                            void handleFetchColorFilterOptions("All", nextCategoryValue);
                        }}
                    />
                    <AppAutoComplete
                        label="Type"
                        placeholder="Select type"
                        searchPlaceholder="Search type"
                        emptyMessage="No type found"
                        isLoading={isTypeOptionsLoading}
                        value={selectedTypeFilter}
                        options={typeFilterOptions}
                        onValueChange={(value) => {
                            const nextTypeValue = value || "All";

                            setSelectedTypeFilter(nextTypeValue);
                            setSelectedColorFilter("All");
                            setColorFilterOptions([{ value: "All", label: "All" }]);
                            void handleFetchColorFilterOptions(nextTypeValue, selectedCategoryFilter);
                        }}
                    />
                    <AppAutoComplete
                        label="Color"
                        placeholder="Select color"
                        searchPlaceholder="Search color"
                        emptyMessage="No color found"
                        isLoading={isColorOptionsLoading}
                        value={selectedColorFilter}
                        options={colorFilterOptions}
                        onValueChange={(value) => {
                            setSelectedColorFilter(value || "All");
                        }}
                    />
                    <AppAutoComplete
                        label="Transaction Type"
                        placeholder="Select transaction type"
                        searchPlaceholder="Search transaction type"
                        emptyMessage="No transaction type found"
                        value={selectedReportEvent}
                        options={reportEventOptions}
                        onValueChange={(value) => {
                            setSelectedReportEvent(value === "selling" ? "selling" : "delivery-order");
                        }}
                    />
                </div>

                <div className="mt-3 flex justify-end gap-2">
                    <Button type="button" variant={"secondary"} onClick={handleExportFile}>
                        Export File
                    </Button>
                    <Button type="button" onClick={handleApplyFilters}>
                        Apply
                    </Button>
                </div>
            </div>

            <ReportTableSection
                table={table}
                isLoading={isTableLoading}
                page={tablePage}
                pageSize={tablePageSize}
                rowCount={groupedTransactionRowCount}
                hasNextPage={hasNextTablePage}
                onPreviousPage={handlePreviousTablePage}
                onNextPage={handleNextTablePage}
                onPageSizeChange={handleTablePageSizeChange}
                detailOpen={isDetailModalOpen}
                onDetailOpenChange={setIsDetailModalOpen}
                detailTitle={selectedDetailTitle}
                detailRows={selectedDetailRows}
                emptyMessage={
                    isFilterApplied
                        ? "No transaction found for selected filters."
                        : "Please set filters and click Apply."
                }
            />

            {isFilterApplied ? (
                <AppCard
                    title={
                        selectedCategoryFilter === "All"
                            ? `Total by Category (${selectedReportEvent === "selling" ? "Selling" : "Delivery Order"})`
                            : `Sub Total ${selectedCategoryLabel}`
                    }
                    classNames={{
                        content: "space-y-2",
                    }}
                >
                    {selectedCategoryFilter === "All" ? (
                        <>
                            {categoryTotals.length > 0 ? (
                                categoryTotals.map((item) => (
                                    <p
                                        key={item.categoryName}
                                        className="text-sm text-muted-foreground"
                                    >
                                        {item.categoryName}:{" "}
                                        <span className="font-medium text-foreground">
                                            {item.total}
                                        </span>
                                    </p>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No category totals.
                                </p>
                            )}

                            <p className="pt-1 text-sm font-semibold">
                                Grand Total: {grandTotal}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm font-semibold">
                            {subtotalForSelectedCategory}
                        </p>
                    )}
                </AppCard>
            ) : null}

            {isFilterApplied ? (
                <AppCard
                    title={
                        selectedCategoryFilter === "All"
                            ? "Balance by Category"
                            : `Balance ${selectedCategoryLabel}`
                    }
                    classNames={{
                        content: "space-y-2",
                    }}
                >
                    <div className="grid grid-cols-2 divide-x">
                        <div className="space-y-2 pr-4">
                            <p className="mb-2 font-semibold">Starting Balance</p>

                            {selectedCategoryFilter === "All" ? (
                                <>
                                    {startingBalanceSummary.categoryTotals.length > 0 ? (
                                        startingBalanceSummary.categoryTotals.map((item) => (
                                            <p
                                                key={item.categoryName}
                                                className="text-sm text-muted-foreground"
                                            >
                                                {item.categoryName}:{" "}
                                                <span className="font-medium text-foreground">
                                                    {item.total}
                                                </span>
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No balance totals.
                                        </p>
                                    )}

                                    <p className="pt-1 text-sm font-semibold">
                                        Grand Total: {startingBalanceSummary.grandTotal}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm font-semibold">
                                    {startingBalanceSummary.subtotal}
                                </p>
                            )}
                        </div>

                        <div className="pl-4 space-y-2">
                            <p className="mb-2 font-semibold">Ending Balance</p>

                            {selectedCategoryFilter === "All" ? (
                                <>
                                    {endingBalanceSummary.categoryTotals.length > 0 ? (
                                        endingBalanceSummary.categoryTotals.map((item) => (
                                            <p
                                                key={item.categoryName}
                                                className="text-sm text-muted-foreground"
                                            >
                                                {item.categoryName}:{" "}
                                                <span className="font-medium text-foreground">
                                                    {item.total}
                                                </span>
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No balance totals.
                                        </p>
                                    )}

                                    <p className="pt-1 text-sm font-semibold">
                                        Grand Total: {endingBalanceSummary.grandTotal}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm font-semibold">
                                    {endingBalanceSummary.subtotal}
                                </p>
                            )}
                        </div>
                    </div>
                </AppCard>
            ) : null}

            <TransactionStatusModal
                open={isShowError}
                onOpenChange={setIsShowError}
                title="Error"
                message={errorMessage}
                onClose={handleCloseErrorModal}
            />
        </div>
    );
};

export default ReportPage;