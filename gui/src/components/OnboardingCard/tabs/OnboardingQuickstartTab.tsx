import QuickStartSubmitButton from "../components/QuickStartSubmitButton";

interface OnboardingQuickstartTabProps {
  isDialog?: boolean;
}

function OnboardingQuickstartTab({ isDialog }: OnboardingQuickstartTabProps) {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="flex flex-col items-center justify-center w-full max-w-full px-4 xs:px-0 text-center">
        <div className="hidden xs:flex text-3xl">
          Epico - Pilot
        </div>

        <p className="text-sm w-full xs:w-3/4">
          Welcome to Epico - Pilot! We're excited to have you on board!
        </p>

        <QuickStartSubmitButton isDialog={isDialog} />
      </div>
    </div>
  );
}

export default OnboardingQuickstartTab;
