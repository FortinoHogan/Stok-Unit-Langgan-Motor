import { useEffect, useMemo, useState } from "react"

import AppCard from "@/components/app-components/app-card/AppCard"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type TransactionDateSelectionPageProps = {
  mode: "DO" | "SELLING"
}

type MonthOption = {
  value: number
  label: string
}

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" })

const monthOptions: MonthOption[] = Array.from({ length: 12 }, (_, index) => ({
  value: index,
  label: monthFormatter.format(new Date(2026, index, 1)),
}))

const getTotalDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

const TransactionDateSelectionPage = ({ mode }: TransactionDateSelectionPageProps) => {
  const today = new Date()
  const currentYear = today.getFullYear()

  const yearOptions = useMemo(
    () => Array.from({ length: 7 }, (_, index) => currentYear + index),
    [currentYear],
  )

  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate())

  const totalDays = useMemo(
    () => getTotalDaysInMonth(selectedYear, selectedMonth),
    [selectedMonth, selectedYear],
  )

  const dayOptions = useMemo(
    () => Array.from({ length: totalDays }, (_, index) => index + 1),
    [totalDays],
  )

  useEffect(() => {
    if (selectedDay <= totalDays) {
      return
    }

    setSelectedDay(totalDays)
  }, [selectedDay, totalDays])

  const selectedDate = useMemo(
    () => new Date(selectedYear, selectedMonth, selectedDay),
    [selectedDay, selectedMonth, selectedYear],
  )

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(selectedDate)

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          {mode === "DO" ? "Delivery Order" : "Selling"}
        </h1>
        <p className="text-muted-foreground">
          Choose transaction date step by step: Year, Month, then Day.
        </p>
      </div>

      <AppCard
        title="Pick Transaction Date"
        description="Step 1: Choose year. Step 2: Choose month. Step 3: Choose day."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">Year</p>
            <Select
              value={String(selectedYear)}
              onValueChange={(value) => {
                setSelectedYear(Number(value))
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Month</p>
            <Select
              value={String(selectedMonth)}
              onValueChange={(value) => {
                setSelectedMonth(Number(value))
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={String(month.value)}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Day</p>
            <Select
              value={String(selectedDay)}
              onValueChange={(value) => {
                setSelectedDay(Number(value))
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {dayOptions.map((day) => (
                  <SelectItem key={day} value={String(day)}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </AppCard>

      <AppCard title="Selected Date">
        <p className="text-sm text-muted-foreground">
          {mode === "DO" ? "Delivery Order" : "Selling"} date: <span className="font-semibold text-foreground">{formattedDate}</span>
        </p>
      </AppCard>
    </div>
  )
}

export default TransactionDateSelectionPage
