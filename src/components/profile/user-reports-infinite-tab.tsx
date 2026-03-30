"use client";

import { useRef, useEffect, useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useInfiniteUserPriceReports } from "@/hooks/use-api";
import { useInView } from "react-intersection-observer";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
import { toast } from "sonner";
import { getSpotUrl } from "@/lib/slug";
import Link from "next/link";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface UserReportsInfiniteTabProps {
  userId: string;
}

interface PriceReport {
  id: string;
  price: number;
  currency: string;
  priceSource?: string;
  description?: string;
  createdAt: string;
  spot?: {
    id: string;
    name: string;
    slug: string;
    city?: { id: string; name: string; slug: string };
    imageVariants?: { thumbnail: string; display: string };
    imageWidth?: number;
    imageHeight?: number;
  };
}

export default function UserReportsInfiniteTab({ userId }: UserReportsInfiniteTabProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user: authUser } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pathname = usePathname();

  const {
    data: reportsData,
    fetchNextPage: fetchNextReports,
    hasNextPage: hasNextReports,
    isFetchingNextPage: isFetchingNextReports,
    isLoading: reportsLoading,
  } = useInfiniteUserPriceReports(userId);

  const reports: PriceReport[] = useMemo(() => {
    const rawReports =
      reportsData?.pages.flatMap(
        (page) =>
          (page as unknown as { data?: { data?: PriceReport[] } })?.data?.data ||
          [],
      ) || [];
    return rawReports;
  }, [reportsData]);

  const { ref: observerTarget, inView } = useInView({ threshold: 0.1, rootMargin: "200px" });
  const hasFetchedReportsRef = useRef(false);

  useEffect(() => {
    if (inView && hasNextReports && !isFetchingNextReports && !hasFetchedReportsRef.current) {
      hasFetchedReportsRef.current = true;
      fetchNextReports();
    }
  }, [inView, hasNextReports, isFetchingNextReports, fetchNextReports]);

  useEffect(() => {
    if (!inView) hasFetchedReportsRef.current = false;
  }, [inView]);

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Price Reports</h2>
      </div>

      {reportsLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={24} className="text-green-400 animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/20 text-xs font-medium text-white/40">
          No price reports submitted yet
        </div>
      ) : (
        <div className="space-y-2.5 pb-8">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={report.spot ? getSpotUrl(report.spot.slug, report.spot.city?.slug || "") : "#"}
              className="block bg-white/5 hover:bg-white/10 border border-border rounded-xl p-4 transition-all hover:scale-[1.02]"
            >
              <div className="flex gap-4">
                {report.spot?.imageVariants && (
                  <div className="flex-shrink-0">
                    <OptimizedImage
                      variants={report.spot.imageVariants}
                      alt={report.spot.name}
                      width={report.spot.imageWidth || 64}
                      height={report.spot.imageHeight || 64}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-green-400 line-clamp-1">
                    {report.spot?.name || "Unknown Spot"}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-green-400">
                      {report.currency} {report.price}
                    </span>
                    {report.priceSource && (
                      <span className="text-[10px] bg-green-400/20 text-green-300 px-2 py-1 rounded">
                        {report.priceSource}
                      </span>
                    )}
                  </div>
                  {report.description && (
                    <p className="text-xs text-white/60 line-clamp-2 mt-1">{report.description}</p>
                  )}
                  <div className="flex gap-2 mt-2 text-[10px] text-white/40">
                    {report.spot?.city && <span>{report.spot.city.name}</span>}
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          <div ref={observerTarget} className="py-6 flex justify-center">
            {isFetchingNextReports ? (
              <Loader2 size={20} className="text-green-400 animate-spin" />
            ) : hasNextReports ? (
              <div className="h-4 w-4" />
            ) : (
              <p className="text-[10px] font-semibold text-white/40 tracking-wide">End of price reports</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
