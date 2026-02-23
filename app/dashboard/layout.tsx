import SolanaWalletProvider from "@/components/providers/SolanaWalletProvider";

export const metadata = {
  title: "Dashboard",
  description: "Real-time observability dashboard for your AI agents.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SolanaWalletProvider>{children}</SolanaWalletProvider>;
}
