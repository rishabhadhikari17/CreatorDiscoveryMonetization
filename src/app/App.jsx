import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppErrorBoundary } from "../components/demo/AppErrorBoundary";
import { DemoExperienceChrome } from "../components/demo/DemoExperienceChrome";
import { DemoExperienceProvider } from "../components/demo/DemoExperienceProvider";
import { RoleSwitcher } from "../components/navigation/RoleSwitcher/RoleSwitcher";
import { DesignSystemPage } from "../features/design-system/DesignSystemPage";
import { BrandDashboardPage } from "../features/brand-dashboard/BrandDashboardPage";
import { CreatorDiscoveryPage } from "../features/creator-discovery/CreatorDiscoveryPage";
import { CreatorProfilePage } from "../features/creator-profile/CreatorProfilePage";
import { CreatorProfileEditorPage } from "../features/creator-profile/CreatorProfileEditorPage";
import { CampaignBriefPage } from "../features/campaign-brief/CampaignBriefPage";
import { BrandCampaignsPage } from "../features/campaign-execution/BrandCampaignsPage";
import { CreatorCollaborationsPage } from "../features/campaign-execution/CreatorCollaborationsPage";
import { DealRoomPage } from "../features/deal-room/DealRoomPage";
import { BrandShell } from "../features/brand-shell/BrandShell";
import { CreatorDashboardPage } from "../features/creator-dashboard/CreatorDashboardPage";
import { CreatorOffersPage } from "../features/creator-offers/CreatorOffersPage";
import { CreatorShell } from "../features/creator-shell/CreatorShell";
import { CreatorOpportunitiesPage } from "../features/campaign-opportunities/CreatorOpportunitiesPage";
import { BrandInterestsPage } from "../features/campaign-opportunities/BrandInterestsPage";
import { DealStateProvider } from "../features/deal-state/DealStateProvider";
import { LandingPage } from "../features/landing/LandingPage";
import { OnboardingPage } from "../features/onboarding/OnboardingPage";
import "../styles/creator-refresh.css";
import "../styles/modern-effects.css";
import "../styles/design-compliance.css";

export function App() {
  return (
    <DemoExperienceProvider>
      <DealStateProvider>
        <BrowserRouter>
          <AppErrorBoundary>
            <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/brand" element={<BrandShell />}>
            <Route index element={<BrandDashboardPage />} />
            <Route path="discover" element={<CreatorDiscoveryPage />} />
            <Route path="creators/:creatorId" element={<CreatorProfilePage />} />
            <Route path="shortlist" element={<CampaignBriefPage />} />
            <Route path="campaigns" element={<BrandCampaignsPage />} />
            <Route path="interests" element={<BrandInterestsPage />} />
            <Route path="deals" element={<DealRoomPage />} />
          </Route>
          <Route path="/creator" element={<CreatorShell />}>
            <Route index element={<CreatorDashboardPage />} />
            <Route path="opportunities" element={<CreatorOpportunitiesPage />} />
            <Route path="offers" element={<CreatorOffersPage />} />
            <Route path="collaborations" element={<CreatorCollaborationsPage />} />
            <Route path="profile" element={<CreatorProfileEditorPage />} />
          </Route>
          <Route path="/design-system" element={<DesignSystemPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppErrorBoundary>
          <RoleSwitcher />
          <DemoExperienceChrome />
        </BrowserRouter>
      </DealStateProvider>
    </DemoExperienceProvider>
  );
}
