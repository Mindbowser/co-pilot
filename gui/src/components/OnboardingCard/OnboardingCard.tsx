import { useAppSelector } from "../../redux/hooks";
import { getLocalStorage, setLocalStorage } from "../../util/localStorage";
import { ReusableCard } from "../ReusableCard";
import { TabTitle } from "./components/OnboardingCardTabs";
import { useOnboardingCard } from "./hooks/useOnboardingCard";
import * as Tabs from "./tabs";

export interface OnboardingCardState {
  show?: boolean;
  activeTab?: TabTitle;
}

interface OnboardingCardProps {
  isDialog?: boolean;
}

export function OnboardingCard({ isDialog }: OnboardingCardProps) {
  const onboardingCard = useOnboardingCard();
  const config = useAppSelector((store) => store.config.config);

  if (getLocalStorage("onboardingStatus") === undefined) {
    setLocalStorage("onboardingStatus", "Started");
  }

  return (
    <ReusableCard
      showCloseButton={false}
      testId="onboarding-card"
    >
      <div className="content py-4"><Tabs.Quickstart /></div>
    </ReusableCard>
  );
}
