import { describe, expect, it } from 'vitest'
import { blockedHost, cleanProxyInput, scrub, underAllowed, withSecret } from '../../supabase/functions/studio-proxy/lib'
import { cleanDomain, cleanPackage, cleanSecretInput, cleanSha256, dnsSteps, pngFromBase64, siteFiles, siteName } from '../../supabase/functions/studio-tools/lib'
import { crc32, zip } from './zip'
import { COURSES, findLesson } from '../lessons'

const P = '11111111-1111-1111-1111-111111111111'

describe('API proxy checks', () => {
  it('blocks private and odd hosts', () => {
    for (const h of ['localhost', '127.0.0.1', '10.0.0.5', '[::1]', 'metadata.google.internal', 'router.local', 'intranet', '169.254.169.254']) expect(blockedHost(h)).toBe(true)
    expect(blockedHost('api.openweathermap.org')).toBe(false)
  })
  it('only calls inside the allowed address', () => {
    const a = 'https://api.example.com/v1'
    expect(underAllowed(new URL('https://api.example.com/v1/weather?q=Abuja'), a)).toBe(true)
    expect(underAllowed(new URL('https://api.example.com/v1'), a)).toBe(true)
    expect(underAllowed(new URL('https://api.example.com/v2/x'), a)).toBe(false)
    expect(underAllowed(new URL('https://api.example.com/v10'), a)).toBe(false)
    expect(underAllowed(new URL('https://evil.com/v1'), a)).toBe(false)
    expect(underAllowed(new URL('https://api.example.com.evil.com/v1'), a)).toBe(false)
    expect(underAllowed(new URL('https://user:pw@api.example.com/v1'), a)).toBe(false)
    expect(underAllowed(new URL('http://api.example.com/v1'), a)).toBe(false)
    expect(underAllowed(new URL('https://api.example.com/v1/%2e%2e/admin'), a)).toBe(false)
  })
  it('cleans what the page sends', () => {
    const { input } = cleanProxyInput({ slug: 'abcdefghij', secret: 'WEATHER_KEY', url: 'https://api.x.com/a', method: 'post', headers: { Authorization: 'x', 'X-Forwarded-For': '1', 'x-app': 'ok', cookie: 'c', accept: 'application/json' }, body: { a: 1 } })
    expect(input?.method).toBe('POST')
    expect(input?.headers).toEqual({ 'x-app': 'ok', accept: 'application/json', 'content-type': 'application/json' })
    expect(input?.body).toBe('{"a":1}')
    expect(cleanProxyInput({ slug: 'abcdefghij', secret: 'k', url: 'https://api.x.com' }).error).toBeTruthy()
    expect(cleanProxyInput({ slug: 'abcdefghij', secret: 'KEY', url: 'http://api.x.com' }).error).toBeTruthy()
    expect(cleanProxyInput({ slug: 'abcdefghij', secret: 'KEY', url: 'https://127.0.0.1/x' }).error).toBeTruthy()
    expect(cleanProxyInput({ secret: 'KEY', url: 'https://api.x.com' }).error).toBeTruthy()
    expect(cleanProxyInput({ project_id: P, secret: 'KEY', url: 'https://api.x.com', method: 'TRACE' }).error).toBeTruthy()
  })
  it('puts the secret where the API wants it and hides echoes', () => {
    const { input } = cleanProxyInput({ project_id: P, secret: 'KEY', url: 'https://api.x.com/a?q=1' })
    expect(withSecret(input!, 's3cret', 'bearer', null).headers.authorization).toBe('Bearer s3cret')
    expect(withSecret(input!, 's3cret', 'header', 'x-api-key').headers['x-api-key']).toBe('s3cret')
    expect(withSecret(input!, 's3cret', 'query', 'appid').url.toString()).toBe('https://api.x.com/a?q=1&appid=s3cret')
    expect(scrub('{"echo":"s3cret"}', 's3cret')).toBe('{"echo":"[hidden]"}')
  })
})

describe('project tools', () => {
  it('checks API key settings', () => {
    const ok = cleanSecretInput({ project_id: P, name: 'weather key', value: 'abc', allowed_url: 'https://api.x.com/v1/', placement: 'query', field: 'appid', daily_limit: 99999999 })
    expect(ok.input).toMatchObject({ name: 'WEATHER_KEY', allowedUrl: 'https://api.x.com/v1', placement: 'query', field: 'appid', dailyLimit: 100000, publicUse: false })
    expect(cleanSecretInput({ project_id: P, name: 'K1', allowed_url: 'http://api.x.com' }).error).toBeTruthy()
    expect(cleanSecretInput({ project_id: P, name: 'K1', allowed_url: 'https://10.0.0.1/' }).error).toBeTruthy()
    expect(cleanSecretInput({ project_id: P, name: 'K1', allowed_url: 'https://api.x.com', placement: 'header', field: 'Host' }).error).toBeTruthy()
    expect(cleanSecretInput({ project_id: 'nope', name: 'K1', allowed_url: 'https://api.x.com' }).error).toBeTruthy()
  })
  it('checks names, domains and Android details', () => {
    expect(siteName('', "Mama Nkechi's Kitchen!")).toBe('mama-nkechi-s-kitchen')
    expect(cleanDomain('https://Shop.MyBakery.com/')).toBe('shop.mybakery.com')
    expect(cleanDomain('x.netlify.app')).toBe(null)
    expect(cleanDomain('not a domain')).toBe(null)
    expect(dnsSteps('mybakery.com', 'a.netlify.app')[0]).toEqual({ type: 'A', name: '@', value: '75.2.60.5' })
    expect(dnsSteps('mybakery.com.ng', 'a.netlify.app')[0].type).toBe('A')
    expect(dnsSteps('shop.mybakery.com', 'a.netlify.app')).toEqual([{ type: 'CNAME', name: 'shop', value: 'a.netlify.app' }])
    expect(cleanPackage('com.ada.shop')).toBe('com.ada.shop')
    expect(cleanPackage('shop')).toBe(null)
    expect(cleanSha256(Array(32).fill('ab').join(':'))).toBe(Array(32).fill('AB').join(':'))
    expect(cleanSha256('AB:CD')).toBe(null)
  })
  it('builds an installable site', () => {
    const f = siteFiles({ title: 'Shop', html: '<!doctype html><html><head><title>Shop</title></head><body><script>studio.api("K",{})</script></body></html>', slug: 'abcdefghij', proxyUrl: 'https://x.supabase.co/functions/v1/studio-proxy', android: { package: 'com.a.b', sha256: 'AB' } })
    const html = String(f['/index.html'])
    expect(html.indexOf('window.studio')).toBeLessThan(html.indexOf('studio.api("K"'))
    expect(html).toContain('manifest.webmanifest')
    expect(JSON.parse(String(f['/manifest.webmanifest'])).display).toBe('standalone')
    expect(JSON.parse(String(f['/.well-known/assetlinks.json']))[0].target.package_name).toBe('com.a.b')
    expect(String(f['/sw.js'])).toContain('caches')
    const noSlug = siteFiles({ title: 'Shop', html: '<p>hi</p>', slug: null, proxyUrl: 'x' })
    expect(String(noSlug['/index.html'])).toContain('Publish this project')
  })
  it('accepts only PNG icons', () => {
    expect(pngFromBase64(btoa(String.fromCharCode(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2)))?.length).toBe(10)
    expect(pngFromBase64(btoa('<svg onload=alert(1)>'))).toBe(null)
  })
})

describe('zip', () => {
  it('writes a valid archive', () => {
    expect(crc32(new TextEncoder().encode('hello'))).toBe(0x3610a686)
    const z = zip({ '/index.html': '<h1>hi</h1>', 'a/b.txt': 'x' })
    const v = new DataView(z.buffer)
    expect(v.getUint32(0, true)).toBe(0x04034b50)
    expect(v.getUint32(z.length - 22, true)).toBe(0x06054b50)
    expect(v.getUint16(z.length - 22 + 10, true)).toBe(2)
  })
})

describe('courses', () => {
  it('ship only titles for paid lessons', () => {
    for (const c of COURSES) {
      expect(c.course!.examQuestions >= 15).toBe(true)
      c.lessons.forEach((l, i) => {
        if (i < c.course!.free) { expect(!!l.paid).toBe(false); expect(l.body.length > 500).toBe(true) }
        else { expect(l.paid).toBe(true); expect(l.body).toBe(''); expect(l.checks === undefined).toBe(true); expect(JSON.stringify(l)).not.toContain('solution') }
      })
      expect(findLesson(c.lessons[0].id)?.track.id).toBe(c.id)
    }
  })
})
