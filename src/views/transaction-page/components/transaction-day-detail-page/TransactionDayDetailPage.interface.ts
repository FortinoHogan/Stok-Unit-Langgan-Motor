import type { TransactionDetailRow } from "@/interfaces/ITransactionService"
import type { TransactionMode } from "../../TransactionPage.constant"

export interface TransactionDayDetailPageProps {
  mode: TransactionMode
}

export interface TransactionDayGroupedRow {
  key: string
  categoryName: string
  typeName: string
  typeCode: string
  year: number
  quantity: number
  details: TransactionDetailRow[]
}
