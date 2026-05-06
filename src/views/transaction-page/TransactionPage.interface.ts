export interface TransactionPageProps {
  mode: TransactionMode
}

export type TransactionMode = "DO" | "SELLING"

export type TransactionModeWording = {
  title: string
  description: string
}