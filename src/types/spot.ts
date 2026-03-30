//!!!!! DON't use this file, we have to use the generated types from the API client instead to avoid type mismatches. This file is kept for reference and will be deleted in the future. !!!!!

// export interface PriceReportRow {
//     id: string;
//     itemName: string;
//     priceThb: number | string;
//     timestamp?: string;
//     reportedAt?: string;
// }

// export interface VibeRow {
//     id: string;
//     crowdLevel: number;
//     timestamp: string;
//     waitTimeMinutes?: number | null;
//     caption?: string;
//     hasVoted?: boolean;
//     voteId?: string | null | { [key: string]: unknown };
//     _count?: { votes?: number };
//     user?: {
//         id?: string;
//         name?: string;
//         avatarUrl?: string;
//     };
//     imageVariants?: {
//         thumbnail: string;
//         display: string;
//     };
// }

// export interface MissionRow {
//     id: string;
//     spot?: { id?: string };
// }

// export interface GalleryImage {
//     id: string;
//     url: string;
//     createdAt?: string;
//     userId?: string;
//     hasVoted?: boolean;
//     voteId?: string | null | { [key: string]: unknown };
//     _count?: { votes: number };
//     user?: {
//         name?: string;
//         level?: string;
//         avatarUrl?: string;
//     };
//     imageVariants?: {
//         thumbnail: string;
//         display: string;
//     };
//     blurPlaceholder?: string;
//     imageWidth?: number;
//     imageHeight?: number;
//     imageSize?: number;
//     imageMimeType?: string;
//     qualityScore?: number;
// }

// export interface SpotTip {
//   id: string;
//   userId: string;
//   type: "TRY" | "AVOID" | string;
//   title: string;
//   description: string;
//   hasVoted?: boolean;
//   voteId?: string | null | { [key: string]: unknown };
//   _count?: { votes?: number; comments?: number };
//   createdAt?: string;
//   user?: {
//     id: string;
//     name?: string;
//     level?: "NEWBIE" | "EXPLORER" | "LOCAL_GURU" | string;
//     avatarUrl?: string | null;
//   };
// }

// export interface SpotData {
//     id: string;
//     userId?: string;
//     categoryId?: string;
//     cityId?: string;
//     name: string;
//     address: string;
//     latitude: number;
//     longitude: number;
//     hasVoted?: boolean;
//     voteId?: string | null | { [key: string]: unknown };
//     isInMission?: boolean;
//     missionId?: string | null | { [key: string]: unknown };
//     _count?: { votes?: number };
//     user?:
//         | {
//               id: string;
//               name: string;
//               avatarUrl?: string;
//           }
//         | { [key: string]: unknown };
//     category?: { id?: string; name?: string } | { [key: string]: unknown };
//     city?: { id?: string; name?: string; slug?: string } | { [key: string]: unknown };
//     vibeStats?: { avgCrowdLevel?: number; count?: number } | { [key: string]: unknown };
//     tipStats?: { tryCount: number; avoidCount: number } | { [key: string]: unknown };
//     priceStats?:
//         | { avg?: number; count?: number; min?: number; max?: number }
//         | { [key: string]: unknown };
//     activityStats?:
//         | { totalContributors: number; lastActivity: string | null }
//         | { [key: string]: unknown };
//     imageVariants?: {
//         thumbnail: string;
//         display: string;
//     };
// }
