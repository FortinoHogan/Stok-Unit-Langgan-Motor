import { transactionModeWordingList } from "./TransactionPage.constant"
import type { TransactionPageProps } from "./TransactionPage.interface"

const TransactionPage = (props: TransactionPageProps) => {
  const { mode } = props
  const modeWording = transactionModeWordingList[mode]

  return (
    <div>
      <div className="mb-2">
        <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          {modeWording.title}
        </h1>
        <p className="text-muted-foreground">{modeWording.description}</p>
      </div>
    </div>
  )
}

export default TransactionPage
