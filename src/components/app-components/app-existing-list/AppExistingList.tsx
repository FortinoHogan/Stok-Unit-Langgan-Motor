import type { AppExistingListProps } from "./AppExistingList.interface"

const AppExistingList = (props: AppExistingListProps) => {
    const {
        title = "Existing List",
        items,
        emptyMessage = "No data",
    } = props

    return (
        <div>
            <p className="mb-2 text-sm font-medium">{title}</p>
            <div className="max-h-36 overflow-y-auto rounded-md border p-2">
                {items.length ? (
                    <div className="flex flex-wrap gap-2">
                        {items.map((item, index) => (
                            <span
                                key={`${item}-${index}`}
                                className="rounded-md bg-muted px-2 py-1 text-xs"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                )}
            </div>
        </div>
    )
}

export default AppExistingList
