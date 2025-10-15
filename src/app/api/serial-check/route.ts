import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { sn } = await req.json()
    if (!sn || typeof sn !== 'string') {
      return NextResponse.json(
        { error: 'sn is required' },
        { status: 400 }
      )
    }

    // Offline decoder removed

    const cfClearance = process.env.CF_CLEARANCE || ''
    const cfUA =
      process.env.CF_UA ||
      req.headers.get('user-agent') ||
      ''
    const base = 'https://www.imei.info'

    // Step 1: GET to obtain session id via middleware rewrite
    const pre = await fetch(
      `${base}/services/apple-warranty-sn/?sn=${encodeURIComponent(
        sn
      )}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': cfUA,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ru,en;q=0.9',
          Cookie: [
            'Next-Locale=en',
            cfClearance
              ? `cf_clearance=${cfClearance}`
              : '',
          ]
            .filter(Boolean)
            .join('; '),
          Referer: `${base}/apple-sn-check/`,
        },
      }
    )

    const rewrite =
      pre.headers.get('x-middleware-rewrite') || ''
    const idMatch = rewrite.match(
      /apple-warranty-sn\/(.*?)\//
    )
    const sessionId = idMatch?.[1]
    if (!sessionId) {
      const html = await pre.text()
      return NextResponse.json(
        {
          ok: false,
          error: 'cf_challenge_or_no_session',
          hint: rewrite || html.slice(0, 500),
        },
        { status: 502 }
      )
    }

    // Step 2: POST RSC endpoint with text/x-component and body: [{id:"<sessionId>", noCache:false}]
    const rscUrl = `${base}/services/apple-warranty-sn/${sessionId}/?sn=${encodeURIComponent(
      sn
    )}`
    const rscBody = JSON.stringify([
      { id: sessionId, noCache: false },
    ])
    const res = await fetch(rscUrl, {
      method: 'POST',
      headers: {
        Accept: 'text/x-component',
        'Content-Type': 'text/plain;charset=UTF-8',
        'User-Agent': cfUA,
        'Accept-Language': 'ru,en;q=0.9',
        Referer: rscUrl,
        Cookie: [
          'Next-Locale=en',
          cfClearance ? `cf_clearance=${cfClearance}` : '',
        ]
          .filter(Boolean)
          .join('; '),
      },
      body: rscBody,
    })

    const text = await res.text()
    let parsed: any = null
    const objMatch = text.match(
      /\n\s*1\s*:\s*(\{[\s\S]*?\})/
    )
    if (objMatch) {
      try {
        parsed = JSON.parse(objMatch[1])
      } catch {}
    }
    return NextResponse.json({
      ok: true,
      sessionId,
      raw: text,
      rsc: parsed,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unknown error',
      },
      { status: 502 }
    )
  }
}
