import type { TransactionMode } from "../../TransactionPage.constant"
import type { TransactionDetailRow } from "@/interfaces/ITransactionService"

export interface TransactionMonthDetailPageProps {
  mode: TransactionMode
}

export interface TransactionGroupedRow {
  key: string
  categoryName: string
  typeName: string
  typeCode: string
  year: number
  quantity: number
  details: TransactionDetailRow[]
}