import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      provider: 'imeicheck',
      health: 'ready',
    })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const imei =
      typeof body?.imei === 'string' ? body.imei.trim() : ''
    const sn =
      typeof body?.sn === 'string' ? body.sn.trim() : ''
    const serviceId = body?.serviceId

    if (!imei && !sn) {
      return NextResponse.json(
        { ok: false, error: 'imei or sn is required' },
        { status: 400 }
      )
    }

    if (
      !serviceId ||
      (typeof serviceId !== 'number' &&
        typeof serviceId !== 'string')
    ) {
      return NextResponse.json(
        { ok: false, error: 'serviceId is required' },
        { status: 400 }
      )
    }

    const apiKey =
      process.env.IMEICHECK_API_KEY ||
      process.env.imeicheck_api_key ||
      ''
    const baseUrl = (
      process.env.IMEICHECK_API_URL ||
      'https://api.imeicheck.net'
    ).replace(/\/$/, '')

    // Short-circuit: built-in mocks for connectivity debugging (no external calls)
    const mockIds = new Set([12, 13, 14, 15])
    if (
      mockIds.has(
        typeof serviceId === 'string'
          ? parseInt(serviceId, 10)
          : serviceId
      )
    ) {
      const mockResponse = {
        id: 'mock-check',
        type: 'api',
        status: 'successful',
        orderId: null,
        service: {
          id:
            typeof serviceId === 'string'
              ? parseInt(serviceId, 10)
              : serviceId,
          title: 'Mock Service',
          price: '0.00',
        },
        amount: '0.00',
        deviceId: imei || sn,
        processedAt: Date.now(),
        properties: {
          deviceName: 'Mock Device',
          image: '',
          imei: imei || '',
          serial: sn || '',
          estPurchaseDate: null,
          simLock: false,
          warrantyStatus: 'Mock',
          repairCoverage: 'false',
          technicalSupport: 'false',
          modelDesc: 'MOCK MODEL',
          demoUnit: false,
          refurbished: false,
          purchaseCountry: 'Mockland',
          'apple/region': 'Mock Region',
          fmiOn: false,
          lostMode: 'false',
          usaBlockStatus: 'Clean',
          network: 'Global',
        },
      }
      const props = mockResponse.properties
      const normalized = {
        deviceName: props.deviceName,
        image: props.image,
        imei: props.imei,
        serial: props.serial,
        estPurchaseDate: props.estPurchaseDate,
        simLock: props.simLock,
        warrantyStatus: props.warrantyStatus,
        repairCoverage: props.repairCoverage,
        technicalSupport: props.technicalSupport,
        modelDesc: props.modelDesc,
        demoUnit: props.demoUnit,
        refurbished: props.refurbished,
        purchaseCountry: props.purchaseCountry,
        region: props['apple/region'],
        fmiOn: props.fmiOn,
        lostMode: props.lostMode,
        usaBlockStatus: props.usaBlockStatus,
        network: props.network,
      }
      return NextResponse.json({
        ok: true,
        provider: 'imeicheck',
        data: mockResponse,
        normalized,
      })
    }

    if (!apiKey) {
      console.error(
        '❌ IMEICHECK_API_KEY is not configured'
      )
      console.error('Environment variables:', {
        IMEICHECK_API_KEY: process.env.IMEICHECK_API_KEY
          ? 'SET'
          : 'NOT SET',
        imeicheck_api_key: process.env.imeicheck_api_key
          ? 'SET'
          : 'NOT SET',
        NODE_ENV: process.env.NODE_ENV,
      })
      return NextResponse.json(
        {
          ok: false,
          error: 'IMEICHECK_API_KEY is not configured',
        },
        { status: 500 }
      )
    }

    const identifier = imei || sn
    const idType = imei ? 'imei' : 'sn'

    // IMEIcheck API expects POST /v1/checks with JSON body depending on service
    // We pass-through identifier and serviceId; additional options can be added later
    const url = `${baseUrl}/v1/checks`

    const payload: Record<string, any> = {
      serviceId:
        typeof serviceId === 'string'
          ? parseInt(serviceId, 10)
          : serviceId,
      deviceId: identifier,
    }

    // Add small timeout via AbortController to avoid hanging forever
    const ac = new AbortController()
    const timeout = setTimeout(() => ac.abort(), 30000)

    console.log('🔍 Making request to imeicheck:', {
      url,
      payload,
      apiKey: apiKey ? 'SET' : 'NOT SET',
      environment: process.env.NODE_ENV,
    })

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: ac.signal,
    })
    clearTimeout(timeout)

    const text = await res.text()
    let data: any = null
    try {
      data = JSON.parse(text)
    } catch {
      // keep raw text for diagnostics
    }

    console.log('📡 imeicheck response:', {
      status: res.status,
      ok: res.ok,
      text:
        text.substring(0, 200) +
        (text.length > 200 ? '...' : ''),
      data: data ? 'parsed' : 'raw text',
    })

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          status: res.status,
          error: data?.error || data || text,
        },
        { status: res.status }
      )
    }

    // Best-effort normalization for common Apple Basic Info fields when present
    const props =
      data?.properties || data?.result || data?.data || {}
    const normalized = {
      deviceName:
        props.deviceName ||
        props.appleModelName ||
        props.model ||
        '',
      image: props.image || props.deviceImage || '',
      imei:
        props.imei || (idType === 'imei' ? identifier : ''),
      serial:
        props.serial ||
        props.serialNumber ||
        (idType === 'sn' ? identifier : ''),
      estPurchaseDate:
        props.estPurchaseDate ||
        props.estimatedPurchaseDate ||
        null,
      simLock:
        typeof props.simLock === 'boolean'
          ? props.simLock
          : undefined,
      warrantyStatus: props.warrantyStatus || '',
      repairCoverage: props.repairCoverage ?? '',
      technicalSupport: props.technicalSupport ?? '',
      modelDesc: props.modelDesc || '',
      demoUnit: props.demoUnit ?? undefined,
      refurbished: props.refurbished ?? undefined,
      purchaseCountry: props.purchaseCountry || '',
      region:
        props['apple/region'] ||
        props.appleRegion ||
        props.region ||
        '',
      fmiOn: props.fmiOn ?? undefined,
      lostMode: props.lostMode ?? '',
      usaBlockStatus: props.usaBlockStatus || '',
      network: props.network || '',
    }

    return NextResponse.json({
      ok: true,
      provider: 'imeicheck',
      data,
      normalized,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
