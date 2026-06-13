import type {
  GetTableReportDataRequest,
  GetTableReportDataResponse,
  ReportQueryRawRow,
  ReportTransactionSummaryRow,
} from "@/interfaces/IReportService.interface";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";

const pickFirst = <T>(value: T | T[] | null | undefined): T | null => {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] || null : value;
};

const getTableReportData = async (
  params: GetTableReportDataRequest,
): Promise<GetTableReportDataResponse> => {
  const {
    transactionYear,
    transactionMonth,
    transactionDay,
    categoryId,
    typeId,
    colorId,
    reportEvent,
    setIsLoading,
  } = params;

  setIsLoading?.(true);

  try {
    const parsedYear = Number(transactionYear);
    const parsedMonth = Number(transactionMonth);
    const parsedDay = Number(transactionDay);

    const resolvedYear =
      Number.isInteger(parsedYear) && parsedYear > 0
        ? parsedYear
        : new Date().getFullYear();
    const resolvedMonth =
      Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
        ? parsedMonth
        : new Date().getMonth() + 1;

    const maxDayInMonth = new Date(resolvedYear, resolvedMonth, 0).getDate();
    const hasSelectedDay =
      Number.isInteger(parsedDay) &&
      parsedDay >= 1 &&
      parsedDay <= maxDayInMonth;

    const rangeStart = hasSelectedDay
      ? new Date(resolvedYear, resolvedMonth - 1, parsedDay, 0, 0, 0, 0)
      : new Date(resolvedYear, resolvedMonth - 1, 1, 0, 0, 0, 0);
    const rangeEnd = hasSelectedDay
      ? new Date(resolvedYear, resolvedMonth - 1, parsedDay, 23, 59, 59, 999)
      : new Date(resolvedYear, resolvedMonth, 0, 23, 59, 59, 999);

    const dateColumn = reportEvent === "selling" ? "dateOUT" : "dateDO";

    let query = supabase
      .from("TrTransaction")
      .select(
        `
					TrTypeColor!inner (
						typeId,
						colorId,
						isDeleted,
						MsType!inner (
							typeName,
							typeCode,
							categoryId,
							isDeleted,
							MsCategory!inner (
								categoryName,
								isDeleted
							)
						),
						MsColor!inner (
							colorId,
							isDeleted
						)
					)
				`,
      )
      .eq("isDeleted", false)
      .eq("TrTypeColor.isDeleted", false)
      .eq("TrTypeColor.MsType.isDeleted", false)
      .eq("TrTypeColor.MsType.MsCategory.isDeleted", false)
      .eq("TrTypeColor.MsColor.isDeleted", false)
      .gte(dateColumn, rangeStart.toISOString())
      .lte(dateColumn, rangeEnd.toISOString());

    if (categoryId !== "All") {
      query = query.eq("TrTypeColor.MsType.categoryId", categoryId);
    }

    if (typeId !== "All") {
      query = query.eq("TrTypeColor.typeId", typeId);
    }

    if (colorId !== "All") {
      query = query.eq("TrTypeColor.colorId", colorId);
    }

    const response = await ApiService.request<ReportQueryRawRow[]>(() => query);

    const mappedRows: ReportTransactionSummaryRow[] = (response.data || []).map(
      (item) => {
        const typeColor = pickFirst(item.TrTypeColor);
        const type = pickFirst(typeColor?.MsType);
        const category = pickFirst(type?.MsCategory);

        return {
          categoryName: category?.categoryName || null,
          typeName: type?.typeName || null,
          typeCode: type?.typeCode || null,
        };
      },
    );

    return {
      ...response,
      data: mappedRows,
    };
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

export const ReportService = {
  getTableReportData,
};
