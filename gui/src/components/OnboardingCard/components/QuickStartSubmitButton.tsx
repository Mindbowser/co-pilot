import { FREE_TRIAL_MODELS } from "core/config/default";
import { useContext } from "react";
import { useDispatch } from "react-redux";
import { Button } from "../..";
import { IdeMessengerContext } from "../../../context/IdeMessenger";
import { setAccount, setDefaultModel } from "../../../redux/slices/configSlice";
import { useSubmitOnboarding } from "../hooks";

interface QuickstartSubmitButtonProps {
  isDialog?: boolean;
}

function QuickstartSubmitButton({ isDialog }: QuickstartSubmitButtonProps) {
  const ideMessenger = useContext(IdeMessengerContext);
  const dispatch = useDispatch();

  const { submitOnboarding } = useSubmitOnboarding("Quickstart", isDialog);

  function onComplete() {
    submitOnboarding();

    // Set Sonnet as the default model
    const title = FREE_TRIAL_MODELS[0].title;
    dispatch(setDefaultModel({ title, force: true }));
  }

  async function fetchAuthToken() {
    const result = await ideMessenger.request("getAuthToken", null);

    if (result.status === "success") {
      onComplete();
      dispatch(
        setAccount({ accountName: result?.content.account.label, accountEmail: result.content.account.id }),
      );
    }
  }

  async function onClick() {
    await fetchAuthToken();
  }

  return (
    <div className="mt-4 w-full">
      <Button
        onClick={onClick}
        className="grid w-full grid-flow-col items-center gap-2"
      >
        Login with Epico
      </Button>
    </div>
  );
}

export default QuickstartSubmitButton;
