import { TonConnectUI } from '@tonconnect/ui'

let _tonConnectUI: TonConnectUI | null = null
export const getTonConnectUI = () => {
  if (typeof window === 'undefined') return null
  if (!_tonConnectUI) {
    _tonConnectUI = new TonConnectUI({
      manifestUrl: '/tonconnect-manifest.json',
    })
  }
  return _tonConnectUI
}

export async function ensureWalletConnected() {
  const ui = getTonConnectUI()
  if (!ui) throw new Error('TON UI unavailable on server')
  const connected = ui.account != null
  if (!connected) {
    await ui.openModal()
  }
  return ui.account
}

export async function sendTon(
  toAddress: string,
  amountNano: string,
  payload?: string
) {
  const ui = getTonConnectUI()
  if (!ui) throw new Error('TON UI unavailable on server')
  await ensureWalletConnected()
  await ui.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 300,
    messages: [
      {
        address: toAddress,
        amount: amountNano,
        payload,
      },
    ],
  })
}
