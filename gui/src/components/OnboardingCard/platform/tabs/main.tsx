import { useContext } from "react";
import { Button } from "../../..";
import { useAuth } from "../../../../context/Auth";
import { IdeMessengerContext } from "../../../../context/IdeMessenger";
import { hasPassedFTL } from "../../../../util/freeTrial";
import { useOnboardingCard } from "../../hooks";

export default function MainTab({
  onRemainLocal,
  isDialog,
}: {
  onRemainLocal: () => void;
  isDialog: boolean;
}) {
  const ideMessenger = useContext(IdeMessengerContext);
  const onboardingCard = useOnboardingCard();
  const auth = useAuth();

  function onGetStarted() {
    auth.login(true).then((success) => {
      if (success) {
        onboardingCard.close(isDialog);
      }
    });
  }

  function openPastFreeTrialOnboarding() {
    ideMessenger.post("controlPlane/openUrl", {
      path: "setup-models",
      orgSlug: auth.selectedOrganization?.slug,
    });
    onboardingCard.close(isDialog);
  }

  const pastFreeTrialLimit = hasPassedFTL();

  return (
    <div className="xs:px-0 flex w-full max-w-full flex-col items-center justify-center px-4 text-center">
      <div className="hidden xs:flex text-3xl">
        Epico - Pilot
      </div>

      <p className="text-sm w-full xs:w-3/4">
        Welcome to Epico - Pilot! We're excited to have you on board!
      </p>

      <Button
        onClick={onGetStarted}
        className="mt-4 grid w-full grid-flow-col items-center gap-2"
      >
        Get started
      </Button>
    </div>
  );
}
