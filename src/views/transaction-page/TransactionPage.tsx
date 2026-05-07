import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import AppCard from "@/components/app-components/app-card/AppCard"
import AppModal from "@/components/app-components/app-modal/AppModal"
import AppSkeleton from "@/components/app-components/app-skeleton/AppSkeleton"
import { Button } from "@/components/ui/button"
import { routes } from "@/constants/paths"
import { TransactionService } from "@/helpers/services/TransactionService"
import { transactionModeWordingList } from "./TransactionPage.constant"
import type { TransactionPageProps } from "./TransactionPage.interface"

const TransactionPage = (props: TransactionPageProps) => {
  const { mode } = props
  const navigate = useNavigate()
  const modeWording = transactionModeWordingList[mode]

  const [isLoadingYears, setIsLoadingYears] = useState(false)
  const [dateDOYears, setDateDOYears] = useState<number[]>([])
  const [dateOUTYears, setDateOUTYears] = useState<number[]>([])
  const [dateDOYearQuantity, setDateDOYearQuantity] = useState<Record<number, number>>({})
  const [dateOUTYearQuantity, setDateOUTYearQuantity] = useState<Record<number, number>>({})
  const [errorMessage, setErrorMessage] = useState("")
  const [isShowError, setIsShowError] = useState(false)
  const [activeDate, setActiveDate] = useState(new Date())

  const activeDateLabel = useMemo(
    () => new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(activeDate),
    [activeDate],
  )

  const handleGoToToday = () => {
    const today = new Date()
    setActiveDate(today)

    const detailPathTemplate = mode === "DO"
      ? routes.deliveryOrderDayDetail
      : routes.sellingDayDetail

    navigate(
      detailPathTemplate
        .replace(":year", String(today.getFullYear()))
        .replace(":month", String(today.getMonth() + 1))
        .replace(":day", String(today.getDate())),
    )
  }

  const handleViewDetail = (year: number) => {
    const detailPathTemplate = mode === "DO" ? routes.deliveryOrderDetail : routes.sellingDetail
    navigate(detailPathTemplate.replace(":year", String(year)))
  }

  const handleFetchDistinctYears = async () => {
    await TransactionService.getDistinctTransactionYears({ setIsLoading: setIsLoadingYears })
      .then((distinctYears) => {
        setDateDOYears(distinctYears.dateDOYears)
        setDateOUTYears(distinctYears.dateOUTYears)
        setDateDOYearQuantity(distinctYears.dateDOYearQuantity)
        setDateOUTYearQuantity(distinctYears.dateOUTYearQuantity)
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setIsShowError(true)
      })
  }

  const todayYear = useMemo(() => new Date().getFullYear(), [])

  const modeYears = useMemo(() => {
    return mode === "DO" ? dateDOYears : dateOUTYears
  }, [dateDOYears, dateOUTYears, mode])

  const displayYears = useMemo(
    () => (modeYears.length ? modeYears : [todayYear]),
    [modeYears, todayYear],
  )

  const modeYearQuantity = useMemo(() => {
    return mode === "DO" ? dateDOYearQuantity : dateOUTYearQuantity
  }, [dateDOYearQuantity, dateOUTYearQuantity, mode])

  useEffect(() => {
    handleFetchDistinctYears()
  }, [])

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          {modeWording.title}
        </h1>
        <p className="text-muted-foreground">{modeWording.description}</p>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <Button type="button" onClick={handleGoToToday}>
          Go to Today
        </Button>
        <p className="text-sm text-muted-foreground">Today: {activeDateLabel}</p>
      </div>

      {isLoadingYears ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AppSkeleton withoutMargin itemClassName="h-16 rounded-xl" />
          <AppSkeleton withoutMargin itemClassName="h-16 rounded-xl" />
          <AppSkeleton withoutMargin itemClassName="h-16 rounded-xl" />
          <AppSkeleton withoutMargin itemClassName="h-16 rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {displayYears.map((year) => (
            <AppCard
              key={`${mode}-${year}`}
              withoutMargin
              action={
                <p className="text-xs text-muted-foreground">
                  Qty: {modeYearQuantity[year] || 0} {modeWording.cardAction}
                </p>
              }
              classNames={{
                title: "text-xl",
                footer: "flex items-center justify-end",
              }}
              title={year}
              footer={
                <Button type="button" onClick={() => handleViewDetail(year)}>
                  View Detail
                </Button>
              }
            />
          ))}
        </div>
      )}

      <AppModal
        open={isShowError}
        onOpenChange={setIsShowError}
        title="Error"
        showCloseButton={true}
        classNames={{
          content: "sm:max-w-sm",
          header: "gap-1",
          title: "text-lg",
          description: "text-xs",
          body: "space-y-3",
          footer: "bg-muted/30",
        }}
        footer={
          <div className="flex w-full justify-center">
            <Button
              type="button"
              onClick={() => {
                setErrorMessage("")
                setIsShowError(false)
              }}
            >
              OK
            </Button>
          </div>
        }
      >
        <p>{errorMessage}</p>
      </AppModal>
    </div>
  )
}

export default TransactionPage
