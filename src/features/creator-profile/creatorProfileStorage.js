const PREVIOUS_BRAND_PREFIX = ["global", "gali"].join("");

export const CREATOR_PROFILE_UPDATED_EVENT = "globalgalli:creator-profile-updated";

const storageKey = (creatorId) => `globalgalli-creator-profile-${creatorId}`;
const previousStorageKey = (creatorId) => `${PREVIOUS_BRAND_PREFIX}-creator-profile-${creatorId}`;

export function readCreatorProfileEdits(creatorId) {
  if (typeof window === "undefined") return null;

  try {
    const currentKey = storageKey(creatorId);
    const legacyKey = previousStorageKey(creatorId);
    const saved = window.localStorage.getItem(currentKey) ?? window.localStorage.getItem(legacyKey);
    if (!saved) return null;

    const profile = JSON.parse(saved);
    window.localStorage.setItem(currentKey, saved);
    window.localStorage.removeItem(legacyKey);
    return profile;
  } catch {
    return null;
  }
}

export function saveCreatorProfileEdits(creatorId, profile) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(storageKey(creatorId), JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent(CREATOR_PROFILE_UPDATED_EVENT, {
      detail: { creatorId, profile },
    }));
    return true;
  } catch {
    return false;
  }
}

export function getProfileCompletion(profile) {
  const checks = [
    [Boolean(profile.name?.trim()), 8],
    [Boolean(profile.handle?.trim()), 6],
    [Boolean(profile.bio?.trim() && profile.bio.trim().length >= 80), 14],
    [Boolean(profile.district?.trim() && profile.state?.trim()), 8],
    [Boolean(profile.language?.trim() && profile.niche?.trim()), 10],
    [Boolean(profile.collaborationEmail?.trim()), 6],
    [Boolean(profile.availability?.trim()), 8],
    [Number(profile.rateMin) > 0 && Number(profile.rateMax) >= Number(profile.rateMin), 10],
    [profile.connectedPlatforms?.some((platform) => platform.connected), 14],
    [profile.connectedPlatforms?.filter((platform) => platform.connected).length >= 3, 6],
    [profile.portfolio?.some((item) => item.featured), 10],
  ];

  return checks.reduce((total, [complete, weight]) => total + (complete ? weight : 0), 0);
}
