import { ThemeProvider } from "@/helpers/provider/ThemeProvider"
import AppRouter from "@/router/AppRouter"
import { BrowserRouter as Router } from "react-router-dom"

export function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AppRouter />
      </ThemeProvider>
    </Router>
  )
}

export default App