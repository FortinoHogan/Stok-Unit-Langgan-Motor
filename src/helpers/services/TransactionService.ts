import type {
  IResponse,
  MsCategory,
  MsType,
  TrTransaction,
  TrTransactionDetail,
} from "@/interfaces/IModel.interface";
import type {
  GetYearOptionsRequest,
  GetColorOptionsByTypeRequest,
  GetCategoryOptionsRequest,
  GetTypeOptionsByCategoryRequest,
  InsertTransactionRequest,
  TransactionDetailRow,
  TransactionTypeColorOption,
  UpdateTransactionAsSoldRequest,
  UpdateTransactionRequest,
  DeleteTransactionRequest,
  GetTypeColorOptionsRequest,
  GetTableTransactionDataRequest,
  GetTransactionDetailByTransactionIdRequest,
  GetTransactionPrintDataByTransactionIdRequest,
  InsertTransactionDetailRequest,
  TransactionPrintData,
  UpdateTransactionDetailRequest,
  DeleteTransactionDetailRequest,
} from "@/interfaces/ITransactionService";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";
import type { AutoCompleteOption } from "@/components/app-components/app-auto-complete/AppAutoComplete.interface";

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
      label: item.typeCode + " - " + item.typeName,
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
  const { categoryId, typeId, setIsLoading } = params;

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
          ),
          MsType!inner (
            typeId,
            categoryId
          )
        `,
        )
        .eq("isDeleted", false)
        .eq("MsColor.isDeleted", false)
        .order("createdAt", {
          referencedTable: "MsColor",
          ascending: false,
        })
        .order("colorId", {
          referencedTable: "MsColor",
          ascending: false,
        });

      if (categoryId !== "All") {
        query = query.eq("MsType.categoryId", categoryId);
      }

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

      if (categoryId !== "All") {
        query = query.eq("TrTypeColor.MsType.categoryId", categoryId);
      }

      if (typeId !== "All") {
        query = query.eq("TrTypeColor.typeId", typeId);
      }

      if (colorId !== "All") {
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

const getTableTransactionData = async (
  params: GetTableTransactionDataRequest,
): Promise<IResponse<TransactionDetailRow[]>> => {
  const {
    search,
    transactionYear,
    transactionMonth,
    transactionDay,
    categoryId,
    typeId,
    colorId,
    year,
    isRFS,
    isSold,
    setIsLoading,
  } = params;

  setIsLoading?.(true);

  try {
    const parsedYear = Number(transactionYear);
    const resolvedYear =
      Number.isInteger(parsedYear) && parsedYear > 0
        ? parsedYear
        : new Date().getFullYear();
    const parsedMonth = Number(transactionMonth);
    const hasMonth =
      Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12;
    const parsedDay = Number(transactionDay);
    const maxDayInMonth = hasMonth
      ? new Date(resolvedYear, parsedMonth, 0).getDate()
      : 31;
    const hasDay =
      hasMonth &&
      Number.isInteger(parsedDay) &&
      parsedDay >= 1 &&
      parsedDay <= maxDayInMonth;

    const selectedDate = hasDay
      ? new Date(resolvedYear, parsedMonth - 1, parsedDay, 23, 59, 59)
      : hasMonth
        ? new Date(resolvedYear, parsedMonth, 0, 23, 59, 59)
        : new Date(resolvedYear, 11, 31, 23, 59, 59);
    const selectedDateIso = selectedDate.toISOString();
    const selectedDayStart = hasDay
      ? new Date(Date.UTC(resolvedYear, parsedMonth - 1, parsedDay, 0, 0, 0, 0))
      : hasMonth
        ? new Date(Date.UTC(resolvedYear, parsedMonth - 1, 1, 0, 0, 0, 0))
        : new Date(Date.UTC(resolvedYear, 0, 1, 0, 0, 0, 0));
    const selectedDayEnd = hasDay
      ? new Date(
          Date.UTC(resolvedYear, parsedMonth - 1, parsedDay, 23, 59, 59, 999),
        )
      : hasMonth
        ? new Date(Date.UTC(resolvedYear, parsedMonth, 0, 23, 59, 59, 999))
        : new Date(Date.UTC(resolvedYear, 11, 31, 23, 59, 59, 999));
    const selectedDayStartIso = selectedDayStart.toISOString();
    const selectedDayEndIso = selectedDayEnd.toISOString();

    let query = supabase
      .from("TrTransaction")
      .select(
        `
        *,
        TrTypeColor!inner (
          *,
          MsColor!inner (
            colorId,
            colorName,
            isDeleted
          ),
          MsType!inner (
            typeId,
            typeName,
            typeCode,
            categoryId,
            isDeleted,
            MsCategory!inner (
              categoryId,
              categoryName,
              isDeleted
            )
          )
        )
      `,
        { count: "exact" },
      )
      .eq("isDeleted", false)
      .eq("TrTypeColor.isDeleted", false)
      .eq("TrTypeColor.MsColor.isDeleted", false)
      .eq("TrTypeColor.MsType.isDeleted", false)
      .eq("TrTypeColor.MsType.MsCategory.isDeleted", false);

    if (isSold) {
      query = query
        .gte("dateOUT", selectedDayStartIso)
        .lte("dateOUT", selectedDayEndIso);
    } else {
      query = query.lte("dateDO", selectedDateIso).is("dateOUT", null);
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

    if (year !== "All") {
      query = query.eq("year", year);
    }

    query = query.eq("isRFS", isRFS);

    if (search?.trim()) {
      const escapedSearch = search.trim().replace(/,/g, "\\,");
      query = query.or(
        `noMesin.ilike.%${escapedSearch}%,noRangka.ilike.%${escapedSearch}%`,
      );
    }

    const response = await ApiService.request<any[]>(() => query);

    const mappedRows: TransactionDetailRow[] = (response.data || []).map(
      (item) => {
        return {
          transactionId: item.transactionId,
          typeColorId: item.typeColorId,
          categoryName:
            item.TrTypeColor?.MsType?.MsCategory?.categoryName || null,
          typeName: item.TrTypeColor?.MsType?.typeName || null,
          typeCode: item.TrTypeColor?.MsType?.typeCode || null,
          colorName: item.TrTypeColor?.MsColor?.colorName || null,
          noMesin: item.noMesin,
          noRangka: item.noRangka,
          year: item.year,
          isRFS: item.isRFS,
          dateDO: item.dateDO,
          dateOUT: item.dateOUT,
          transactionDetailId: 0,
          volumeId: null,
          volumeLabel: null,
          sellingTypeId: null,
          sellingTypeName: null,
          sellingNumber: null,
          name: null,
          address: null,
          phone: null,
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

const getTransactionDetailByTransactionId = async (
  params: GetTransactionDetailByTransactionIdRequest,
): Promise<IResponse<TrTransactionDetail>> => {
  const { transactionId, setIsLoading } = params;

  setIsLoading?.(true);

  try {
    const res = await ApiService.request<TrTransactionDetail>(() =>
      supabase
        .from("TrTransactionDetail")
        .select("*")
        .eq("transactionId", transactionId)
        .eq("isDeleted", false)
        .maybeSingle(),
    );

    return res;
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const getTransactionPrintDataByTransactionId = async (
  params: GetTransactionPrintDataByTransactionIdRequest,
): Promise<IResponse<TransactionPrintData>> => {
  const { transactionId, setIsLoading } = params;

  setIsLoading?.(true);

  try {
    const response = await ApiService.request<any>(() =>
      supabase
        .from("TrTransaction")
        .select(
          `
          transactionId,
          noMesin,
          noRangka,
          year,
          dateOUT,
          TrTypeColor!inner (
            MsColor!inner (
              colorName,
              isDeleted
            ),
            MsType!inner (
              typeName,
              typeCode,
              typeDescription,
              isDeleted,
              MsCategory!inner (
                isDeleted
              )
            )
          ),
          TrTransactionDetail!inner (
            transactionDetailId,
            volumeId,
            sellingTypeId,
            sellingNumber,
            name,
            address,
            phone,
            isDeleted,
            MsVolume!inner (
              volume,
              isDeleted
            ),
            MsSellingType!inner (
              sellingTypeName,
              isDeleted
            )
          )
        `,
        )
        .eq("transactionId", transactionId)
        .eq("isDeleted", false)
        .eq("TrTypeColor.MsColor.isDeleted", false)
        .eq("TrTypeColor.MsType.isDeleted", false)
        .eq("TrTypeColor.MsType.MsCategory.isDeleted", false)
        .eq("TrTransactionDetail.MsVolume.isDeleted", false)
        .eq("TrTransactionDetail.MsSellingType.isDeleted", false)
        .eq("TrTransactionDetail.isDeleted", false)
        .single(),
    );

    const item = response.data;

    return {
      ...response,
      data: item
        ? {
            transactionId: item.transactionId,
            typeName: item.TrTypeColor?.MsType?.typeName || null,
            typeCode: item.TrTypeColor?.MsType?.typeCode || null,
            typeDescription: item.TrTypeColor?.MsType?.typeDescription || null,
            colorName: item.TrTypeColor?.MsColor?.colorName || null,
            year: item.year,
            volumeId: item.TrTransactionDetail[0]?.volumeId || null,
            volume: item.TrTransactionDetail[0]?.MsVolume?.volume || null,
            noRangka: item.noRangka,
            noMesin: item.noMesin,
            sellingTypeId: item.TrTransactionDetail[0]?.sellingTypeId || null,
            sellingTypeName:
              item.TrTransactionDetail[0]?.MsSellingType?.sellingTypeName ||
              null,
            sellingNumber: item.TrTransactionDetail[0]?.sellingNumber || null,
            name: item.TrTransactionDetail[0]?.name || null,
            address: item.TrTransactionDetail[0]?.address || null,
            phone: item.TrTransactionDetail[0]?.phone || null,
            dateOUT: item.dateOUT,
            salesName: null,
            period: null,
            programName: null,
          }
        : null,
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

const insertTransactionDetail = async (
  params: InsertTransactionDetailRequest,
): Promise<IResponse<TrTransactionDetail>> => {
  const {
    transactionId,
    volumeId,
    sellingTypeId,
    sellingNumber,
    name,
    address,
    phone,
    userIn,
    setIsLoading,
  } = params;

  setIsLoading?.(true);

  try {
    const res = await ApiService.request<TrTransactionDetail>(() =>
      supabase
        .from("TrTransactionDetail")
        .insert({
          transactionId,
          volumeId,
          sellingTypeId,
          sellingNumber,
          name,
          address,
          phone,
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

const updateTransactionDetail = async (
  params: UpdateTransactionDetailRequest,
): Promise<IResponse<TrTransactionDetail>> => {
  const {
    transactionDetailId,
    transactionId,
    volumeId,
    sellingTypeId,
    sellingNumber,
    name,
    address,
    phone,
    userUp,
    updatedAt,
    setIsLoading,
  } = params;

  setIsLoading?.(true);

  try {
    const res = await ApiService.request<TrTransactionDetail>(() =>
      supabase
        .from("TrTransactionDetail")
        .update({
          volumeId,
          sellingTypeId,
          sellingNumber,
          name,
          address,
          phone,
          userUp,
          updatedAt,
        })
        .eq("transactionDetailId", transactionDetailId)
        .eq("transactionId", transactionId)
        .eq("isDeleted", false)
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
    typeColorId,
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
          typeColorId,
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

const deleteTransactionDetail = async (
  params: DeleteTransactionDetailRequest,
): Promise<IResponse<TrTransactionDetail[]>> => {
  const { transactionId, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    const res = await ApiService.request<TrTransactionDetail[]>(() =>
      supabase
        .from("TrTransactionDetail")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("transactionId", transactionId)
        .eq("isDeleted", false)
        .select(),
    );

    return res;
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

export const TransactionService = {
  getTypeColorOptions,
  getCategoryOptions,
  getTypeOptionsByCategory,
  getColorOptionsByType,
  getYearFilterOptions,
  getTableTransactionData,
  getTransactionDetailByTransactionId,
  getTransactionPrintDataByTransactionId,

  updateTransactionAsSold,
  insertTransactionDetail,
  updateTransactionDetail,
  updateTransaction,
  deleteTransactionDetail,
  deleteTransaction,
  insertTransaction,
};
