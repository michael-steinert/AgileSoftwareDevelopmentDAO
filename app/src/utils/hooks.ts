import {useWeb3React} from "@web3-react/core";
import {useCallback, useEffect, useState} from "react";
import {injected} from "./connectors";
import {Provider} from "./provider";

export function useEagerConnect(): boolean {
    const {activate, active} = useWeb3React<Provider>();
    const [tried, setTried] = useState(false);

    /* Combining `useCallback` and `useEffect` Hooks together so that `tryActivate` will only be called once when attempting eager Connection */
    const tryActivate = useCallback((): void => {
        const _tryActivate = async () => {
            const isAuthorized = await injected.isAuthorized();
            if (isAuthorized) {
                try {
                    await activate(injected, undefined, true);
                } catch (error: any) {
                    window.alert(`Error ${(error && error.message) ? error.message : ""}`);
                }
            }
            setTried(true);
        }
        _tryActivate().catch(console.error);
    }, [activate]);

    useEffect((): void => {
        tryActivate();
    }, [tryActivate]);

    /* If the Connection worked, wait until get the Confirmation of that to flip the Flag */
    useEffect((): void => {
        if (!tried && active) {
            setTried(true);
        }
    }, [tried, active]);

    return tried;
}

export function useInactiveListener(suppress: boolean = false): void {
    const {active, error, activate} = useWeb3React<Provider>();

    useEffect((): (() => void) | undefined => {
        const {ethereum} = window as any;

        if (ethereum && ethereum.on && !active && !error && !suppress) {
            const handleConnect = (): void => {
                console.log("Handling 'Connect' Event");
                activate(injected).catch(console.error);
            };

            const handleChainChanged = (chainId: string | number): void => {
                console.log("Handling 'ChainChanged' Event with Payload", chainId);
                activate(injected).catch(console.error);
            };

            const handleAccountsChanged = (accounts: string[]): void => {
                console.log("Handling 'AccountsChanged' Event with Payload", accounts);
                if (accounts.length > 0) {
                    activate(injected).catch(console.error);
                }
            };

            /* Subscribe to Event Calling Listener when the Event occurs */
            ethereum.on("connect", handleConnect);
            ethereum.on("chainChanged", handleChainChanged);
            ethereum.on("accountsChanged", handleAccountsChanged);

            return (): void => {
                if (ethereum.removeListener) {
                    /* Remove the Listener that trigger this Event */
                    ethereum.removeListener("connect", handleConnect);
                    ethereum.removeListener("chainChanged", handleChainChanged);
                    ethereum.removeListener("accountsChanged", handleAccountsChanged);
                }
            };
        }
    }, [active, error, suppress, activate]);
}
