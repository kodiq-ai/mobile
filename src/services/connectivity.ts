import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

type ConnectivityListener = (online: boolean) => void;

class ConnectivityService {
  private listeners = new Set<ConnectivityListener>();
  private unsubscribeNetInfo: (() => void) | null = null;

  constructor() {
    this.unsubscribeNetInfo = NetInfo.addEventListener(
      (state: NetInfoState) => {
        const online = state.isConnected === true && state.isInternetReachable !== false;
        for (const listener of this.listeners) {
          listener(online);
        }
      },
    );
  }

  /** Check current connectivity status */
  async isConnected(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  }

  /** Subscribe to connectivity changes. Returns unsubscribe function. */
  subscribe(listener: ConnectivityListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Clean up NetInfo listener */
  destroy(): void {
    this.unsubscribeNetInfo?.();
    this.listeners.clear();
  }
}

export const connectivityService = new ConnectivityService();
