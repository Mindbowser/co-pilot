import { ArrowLeftStartOnRectangleIcon, UserCircleIcon as UserCircleIconSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../context/Auth";
import { useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";
import HeaderButtonWithToolTip from "./gui/HeaderButtonWithToolTip";

function ProfileSwitcher() {
  const { logout } = useAuth();
  const accountEmail = useAppSelector(
    (state: RootState) => state.config?.accountEmail,
  );

  return (
    <>
      {accountEmail ? (
        <div className="flex w-full justify-between gap-2">
          <HeaderButtonWithToolTip
            tooltipPlacement="top-end"
            text={
              accountEmail === ""
                ? "Logged in"
                : `Logged in as ${accountEmail}`
            }
          >
            <UserCircleIconSolid className="h-4 w-4" />
          </HeaderButtonWithToolTip>
          <HeaderButtonWithToolTip
            tooltipPlacement="top-end"
            text="Logout"
            onClick={logout}
          >
            <ArrowLeftStartOnRectangleIcon className="h-4 w-4" />
          </HeaderButtonWithToolTip>
        </div>
        ) : (
          <></>
        )}
    </>
  );
}

export default ProfileSwitcher;