export interface PriceReportRow {
  id: string;
  itemName: string;
  priceThb: number | string;
  timestamp?: string;
  reportedAt?: string;
}

export interface VibeRow {
  id: string;
  crowdLevel: number;
  timestamp: string;
  waitTimeMinutes?: number | null;
  imageUrl?: string;
  caption?: string;
  hasVoted?: boolean;
  voteId?: string | null;
  _count?: { votes?: number };
  user?: {
    id?: string;
    name?: string;
    avatarUrl?: string;
  };
}

export interface MissionRow {
  id: string;
  spot?: { id?: string };
}

export interface GalleryImage {
  id: string;
  url: string;
  hasVoted?: boolean;
  voteId?: string | null;
  _count?: { votes: number };
  user?: {
    name?: string;
    level?: string;
  };
}

export interface SpotTip {
  id: string;
  userId: string;
  type: "TRY" | "AVOID" | string;
  title: string;
  description: string;
  hasVoted?: boolean;
  voteId?: string | null;
  _count?: { votes?: number; comments?: number };
  createdAt?: string;
  user?: {
    id: string;
    name?: string;
    level?: "NEWBIE" | "EXPLORER" | "LOCAL_GURU" | string;
    avatarUrl?: string | null;
  };
}

export interface SpotData {
  id: string;
  userId?: string;
  categoryId?: string;
  cityId?: string;
  name: string;
  address: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  hasVoted?: boolean;
  voteId?: string | null;
  isInMission?: boolean;
  missionId?: string | null;
  _count?: { votes?: number };
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  category?: { id?: string; name?: string };
  city?: { id?: string; name?: string; slug?: string };
  vibeStats?: { avgCrowdLevel?: number; count?: number };
  tipStats?: { tryCount: number; avoidCount: number };
  priceStats?: { avg?: number; count?: number; min?: number; max?: number };
  activityStats?: { totalContributors: number; lastActivity: string | null };
}
