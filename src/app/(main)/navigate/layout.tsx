import { ReactNode } from 'react';

export default function NavigateLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <>{children}</>;
}
