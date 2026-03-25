export interface User {
  id: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  role?: string;
  reputationScore?: number;
  trustLevel?: number;
}

export interface Spot {
  id: string;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  categoryId?: string;
  cityId?: string;
  distance?: number;
  tags?: string[];
  imageUrl?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    tips?: number;
    scamAlerts?: number;
    favorites?: number;
  };
}

export interface Tip {
  id: string;
  spotId: string;
  userId: string;
  content: string;
  imageUrl?: string;
  category?: string;
  price?: number;
  currency?: string;
  status?: string;
  hasVoted?: boolean;
  voteId?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: User;
  spot?: Spot;
  _count?: {
    votes?: number;
    comments?: number;
  };
}

export interface Vibe {
  id: string;
  spotId: string;
  userId: string;
  imageUrl: string;
  caption?: string;
  createdAt?: string;
  hasVoted?: boolean;
  voteId?: string;
  user?: User;
  spot?: Spot;
  _count?: {
    votes?: number;
  };
}

export interface PriceReport {
  id: string;
  spotId: string;
  userId: string;
  item: string;
  price: number;
  currency: string;
  reportedAt: string;
}

export interface ScamAlert {
  id: string;
  title: string;
  description: string;
  location?: string;
  severity?: string;
  status?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  userId: string;
  categoryId?: string;
  cityId?: string;
  hasVoted?: boolean;
  voteId?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: User;
  _count?: {
    votes?: number;
    comments?: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  entityId: string;
  entityType: 'TIP' | 'SCAM_ALERT';
  createdAt?: string;
  updatedAt?: string;
  user?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
