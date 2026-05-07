import type { IResponse, TrTransaction } from "@/interfaces/IModel.interface";
import type {
  GetTransactionsByModeYearRequest,
  GetDistinctTransactionYearsRequest,
  InsertTransactionRequest,
  TransactionCategoryMapRow,
  TransactionDetailRow,
  TransactionTypeColorMapRow,
  TransactionTypeMapRow,
  TransactionYearRow,
  RawTransactionDetailRow,
} from "@/interfaces/ITransactionService";
import { ApiService } from "@/utilities/ApiService";
import type { TransactionDistinctYears } from "@/views/transaction-page/TransactionPage.interface";
import { supabase } from "../supabase/client";
import { parseYear } from "@/lib/utils";

const getTransactionYearRows = async (
  params?: GetDistinctTransactionYearsRequest,
): Promise<IResponse<TransactionYearRow[]>> => {
  const { setIsLoading } = params || {};
  setIsLoading?.(true);

  try {
    const res = await ApiService.request<TransactionYearRow[]>(() =>
      supabase
        .from("TrTransaction")
        .select("dateDO, dateOUT")
        .eq("isDeleted", false),
    );

    return res;
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const getDistinctTransactionYears = async (
  params?: GetDistinctTransactionYearsRequest,
): Promise<TransactionDistinctYears> => {
  const res = await getTransactionYearRows(params);
  const transactionRows = res.data || [];

  const dateDOYearQuantity: Record<number, number> = {};
  const dateOUTYearQuantity: Record<number, number> = {};

  transactionRows.forEach((row) => {
    const dateDOYear = parseYear(row.dateDO);
    const dateOUTYear = parseYear(row.dateOUT);

    if (dateDOYear !== null) {
      dateDOYearQuantity[dateDOYear] = (dateDOYearQuantity[dateDOYear] || 0) + 1;
    }

    if (dateOUTYear !== null) {
      dateOUTYearQuantity[dateOUTYear] = (dateOUTYearQuantity[dateOUTYear] || 0) + 1;
    }
  });

  const dateDOYears = Object.keys(dateDOYearQuantity)
    .map((year) => Number(year))
    .sort((a, b) => a - b);

  const dateOUTYears = Object.keys(dateOUTYearQuantity)
    .map((year) => Number(year))
    .sort((a, b) => a - b);

  return {
    dateDOYears,
    dateOUTYears,
    dateDOYearQuantity,
    dateOUTYearQuantity,
  };
};

const getTransactionsByModeYear = async (
  params: GetTransactionsByModeYearRequest,
): Promise<IResponse<TransactionDetailRow[]>> => {
  const { mode, year, setIsLoading } = params;
  const dateColumn = mode === "DO" ? "dateDO" : "dateOUT";
  const startDate = `${year}-01-01`;
  const endDate = `${year + 1}-01-01`;

  setIsLoading?.(true);

  try {
    const response = await ApiService.request<RawTransactionDetailRow[]>(() =>
      supabase
        .from("TrTransaction")
        .select("transactionId, typeColorId, noMesin, noRangka, year, isRFS, dateDO, dateOUT")
        .eq("isDeleted", false)
        .gte(dateColumn, startDate)
        .lt(dateColumn, endDate)
        .order(dateColumn, { ascending: true }),
    );

    const transactionRows = response.data || [];
    const typeColorIds = [...new Set(transactionRows.map((item) => item.typeColorId))];

    if (!typeColorIds.length) {
      return {
        ...response,
        data: [],
      };
    }

    const typeColorMapResponse = await ApiService.request<TransactionTypeColorMapRow[]>(() =>
      supabase
        .from("TrTypeColor")
        .select("typeColorId, typeId")
        .eq("isDeleted", false)
        .in("typeColorId", typeColorIds),
    );

    const typeColorMapRows = typeColorMapResponse.data || [];
    const typeIds = [...new Set(typeColorMapRows.map((item) => item.typeId))];

    if (!typeIds.length) {
      return {
        ...response,
        data: transactionRows.map((item) => ({
          ...item,
          categoryName: null,
          typeName: null,
          typeCode: null,
        })),
      };
    }

    const typeMapResponse = await ApiService.request<TransactionTypeMapRow[]>(() =>
      supabase
        .from("MsType")
        .select("typeId, typeName, typeCode, categoryId")
        .eq("isDeleted", false)
        .in("typeId", typeIds),
    );

    const typeMapRows = typeMapResponse.data || [];
    const categoryIds = [...new Set(typeMapRows.map((item) => item.categoryId))];

    const categoryMapRows: TransactionCategoryMapRow[] = categoryIds.length
      ? (await ApiService.request<TransactionCategoryMapRow[]>(() =>
          supabase
            .from("MsCategory")
            .select("categoryId, categoryName")
            .eq("isDeleted", false)
            .in("categoryId", categoryIds),
        )).data || []
      : [];

    const typeIdByTypeColorId = new Map<number, number>(
      typeColorMapRows.map((item) => [item.typeColorId, item.typeId]),
    );

    const typeByTypeId = new Map<number, TransactionTypeMapRow>(
      typeMapRows.map((item) => [item.typeId, item]),
    );

    const categoryByCategoryId = new Map<number, TransactionCategoryMapRow>(
      categoryMapRows.map((item) => [item.categoryId, item]),
    );

    const enrichedRows: TransactionDetailRow[] = transactionRows.map((item) => {
      const typeId = typeIdByTypeColorId.get(item.typeColorId);
      const typeData = typeId ? typeByTypeId.get(typeId) : undefined;
      const categoryData = typeData
        ? categoryByCategoryId.get(typeData.categoryId)
        : undefined;

      return {
        ...item,
        categoryName: categoryData?.categoryName || null,
        typeName: typeData?.typeName || null,
        typeCode: typeData?.typeCode || null,
      };
    });

    return {
      ...response,
      data: enrichedRows,
    };
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const insertTransaction = async (
  params: InsertTransactionRequest,
): Promise<IResponse<TrTransaction>> => {
  const {
    typeColorId,
    noMesin,
    noRangka,
    year,
    isRFS,
    dateDO,
    dateOUT,
    userIn,
    setIsLoading,
  } = params;

  setIsLoading?.(true);

  try {
    const res = await ApiService.request<TrTransaction>(() =>
      supabase
        .from("TrTransaction")
        .insert({
          typeColorId,
          noMesin,
          noRangka,
          year,
          isRFS,
          dateDO,
          dateOUT,
          userIn,
        })
        .select()
        .single(),
    );

    return res;
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

export const TransactionService = {
  getDistinctTransactionYears,
  getTransactionYearRows,
  getTransactionsByModeYear,
  insertTransaction,
};
