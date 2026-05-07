export const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" })

export const getMonthIndex = (dateText?: string | null) => {
  if (!dateText) {
    return null
  }

  const parsed = new Date(dateText)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.getMonth() + 1
}

export const getDayIndex = (dateText?: string | null) => {
  if (!dateText) {
    return null
  }

  const parsed = new Date(dateText)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.getDate()
}