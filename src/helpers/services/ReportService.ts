import type {
  GetBalanceResponse,
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

    const dateColumn =
      reportEvent === "selling"
        ? "dateOUT"
        : reportEvent === "delivery-order"
          ? "dateDO"
          : "dateDO";

    let query = supabase
      .from("TrTransaction")
      .select(
        `
          transactionId,
          typeColorId,
          noMesin,
          noRangka,
          year,
          isRFS,
          dateDO,
          dateOUT,
          TrTransactionDetail (
            name,
            isDeleted
          ),
					TrTypeColor!inner (
            typeColorId,
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
              colorName,
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

    if (reportEvent === "selling") {
      query = query.eq("TrTransactionDetail.isDeleted", false);
    }

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
        const transactionDetail = pickFirst(item.TrTransactionDetail);

        return {
          transactionId: item.transactionId,
          typeColorId: item.typeColorId,
          categoryName: category?.categoryName || null,
          typeName: type?.typeName || null,
          typeCode: type?.typeCode || null,
          colorName: pickFirst(typeColor?.MsColor)?.colorName || null,
          customerName:
            reportEvent === "selling" ? transactionDetail?.name || null : null,
          noMesin: item.noMesin,
          noRangka: item.noRangka,
          year: item.year,
          isRFS: item.isRFS,
          dateDO: item.dateDO,
          dateOUT: item.dateOUT,
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

const getBalance = async (
  params: GetTableReportDataRequest,
): Promise<GetBalanceResponse> => {
  const {
    transactionYear,
    transactionMonth,
    transactionDay,
    categoryId,
    typeId,
    colorId,
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

    const previousEnd = new Date(rangeStart);
    previousEnd.setMilliseconds(-1);

    const baseSelect = `
      transactionId,
      typeColorId,
      noMesin,
      noRangka,
      year,
      isRFS,
      dateDO,
      dateOUT,
      TrTypeColor!inner (
        typeColorId,
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
          colorName,
          isDeleted
        )
      )
    `;

    const applyFilters = (query: any) => {
      query = query
        .eq("isDeleted", false)
        .eq("TrTypeColor.isDeleted", false)
        .eq("TrTypeColor.MsType.isDeleted", false)
        .eq("TrTypeColor.MsType.MsCategory.isDeleted", false)
        .eq("TrTypeColor.MsColor.isDeleted", false);

      if (categoryId !== "All") {
        query = query.eq("TrTypeColor.MsType.categoryId", categoryId);
      }

      if (typeId !== "All") {
        query = query.eq("TrTypeColor.typeId", typeId);
      }

      if (colorId !== "All") {
        query = query.eq("TrTypeColor.colorId", colorId);
      }

      return query;
    };

    const beginningQuery = applyFilters(
      supabase
        .from("TrTransaction")
        .select(baseSelect)
        .lte("dateDO", previousEnd.toISOString())
        .or(`dateOUT.is.null,dateOUT.gte.${rangeStart.toISOString()}`),
    );

    const incomingQuery = applyFilters(
      supabase
        .from("TrTransaction")
        .select(baseSelect)
        .gte("dateDO", rangeStart.toISOString())
        .lte("dateDO", rangeEnd.toISOString()),
    );

    const soldQuery = applyFilters(
      supabase
        .from("TrTransaction")
        .select(baseSelect)
        .gte("dateOUT", rangeStart.toISOString())
        .lte("dateOUT", rangeEnd.toISOString()),
    );

    const [beginningResponse, incomingResponse, soldResponse] =
      await Promise.all([
        ApiService.request<ReportQueryRawRow[]>(() => beginningQuery),
        ApiService.request<ReportQueryRawRow[]>(() => incomingQuery),
        ApiService.request<ReportQueryRawRow[]>(() => soldQuery),
      ]);

    const mapRow = (item: ReportQueryRawRow): ReportTransactionSummaryRow => {
      const typeColor = pickFirst(item.TrTypeColor);
      const type = pickFirst(typeColor?.MsType);
      const category = pickFirst(type?.MsCategory);

      return {
        transactionId: item.transactionId,
        typeColorId: item.typeColorId,
        categoryName: category?.categoryName || null,
        typeName: type?.typeName || null,
        typeCode: type?.typeCode || null,
        colorName: pickFirst(typeColor?.MsColor)?.colorName || null,
        customerName: null,
        noMesin: item.noMesin,
        noRangka: item.noRangka,
        year: item.year,
        isRFS: item.isRFS,
        dateDO: item.dateDO,
        dateOUT: item.dateOUT,
      };
    };

    const beginningRows = (beginningResponse.data || []).map(mapRow);
    const incomingRows = (incomingResponse.data || []).map(mapRow);
    const soldRows = (soldResponse.data || []).map(mapRow);

    const balanceMap = new Map<number, ReportTransactionSummaryRow>();

    beginningRows.forEach((item) => {
      balanceMap.set(item.transactionId, item);
    });

    incomingRows.forEach((item) => {
      balanceMap.set(item.transactionId, item);
    });

    soldRows.forEach((item) => {
      balanceMap.delete(item.transactionId);
    });

    const endingRows = Array.from(balanceMap.values());

    return {
      error: null,
      status: 200,
      statusText: "OK",
      data: {
        beginningBalance: beginningRows.length,
        endingBalance: endingRows.length,
        beginningRows,
        endingRows,
      },
    };
  } finally {
    setIsLoading?.(false);
  }
};

export const ReportService = {
  getTableReportData,
  getBalance,
};
