import { ThemeProvider } from "@/helpers/provider/ThemeProvider"
import AppRouter from "@/router/router/AppRouter"

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AppRouter />
    </ThemeProvider>
  )
}

export default App