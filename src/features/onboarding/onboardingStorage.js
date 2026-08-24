const PREVIOUS_BRAND_PREFIX = ["global", "gali"].join("");

export const ONBOARDING_DRAFT_KEY = "globalgalli-onboarding-draft";
export const ONBOARDING_PROFILE_KEY = "globalgalli-onboarding-profile";
export const PREVIOUS_ONBOARDING_DRAFT_KEY = `${PREVIOUS_BRAND_PREFIX}-onboarding-draft`;
export const PREVIOUS_ONBOARDING_PROFILE_KEY = `${PREVIOUS_BRAND_PREFIX}-onboarding-profile`;
export const LEGACY_ONBOARDING_DRAFT_KEY = "vaani-onboarding-draft";
export const LEGACY_ONBOARDING_PROFILE_KEY = "vaani-onboarding-profile";

export function clearOnboardingProfile() {
  [
    ONBOARDING_DRAFT_KEY,
    ONBOARDING_PROFILE_KEY,
    PREVIOUS_ONBOARDING_DRAFT_KEY,
    PREVIOUS_ONBOARDING_PROFILE_KEY,
    LEGACY_ONBOARDING_DRAFT_KEY,
    LEGACY_ONBOARDING_PROFILE_KEY,
  ].forEach((key) => window.localStorage.removeItem(key));
}
