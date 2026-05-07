import { useMemo } from "react";

import { Button } from "@/components/ui/button";

type TodayButtonProps = {
  onGoToToday: () => void;
  activeDate: Date;
};

const TodayButton = ({ onGoToToday, activeDate }: TodayButtonProps) => {
  const activeDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(activeDate),
    [activeDate],
  );

  return (
    <div className="flex items-center gap-3">
      <Button type="button" onClick={onGoToToday}>
        Go to Today
      </Button>
      <p className="text-sm text-muted-foreground">Today: {activeDateLabel}</p>
    </div>
  );
};

export default TodayButton;
