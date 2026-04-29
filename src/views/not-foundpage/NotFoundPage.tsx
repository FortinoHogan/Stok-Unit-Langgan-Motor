import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { routes } from "@/constants/paths"

const NotFoundPage = () => {
    return (
        <main className="flex items-center justify-center min-h-screen">
            <Empty>
                <EmptyHeader>
                    <EmptyTitle>404 - Not Found</EmptyTitle>
                    <EmptyDescription>
                        The page you&apos;re looking for doesn&apos;t exist. Try searching for
                        what you need below.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <EmptyDescription>
                        Maybe try returning home? <a href={routes.home}>Go to Home</a>
                    </EmptyDescription>
                </EmptyContent>
            </Empty>
        </main>
    )
}

export default NotFoundPage