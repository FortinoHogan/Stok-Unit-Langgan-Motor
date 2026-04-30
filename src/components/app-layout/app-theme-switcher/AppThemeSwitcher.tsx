import { useTheme } from "@/helpers/provider/ThemeProvider"
import { Switch } from "@/components/ui/switch"

const AppThemeSwitcher = () => {
    const { theme, setTheme } = useTheme()

    return (
        <div className="flex items-center gap-2">
            <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                id="theme-switch"
            />
            <label htmlFor="theme-switch" className="text-xs">
                {theme === "dark" ? "Dark" : "Light"}
            </label>
        </div>
    )
}

export default AppThemeSwitcher