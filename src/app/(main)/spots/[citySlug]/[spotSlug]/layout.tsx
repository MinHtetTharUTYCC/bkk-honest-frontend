import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Spot Details - BKK Honest',
  description: 'Explore spot details, prices, vibes, and community tips on BKK Honest',
};

export default function SpotDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
