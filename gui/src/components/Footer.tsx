import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../redux/store";
import { isNewUserOnboarding, useOnboardingCard } from "./OnboardingCard";
import ProfileSwitcher from "./ProfileSwitcher";

function Footer() {
  const navigate = useNavigate();
  const onboardingCard = useOnboardingCard();
  const accountEmail = useSelector(
    (state: RootState) => state.config?.accountEmail,
  );

  const handleAccountClicked = () => {
    if (!accountEmail) {
      isNewUserOnboarding();
      onboardingCard.open("Quickstart");
      navigate("/");
    }
  } 

  return (
    <footer className="flex h-7 items-center justify-between overflow-hidden border-0 border-t border-solid border-t-zinc-700 p-2">
      <div className="flex w-full gap-2">
        <ProfileSwitcher />
        
        {accountEmail ? (
          <></>
          ) : 
          <div 
            onClick={handleAccountClicked} 
            style={{ cursor: 'pointer' }}
          >
            Sign In to Epico - Pilot
          </div>
        }
      </div>
    </footer>
  );
}

export default Footer;