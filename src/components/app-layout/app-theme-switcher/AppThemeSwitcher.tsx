import { useTheme } from "@/helpers/provider/ThemeProvider" 
import AppSwitch from "@/components/app-components/app-switch/AppSwitch"

const AppThemeSwitcher = () => {
    const { theme, setTheme } = useTheme()

    return (
        <div>
            <AppSwitch
            label={theme === "dark" ? "Dark Mode" : "Light Mode"}
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            withoutMargin
            />
        </div>
    )
}

export default AppThemeSwitcher