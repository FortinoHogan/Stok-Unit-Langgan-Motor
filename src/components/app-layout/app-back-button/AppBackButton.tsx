import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

type AppBackButtonProps = {
  label?: string;
};

const AppBackButton = (props: AppBackButtonProps) => {
  const { label } = props;
  const navigate = useNavigate();

  return (
    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
      <ArrowLeft className="size-4" />
      {label}
    </Button>
  );
};

export default AppBackButton;
