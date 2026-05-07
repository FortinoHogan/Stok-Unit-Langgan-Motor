import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppDatePicker from "@/components/app-components/app-datepicker/AppDatePicker";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/paths";
import { TransactionService } from "@/helpers/services/TransactionService";
import TransactionErrorModal from "./components/transaction-error-modal/TransactionErrorModal";
import TodayButton from "./components/today-button/TodayButton";
import { transactionModeWordingList } from "./TransactionPage.constant";
import type { TransactionPageProps } from "./TransactionPage.interface";

const TransactionPage = (props: TransactionPageProps) => {
  const { mode } = props;
  const navigate = useNavigate();
  const modeWording = transactionModeWordingList[mode];

  const [dateDOYearQuantity, setDateDOYearQuantity] = useState<
    Record<number, number>
  >({});
  const [dateOUTYearQuantity, setDateOUTYearQuantity] = useState<
    Record<number, number>
  >({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isShowError, setIsShowError] = useState(false);
  const [activeDate, setActiveDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState<Date | undefined>(
    new Date(),
  );

  const handleGoToToday = () => {
    const today = new Date();
    setActiveDate(today);

    const detailPathTemplate =
      mode === "DO" ? routes.deliveryOrderDayDetail : routes.sellingDayDetail;

    navigate(
      detailPathTemplate
        .replace(":year", String(today.getFullYear()))
        .replace(":month", String(today.getMonth() + 1))
        .replace(":day", String(today.getDate())),
    );
  };

  const handleViewDetail = (year: number) => {
    const detailPathTemplate =
      mode === "DO" ? routes.deliveryOrderDetail : routes.sellingDetail;
    navigate(detailPathTemplate.replace(":year", String(year)));
  };

  const handleGoToSelectedYear = () => {
    if (!selectedYear) return;
    const year = selectedYear.getFullYear();
    handleViewDetail(year);
  };

  const getSelectedYearQuantity = () => {
    if (!selectedYear) return 0;
    const year = selectedYear.getFullYear();
    return modeYearQuantity[year] || 0;
  };

  const handleFetchDistinctYears = async () => {
    await TransactionService.getDistinctTransactionYears({
      setIsLoading: () => {},
    })
      .then((distinctYears) => {
        setDateDOYearQuantity(distinctYears.dateDOYearQuantity);
        setDateOUTYearQuantity(distinctYears.dateOUTYearQuantity);
      })
      .catch((error) => {
        setErrorMessage(error.message);
        setIsShowError(true);
      });
  };

  const modeYearQuantity = useMemo(() => {
    return mode === "DO" ? dateDOYearQuantity : dateOUTYearQuantity;
  }, [dateDOYearQuantity, dateOUTYearQuantity, mode]);

  useEffect(() => {
    handleFetchDistinctYears();
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          {modeWording.title}
        </h1>
        <p className="text-muted-foreground">{modeWording.description}</p>
      </div>

      <div className="mb-4">
        <TodayButton onGoToToday={handleGoToToday} activeDate={activeDate} />
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1 max-w-3xs">
            <AppDatePicker
              label="Select Transaction Year"
              placeholder="Pick a year"
              value={selectedYear}
              onValueChange={setSelectedYear}
              viewMode="year"
              withoutMargin
            />
          </div>
          <div className="text-right pb-0 flex">
            <p className="text-muted-foreground mb-1">Quantity: &nbsp;</p>
            <p className="font-semibold">
              {getSelectedYearQuantity()} {modeWording.cardAction}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleGoToSelectedYear}
            disabled={!selectedYear}
          >
            View Selected Year
          </Button>
        </div>
      </div>

      <TransactionErrorModal
        open={isShowError}
        onOpenChange={setIsShowError}
        errorMessage={errorMessage}
        onClose={() => {
          setErrorMessage("");
          setIsShowError(false);
        }}
      />
    </div>
  );
};

export default TransactionPage;
