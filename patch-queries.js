const fs = require('fs');
const file = 'src/hooks/use-api.ts';
let code = fs.readFileSync(file, 'utf8');

const imports = `
import { useSpotsControllerFindOne, useSpotsControllerFindBySlug, useSpotsControllerFindAll, useSpotsControllerFindNearby, useSpotsControllerSearch } from '@/api/generated/spots/spots';
import { useScamAlertsControllerFindBySlug, useScamAlertsControllerFindAll, useScamAlertsControllerCreate, useScamAlertsControllerUpdate, useScamAlertsControllerDelete } from '@/api/generated/scam-alerts/scam-alerts';
import { usePriceReportsControllerFindBySpot, usePriceReportsControllerCreate } from '@/api/generated/price-reports/price-reports';
import { useCommunityTipsControllerFindBySpot, useCommunityTipsControllerCreate, useCommunityTipsControllerUpdate, useCommunityTipsControllerDelete } from '@/api/generated/community-tips/community-tips';
import { useGalleryControllerGetGallery, useGalleryControllerUploadImage, useGalleryControllerDeleteImage, useGalleryControllerFlagImage } from '@/api/generated/gallery/gallery';
import { useLiveVibesControllerFindAll, useLiveVibesControllerCreate } from '@/api/generated/live-vibes/live-vibes';
import { useCommentsControllerFindByTip, useCommentsControllerFindByScamAlert, useCommentsControllerCreate, useCommentsControllerUpdate, useCommentsControllerDelete } from '@/api/generated/comments/comments';
import { useVotesControllerVote, useVotesControllerRemoveVote } from '@/api/generated/votes/votes';
`;

code = code.replace("import { useScamAlertsControllerFindAllInfinite } from '@/api/generated/scam-alerts/scam-alerts';", "import { useScamAlertsControllerFindAllInfinite } from '@/api/generated/scam-alerts/scam-alerts';\n" + imports);

// Spots
const useSpotHook = `export function useSpot(id: string) {
    const query = useSpotsControllerFindOne(id, { query: { enabled: !!id } });
    return { ...query, data: query.data?.data };
}`;
code = code.replace(/export function useSpot\([\s\S]*?enabled: !!id \}\);\n}/, useSpotHook);

const useSpotBySlugHook = `export function useSpotBySlug(citySlug: string, spotSlug: string) {
    const query = useSpotsControllerFindBySlug(citySlug, spotSlug, { query: { enabled: !!citySlug && !!spotSlug } });
    return { ...query, data: query.data?.data };
}`;
code = code.replace(/export function useSpotBySlug\([\s\S]*?enabled: !!citySlug && !!spotSlug \}\);\n}/, useSpotBySlugHook);

const useScamAlertBySlugHook = `export function useScamAlertBySlug(citySlug: string, alertSlug: string) {
    const query = useScamAlertsControllerFindBySlug(citySlug, alertSlug, { query: { enabled: !!citySlug && !!alertSlug } });
    return { ...query, data: query.data?.data };
}`;
code = code.replace(/export function useScamAlertBySlug\([\s\S]*?enabled: !!citySlug && !!alertSlug \}\);\n}/, useScamAlertBySlugHook);

const useSpotsHook = `export function useSpots(params?: {
    categoryId?: string;
    cityId?: string;
    search?: string;
    sort?: 'newest' | 'popular';
}) {
    const cleanParams: any = {};
    if (params) {
        if (params.categoryId) cleanParams.categoryId = params.categoryId;
        if (params.cityId) cleanParams.cityId = params.cityId;
        if (params.search) cleanParams.search = params.search;
        if (params.sort) cleanParams.sort = params.sort;
    }

    const query = useSpotsControllerFindAll(cleanParams, { query: { staleTime: 5 * 60 * 1000 } });
    return { ...query, data: query.data?.data ? (Array.isArray(query.data.data) ? query.data.data : [query.data.data]) : [] };
}`;
code = code.replace(/export function useSpots\([\s\S]*?staleTime: 5 \* 60 \* 1000, \/\/ Increased to 5 minutes\n\s*}\);\n}/, useSpotsHook);

fs.writeFileSync(file, code);
