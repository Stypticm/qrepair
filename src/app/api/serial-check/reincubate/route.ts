import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { sn } = await req.json()
    if (!sn || typeof sn !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'sn is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.REINCUBATE_API_KEY || ''
    const baseUrl =
      process.env.REINCUBATE_API_URL ||
      'https://di-api.reincubate.com'

    if (!apiKey) {
      // Fallback: parse public HTML page if API key is unavailable
      try {
        const pageUrl = `https://reincubate.com/lookup/${encodeURIComponent(
          sn
        )}/`
        const zenKey = process.env.ZENROWS_API_KEY || ''
        let html = ''
        if (zenKey) {
          const zenUrl = `https://api.zenrows.com/v1/?apikey=${encodeURIComponent(
            zenKey
          )}&url=${encodeURIComponent(
            pageUrl
          )}&js_render=true`
          const z = await fetch(zenUrl, {
            method: 'GET',
            cache: 'no-store',
          })
          html = await z.text()
        } else {
          const res = await fetch(pageUrl, {
            method: 'GET',
            headers: {
              'User-Agent':
                req.headers.get('user-agent') ||
                'Mozilla/5.0',
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en,en-US;q=0.9,ru;q=0.8',
              Referer: 'https://reincubate.com/lookup/',
            },
            cache: 'no-store',
          })
          html = await res.text()
        }

        // Extract data by element IDs appearing on the page
        const getByIdText = (id: string) => {
          // Strict: match specific opening tag and the same closing tag
          const strict = html.match(
            new RegExp(
              `<([a-zA-Z0-9]+)[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/\\1>`,
              'i'
            )
          )
          if (strict?.[2])
            return strict[2].replace(/<[^>]*>/g, '').trim()
          // Loose: match any closing tag
          const loose = html.match(
            new RegExp(
              `id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`,
              'i'
            )
          )
          if (loose?.[1])
            return loose[1].replace(/<[^>]*>/g, '').trim()
          return ''
        }
        const getImgByIdSrc = (id: string) => {
          const m = html.match(
            new RegExp(
              `<img[^>]*id=["']${id}["'][^>]*src=["']([^"']+)["']`,
              'i'
            )
          )
          return m?.[1]?.trim() || ''
        }

        const model = getByIdText('hero-sku') || ''
        const variant = getByIdText('hero-variant') || ''
        const storage = getByIdText('hero-storage') || ''
        const colour = getByIdText('hero-colour') || ''
        const image = getImgByIdSrc('hero-image') || ''

        if (!model && !storage && !colour && !image) {
          return NextResponse.json(
            {
              ok: false,
              error: 'html_parse_failed',
              hint: html.slice(0, 4000),
            },
            { status: 502 }
          )
        }

        return NextResponse.json({
          ok: true,
          provider: 'reincubate-html',
          normalized: {
            model,
            variant,
            storage,
            color: colour,
            image,
          },
        })
      } catch (e: any) {
        return NextResponse.json(
          {
            ok: false,
            error: 'html_lookup_failed',
            hint: e?.message || e,
          },
          { status: 502 }
        )
      }
    }

    // Try common auth schemes; different deployments might expect different headers
    const endpoints = [
      {
        url: `${baseUrl.replace(
          /\/$/,
          ''
        )}/lookup?code=${encodeURIComponent(sn)}`,
        headers: {
          Accept: 'application/json',
          'X-Api-Key': apiKey,
        } as Record<string, string>,
      },
      {
        url: `${baseUrl.replace(
          /\/$/,
          ''
        )}/lookup?code=${encodeURIComponent(sn)}`,
        headers: {
          Accept: 'application/json',
          Authorization: `Token ${apiKey}`,
        } as Record<string, string>,
      },
      {
        url: `${baseUrl.replace(
          /\/$/,
          ''
        )}/lookup?code=${encodeURIComponent(sn)}`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
        } as Record<string, string>,
      },
    ]

    let lastError: any = null
    for (const attempt of endpoints) {
      try {
        const res = await fetch(attempt.url, {
          method: 'GET',
          headers: attempt.headers,
          // Avoid Next fetch caching for dynamic lookups
          cache: 'no-store',
        })
        const text = await res.text()
        let data: any = null
        try {
          data = JSON.parse(text)
        } catch {}

        if (res.ok) {
          // Best-effort normalization based on Reincubate lookup output semantics
          const model = data?.sku || data?.model || ''
          const variant = data?.variant || ''
          const storage = data?.storage || ''
          const colour = data?.colour || data?.color || ''
          const image =
            data?.image || data?.images?.[0] || ''
          return NextResponse.json({
            ok: true,
            provider: 'reincubate',
            data,
            normalized: {
              model,
              variant,
              storage,
              color: colour,
              image,
            },
          })
        }

        // If 401/403, try next header scheme; else bubble detailed hint
        if (res.status === 401 || res.status === 403) {
          lastError = { status: res.status, body: text }
          continue
        } else {
          return NextResponse.json(
            { ok: false, status: res.status, body: text },
            { status: res.status }
          )
        }
      } catch (e: any) {
        lastError = e
      }
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'auth_failed_or_unreachable',
        hint: lastError?.message || lastError,
      },
      { status: 502 }
    )
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
