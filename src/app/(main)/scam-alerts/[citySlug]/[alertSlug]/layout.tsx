import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scam Alert Details - BKK Honest',
  description: 'View scam alert details and community discussion on BKK Honest',
};

export default function ScamAlertDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
