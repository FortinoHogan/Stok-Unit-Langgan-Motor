import type { TransactionMode } from "../../TransactionPage.constant"
import type { TransactionDetailRow } from "@/interfaces/ITransactionService"

export interface TransactionYearDetailPageProps {
  mode: TransactionMode
}

export interface TransactionYearGroupedRow {
  key: string
  categoryName: string
  typeName: string
  typeCode: string
  year: number
  quantity: number
  details: TransactionDetailRow[]
}
