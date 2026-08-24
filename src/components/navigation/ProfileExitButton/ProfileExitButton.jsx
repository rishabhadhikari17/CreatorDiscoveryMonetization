import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDemoExperience } from "../../demo/DemoExperienceContext.js";
import { clearOnboardingProfile } from "../../../features/onboarding/onboardingStorage.js";
import "./ProfileExitButton.css";

export function ProfileExitButton({ roleLabel }) {
  const navigate = useNavigate();
  const { requestConfirmation, notify } = useDemoExperience();

  function requestExit() {
    requestConfirmation({
      title: "Exit this profile?",
      message: "Your locally saved GlobalGalli profile and unfinished onboarding draft will be removed from this device. The guided marketplace data will remain available.",
      confirmLabel: "Exit profile",
      cancelLabel: "Keep profile",
      onConfirm: () => {
        clearOnboardingProfile();
        navigate("/");
        notify({
          title: "Profile exited",
          message: "Your local profile has been cleared. You can explore the demo or start onboarding again.",
          tone: "info",
        });
      },
    });
  }

  return (
    <button
      className="profile-exit-button"
      type="button"
      onClick={requestExit}
      aria-label={`Exit ${roleLabel} profile`}
    >
      <LogOut size={15} />
      <span><strong>Exit profile</strong><small>Clear local profile and return home</small></span>
    </button>
  );
}
