import type {
  IResponse,
  MsCategory,
  MsType,
  TrTransaction,
} from "@/interfaces/IModel.interface";
import type {
  GetYearOptionsRequest,
  GetColorOptionsByTypeRequest,
  GetTransactionsByYearRequest,
  GetCategoryOptionsRequest,
  GetSellableTransactionsByDateRequest,
  GetTypeOptionsByCategoryRequest,
  InsertTransactionRequest,
  TransactionCategoryMapRow,
  TransactionColorMapRow,
  TransactionDetailRow,
  TransactionTypeColorOption,
  TransactionTypeColorMapRow,
  TransactionTypeMapRow,
  RawTransactionDetailRow,
  UpdateTransactionAsSoldRequest,
  UpdateTransactionRequest,
  DeleteTransactionRequest,
  GetTypeColorOptionsRequest,
} from "@/interfaces/ITransactionService";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";
import type { AutoCompleteOption } from "@/components/app-components/app-auto-complete/AppAutoComplete.interface";

const getTransactionsByYear = async (
  params: GetTransactionsByYearRequest,
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
  params?: GetTypeColorOptionsRequest,
): Promise<IResponse<TransactionTypeColorOption[]>> => {
  const { setIsLoading } = params || {};

  setIsLoading?.(true);

  try {
    const response = await ApiService.request<any[]>(async () => {
      const res = await supabase
        .from("TrTypeColor")
        .select(
          `
    typeColorId,
    MsType!inner (
      typeName,
      typeCode,
      isDeleted,
      MsCategory!inner (
        categoryName,
        isDeleted
      )
    ),
    MsColor!inner (
      colorName,
      isDeleted
    )
  `,
        )
        .eq("isDeleted", false)
        .eq("MsType.isDeleted", false)
        .eq("MsType.MsCategory.isDeleted", false)
        .eq("MsColor.isDeleted", false);

      return res;
    });

    const optionRows: TransactionTypeColorOption[] = (response.data || []).map(
      (item) => ({
        typeColorId: item.typeColorId,
        categoryName: item.MsType?.MsCategory?.categoryName || null,
        typeName: item.MsType?.typeName || null,
        typeCode: item.MsType?.typeCode || null,
        colorName: item.MsColor?.colorName || null,
      }),
    );

    return {
      ...response,
      data: optionRows,
    };
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const getCategoryOptions = async (
  params?: GetCategoryOptionsRequest,
): Promise<IResponse<AutoCompleteOption[]>> => {
  const { setIsLoading } = params || {};

  setIsLoading?.(true);

  try {
    const response = await ApiService.request<MsCategory[]>(() =>
      supabase
        .from("MsCategory")
        .select("*", { count: "exact" })
        .eq("isDeleted", false)
        .order("createdAt", { ascending: false })
        .order("categoryId", { ascending: false }),
    );

    const optionRows = (response.data || []).map((item) => ({
      value: item.categoryId.toString(),
      label: item.categoryName,
    }));

    return {
      ...response,
      data: optionRows,
    };
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const getTypeOptionsByCategory = async (
  params: GetTypeOptionsByCategoryRequest,
): Promise<IResponse<AutoCompleteOption[]>> => {
  const { categoryId, setIsLoading } = params;

  setIsLoading?.(true);

  try {
    const res = await ApiService.request<MsType[]>(() => {
      let query = supabase
        .from("MsType")
        .select("*", { count: "exact" })
        .eq("isDeleted", false)
        .order("typeName", { ascending: true });

      if (categoryId !== "All") {
        query = query.eq("categoryId", categoryId);
      }

      return query;
    });

    const optionRows = (res.data || []).map((item) => ({
      value: item.typeId.toString(),
      label: item.typeName,
    }));

    return {
      ...res,
      data: optionRows,
    };
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const getColorOptionsByType = async (
  params: GetColorOptionsByTypeRequest,
): Promise<IResponse<AutoCompleteOption[]>> => {
  const { typeId, setIsLoading } = params;

  setIsLoading?.(true);

  try {
    const response = await ApiService.request<any[]>(async () => {
      let query = supabase
        .from("TrTypeColor")
        .select(
          `
          MsColor!inner (
            colorId,
            colorName,
            isDeleted
          )
        `,
        )
        .eq("isDeleted", false)
        .eq("MsColor.isDeleted", false);

      if (typeId !== "All") {
        query = query.eq("typeId", typeId);
      }

      const res = await query;

      return res;
    });

    const uniqueMap = new Map<string, AutoCompleteOption>();

    (response.data || []).forEach((item) => {
      const color = item.MsColor;

      if (!color) return;

      uniqueMap.set(color.colorId.toString(), {
        value: color.colorId.toString(),
        label: color.colorName,
      });
    });

    return {
      ...response,
      data: [...uniqueMap.values()].sort((a, b) =>
        a.label.localeCompare(b.label),
      ),
    };
  } finally {
    setIsLoading?.(false);
  }
};

const getYearFilterOptions = async (
  params?: GetYearOptionsRequest,
): Promise<IResponse<AutoCompleteOption[]>> => {
  const { categoryId, typeId, colorId, setIsLoading } = params || {};

  setIsLoading?.(true);

  try {
    const response = await ApiService.request<any[]>(async () => {
      let query = supabase
        .from("TrTransaction")
        .select(
          `
          year,
          TrTypeColor!inner (
            typeId,
            colorId,
            isDeleted,
            MsType!inner (
              categoryId,
              isDeleted,
              MsCategory!inner (isDeleted)
            ),
            MsColor!inner (isDeleted)
          )
        `,
        )
        .eq("isDeleted", false)
        .eq("TrTypeColor.isDeleted", false)
        .eq("TrTypeColor.MsType.isDeleted", false)
        .eq("TrTypeColor.MsType.MsCategory.isDeleted", false)
        .eq("TrTypeColor.MsColor.isDeleted", false)
        .order("year", { ascending: true });

      if (categoryId) {
        query = query.eq("TrTypeColor.MsType.categoryId", categoryId);
      }

      if (typeId) {
        query = query.eq("TrTypeColor.typeId", typeId);
      }

      if (colorId) {
        query = query.eq("TrTypeColor.colorId", colorId);
      }

      const res = await query;

      return res;
    });

    const yearOptions = Array.from(
      new Set((response.data || []).map((item) => String(item.year))),
    )
      .filter((yearValue) => yearValue !== "null" && yearValue !== "undefined")
      .sort((a, b) => Number(a) - Number(b))
      .map((yearValue) => ({
        value: yearValue,
        label: yearValue,
      }));

    return {
      ...response,
      data: yearOptions,
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
        .select(
          "transactionId, typeColorId, noMesin, noRangka, year, isRFS, dateDO, dateOUT",
        )
        .eq("isDeleted", false)
        .not("dateDO", "is", null)
        .lte("dateDO", date)
        .is("dateOUT", null)
        .order("dateDO", { ascending: true }),
    );

    const transactionRows = response.data || [];
    const typeColorIds = [
      ...new Set(transactionRows.map((item) => item.typeColorId)),
    ];

    if (!typeColorIds.length) {
      return {
        ...response,
        data: [],
      };
    }

    const typeColorMapResponse = await ApiService.request<
      TransactionTypeColorMapRow[]
    >(() =>
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

    const typeMapResponse = await ApiService.request<TransactionTypeMapRow[]>(
      () =>
        supabase
          .from("MsType")
          .select("typeId, typeName, typeCode, categoryId")
          .eq("isDeleted", false)
          .in("typeId", typeIds),
    );

    const typeMapRows = typeMapResponse.data || [];
    const categoryIds = [
      ...new Set(typeMapRows.map((item) => item.categoryId)),
    ];

    const categoryMapRows: TransactionCategoryMapRow[] = categoryIds.length
      ? (
          await ApiService.request<TransactionCategoryMapRow[]>(() =>
            supabase
              .from("MsCategory")
              .select("categoryId, categoryName")
              .eq("isDeleted", false)
              .in("categoryId", categoryIds),
          )
        ).data || []
      : [];

    const colorMapRows: TransactionColorMapRow[] = colorIds.length
      ? (
          await ApiService.request<TransactionColorMapRow[]>(() =>
            supabase
              .from("MsColor")
              .select("colorId, colorName")
              .eq("isDeleted", false)
              .in("colorId", colorIds),
          )
        ).data || []
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
  getTransactionsByYear,
  getTypeColorOptions,
  getCategoryOptions,
  getTypeOptionsByCategory,
  getColorOptionsByType,
  getYearFilterOptions,
  getSellableTransactionsByDate,
  updateTransactionAsSold,
  updateTransaction,
  deleteTransaction,
  insertTransaction,
};
