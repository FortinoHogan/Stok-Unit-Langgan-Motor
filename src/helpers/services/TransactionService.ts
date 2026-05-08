import type { IResponse, TrTransaction } from "@/interfaces/IModel.interface";
import type {
  GetTransactionsByModeYearRequest,
  GetDistinctTransactionYearsRequest,
  GetSellableTransactionsByDateRequest,
  InsertTransactionRequest,
  TransactionCategoryMapRow,
  TransactionColorMapRow,
  TransactionDetailRow,
  TransactionTypeColorOption,
  TransactionTypeColorMapRow,
  TransactionTypeMapRow,
  TransactionYearRow,
  RawTransactionDetailRow,
  RawTypeColorOptionRow,
  UpdateTransactionAsSoldRequest,
  UpdateTransactionRequest,
  DeleteTransactionRequest,
} from "@/interfaces/ITransactionService";
import { ApiService } from "@/utilities/ApiService";
import type { TransactionDistinctYears } from "@/views/transaction-page/TransactionPage.interface";
import { supabase } from "../supabase/client";

const getTransactionYearRows = async (
  params?: GetDistinctTransactionYearsRequest,
): Promise<IResponse<TransactionYearRow[]>> => {
  const { setIsLoading } = params || {};
  setIsLoading?.(true);

  try {
    return {
      data: [],
      error: null,
      status: 200,
      statusText: "OK",
      count: 0,
    };
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const getDistinctTransactionYears = async (
  params?: GetDistinctTransactionYearsRequest,
): Promise<TransactionDistinctYears> => {
  const { setIsLoading } = params || {};
  setIsLoading?.(true);

  try {
    return {
      dateDOYears: [],
      dateOUTYears: [],
      dateDOYearQuantity: {},
      dateOUTYearQuantity: {},
    };
  } finally {
    setIsLoading?.(false);
  }
};

const getTransactionsByModeYear = async (
  params: GetTransactionsByModeYearRequest,
): Promise<IResponse<TransactionDetailRow[]>> => {
  const { setIsLoading } = params;

  setIsLoading?.(true);

  try {
    return {
      data: [],
      error: null,
      status: 200,
      statusText: "OK",
      count: 0,
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

const getTypeColorOptions = async (
  params?: GetDistinctTransactionYearsRequest,
): Promise<IResponse<TransactionTypeColorOption[]>> => {
  const { setIsLoading } = params || {};

  setIsLoading?.(true);

  try {
    const typeColorResponse = await ApiService.request<RawTypeColorOptionRow[]>(() =>
      supabase
        .from("TrTypeColor")
        .select("typeColorId, typeId, colorId")
        .eq("isDeleted", false)
        .order("typeColorId", { ascending: true }),
    );

    const typeColorRows = typeColorResponse.data || [];
    const typeIds = [...new Set(typeColorRows.map((item) => item.typeId))];
    const colorIds = [...new Set(typeColorRows.map((item) => item.colorId))];

    const typeMapRows = typeIds.length
      ? (await ApiService.request<TransactionTypeMapRow[]>(() =>
          supabase
            .from("MsType")
            .select("typeId, typeName, typeCode, categoryId")
            .eq("isDeleted", false)
            .in("typeId", typeIds),
        )).data || []
      : [];

    const categoryIds = [...new Set(typeMapRows.map((item) => item.categoryId))];

    const categoryMapRows = categoryIds.length
      ? (await ApiService.request<TransactionCategoryMapRow[]>(() =>
          supabase
            .from("MsCategory")
            .select("categoryId, categoryName")
            .eq("isDeleted", false)
            .in("categoryId", categoryIds),
        )).data || []
      : [];

    const colorMapRows = colorIds.length
      ? (await ApiService.request<TransactionColorMapRow[]>(() =>
          supabase
            .from("MsColor")
            .select("colorId, colorName")
            .eq("isDeleted", false)
            .in("colorId", colorIds),
        )).data || []
      : [];

    const typeByTypeId = new Map<number, TransactionTypeMapRow>(
      typeMapRows.map((item) => [item.typeId, item]),
    );
    const categoryByCategoryId = new Map<number, TransactionCategoryMapRow>(
      categoryMapRows.map((item) => [item.categoryId, item]),
    );
    const colorByColorId = new Map<number, TransactionColorMapRow>(
      colorMapRows.map((item) => [item.colorId, item]),
    );

    const optionRows: TransactionTypeColorOption[] = typeColorRows.map((item) => {
      const typeData = typeByTypeId.get(item.typeId);
      const categoryData = typeData
        ? categoryByCategoryId.get(typeData.categoryId)
        : undefined;
      const colorData = colorByColorId.get(item.colorId);

      return {
        typeColorId: item.typeColorId,
        categoryName: categoryData?.categoryName || null,
        typeName: typeData?.typeName || null,
        typeCode: typeData?.typeCode || null,
        colorName: colorData?.colorName || null,
      };
    });

    return {
      ...typeColorResponse,
      data: optionRows,
    };
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const getSellableTransactionsByDate = async (
  params: GetSellableTransactionsByDateRequest,
): Promise<IResponse<TransactionDetailRow[]>> => {
  const { date, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    const response = await ApiService.request<RawTransactionDetailRow[]>(() =>
      supabase
        .from("TrTransaction")
        .select("transactionId, typeColorId, noMesin, noRangka, year, isRFS, dateDO, dateOUT")
        .eq("isDeleted", false)
        .not("dateDO", "is", null)
        .lte("dateDO", date)
        .is("dateOUT", null)
        .order("dateDO", { ascending: true }),
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
        .select("typeColorId, typeId, colorId")
        .eq("isDeleted", false)
        .in("typeColorId", typeColorIds),
    );

    const typeColorMapRows = typeColorMapResponse.data || [];
    const typeIds = [...new Set(typeColorMapRows.map((item) => item.typeId))];
    const colorIds = [...new Set(typeColorMapRows.map((item) => item.colorId))];

    if (!typeIds.length) {
      return {
        ...response,
        data: transactionRows.map((item) => ({
          ...item,
          categoryName: null,
          typeName: null,
          typeCode: null,
          colorName: null,
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

    const colorMapRows: TransactionColorMapRow[] = colorIds.length
      ? (await ApiService.request<TransactionColorMapRow[]>(() =>
          supabase
            .from("MsColor")
            .select("colorId, colorName")
            .eq("isDeleted", false)
            .in("colorId", colorIds),
        )).data || []
      : [];

    const typeColorByTypeColorId = new Map<number, TransactionTypeColorMapRow>(
      typeColorMapRows.map((item) => [item.typeColorId, item]),
    );

    const typeByTypeId = new Map<number, TransactionTypeMapRow>(
      typeMapRows.map((item) => [item.typeId, item]),
    );

    const categoryByCategoryId = new Map<number, TransactionCategoryMapRow>(
      categoryMapRows.map((item) => [item.categoryId, item]),
    );

    const colorByColorId = new Map<number, TransactionColorMapRow>(
      colorMapRows.map((item) => [item.colorId, item]),
    );

    const enrichedRows: TransactionDetailRow[] = transactionRows.map((item) => {
      const typeColorData = typeColorByTypeColorId.get(item.typeColorId);
      const typeId = typeColorData?.typeId;
      const typeData = typeId ? typeByTypeId.get(typeId) : undefined;
      const categoryData = typeData
        ? categoryByCategoryId.get(typeData.categoryId)
        : undefined;
      const colorData = typeColorData
        ? colorByColorId.get(typeColorData.colorId)
        : undefined;

      return {
        ...item,
        categoryName: categoryData?.categoryName || null,
        typeName: typeData?.typeName || null,
        typeCode: typeData?.typeCode || null,
        colorName: colorData?.colorName || null,
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

const updateTransactionAsSold = async (
  params: UpdateTransactionAsSoldRequest,
): Promise<IResponse<TrTransaction>> => {
  const { transactionId, dateOUT, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    const res = await ApiService.request<TrTransaction>(() =>
      supabase
        .from("TrTransaction")
        .update({ dateOUT, userUp, updatedAt })
        .eq("transactionId", transactionId)
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

const updateTransaction = async (
  params: UpdateTransactionRequest,
): Promise<IResponse<TrTransaction>> => {
  const {
    transactionId,
    noMesin,
    noRangka,
    year,
    isRFS,
    dateDO,
    dateOUT,
    userUp,
    updatedAt,
    setIsLoading,
  } = params;
  setIsLoading?.(true);

  try {
    const res = await ApiService.request<TrTransaction>(() =>
      supabase
        .from("TrTransaction")
        .update({
          noMesin,
          noRangka,
          year,
          isRFS,
          dateDO,
          dateOUT,
          userUp,
          updatedAt,
        })
        .eq("transactionId", transactionId)
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

const deleteTransaction = async (
  params: DeleteTransactionRequest,
): Promise<IResponse<TrTransaction>> => {
  const { transactionId, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    const res = await ApiService.request<TrTransaction>(() =>
      supabase
        .from("TrTransaction")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("transactionId", transactionId)
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
  getTypeColorOptions,
  getSellableTransactionsByDate,
  updateTransactionAsSold,
  updateTransaction,
  deleteTransaction,
  insertTransaction,
};
