export type Network = "mainnet" | "sepolia";

/**
 * 기본 퍼블릭 RPC URL 설정
 * 환경 변수가 없을 때 사용되는 기본값들
 */
export const DEFAULT_RPC_URLS: Record<Network, string> = {
  mainnet: "https://ethereum.drpc.org",
  sepolia: "https://sepolia.drpc.org"
} as const;

/**
 * 네트워크에 따른 RPC URL을 반환
 * 환경 변수가 설정되어 있으면 우선 사용, 없으면 기본 퍼블릭 RPC URL 사용
 * @param network - 대상 네트워크 ("mainnet" | "sepolia")
 * @returns RPC URL 문자열
 */
export function getRpcUrl(network: Network): string {
  const envVar = network === "mainnet" ? "MAINNET_RPC_URL" : "SEPOLIA_RPC_URL";
  return process.env[envVar] || DEFAULT_RPC_URLS[network];
}