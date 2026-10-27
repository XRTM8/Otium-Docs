export interface ReleaseAsset {
  url: string;
  size?: number;
  sha256?: string;
}

export interface ReleaseAssets {
  windowsInstaller?: ReleaseAsset;
  windowsPortable?: ReleaseAsset;
  androidApk?: ReleaseAsset;
}

export interface ReleaseInfo {
  version: string;
  notes: string;
  pubDate: string;
  assets: ReleaseAssets;
}

export const OTIUM_RELEASES_URL = 'https://github.com/XRTM8/Otium-Docs/releases/latest';
export const OTIUM_RELEASE_FEED_URL =
  'https://github.com/XRTM8/Otium-Docs/releases/latest/download/latest.json';
export const GITHUB_API_URL =
  'https://api.github.com/repos/XRTM8/Otium-Docs/releases/latest';
export const RAW_PKG_URL =
  'https://raw.githubusercontent.com/XRTM8/Otium-Docs/main/package.json';

function normalizeVersion(version: string): string {
  return version.trim().replace(/^v/i, '');
}

function parseVersionPart(version: string): { numbers: number[]; prerelease: string } {
  const normalized = normalizeVersion(version);
  const [main, prerelease = ''] = normalized.split('-', 2);
  const numbers = main.split('.').map((part) => {
    const value = Number.parseInt(part, 10);
    return Number.isFinite(value) ? value : 0;
  });
  while (numbers.length < 3) numbers.push(0);
  return { numbers, prerelease };
}

/** Returns a positive number when candidate is newer than current. */
export function compareVersions(candidate: string, current: string): number {
  const left = parseVersionPart(candidate);
  const right = parseVersionPart(current);

  for (let index = 0; index < 3; index += 1) {
    const difference = left.numbers[index] - right.numbers[index];
    if (difference !== 0) return difference;
  }

  if (left.prerelease === right.prerelease) return 0;
  if (!left.prerelease) return 1;
  if (!right.prerelease) return -1;
  return left.prerelease.localeCompare(right.prerelease);
}

export function isNewerVersion(candidate: string, current: string): boolean {
  return compareVersions(candidate, current) > 0;
}

function parseAsset(value: unknown): ReleaseAsset | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  if (typeof record.url !== 'string' || !record.url.trim()) return undefined;

  const result: ReleaseAsset = { url: record.url.trim() };
  if (typeof record.size === 'number' && Number.isFinite(record.size)) {
    result.size = record.size;
  }
  if (typeof record.sha256 === 'string' && record.sha256.trim()) {
    result.sha256 = record.sha256.trim();
  }
  return result;
}

export function parseReleaseInfo(value: unknown): ReleaseInfo {
  if (!value || typeof value !== 'object') {
    throw new Error('Release feed is not an object');
  }

  const record = value as Record<string, unknown>;
  if (typeof record.version !== 'string' || !record.version.trim()) {
    throw new Error('Release feed has no version');
  }

  const rawAssets =
    record.assets && typeof record.assets === 'object'
      ? (record.assets as Record<string, unknown>)
      : {};

  return {
    version: normalizeVersion(record.version),
    notes: typeof record.notes === 'string' ? record.notes : '',
    pubDate:
      typeof record.pub_date === 'string'
        ? record.pub_date
        : typeof record.pubDate === 'string'
          ? record.pubDate
          : '',
    assets: {
      windowsInstaller: parseAsset(rawAssets.windowsInstaller),
      windowsPortable: parseAsset(rawAssets.windowsPortable),
      androidApk: parseAsset(rawAssets.androidApk)
    }
  };
}

/**
 * 3-Tier Failover Update Checker for Otium Docs:
 * Tier 1: latest.json / GitHub API (api.github.com/repos/XRTM8/Otium-Docs/releases/latest)
 * Tier 2: GitHub Web Releases Redirect (github.com/XRTM8/Otium-Docs/releases/latest) -> 0 rate limit
 * Tier 3: Raw Git package.json (raw.githubusercontent.com/XRTM8/Otium-Docs/main/package.json) -> 0 rate limit
 */
export async function fetchReleaseInfo(
  url: string = OTIUM_RELEASE_FEED_URL,
  signal?: AbortSignal
): Promise<ReleaseInfo> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });

  try {
    // Attempt 1: Precompiled latest.json feed
    try {
      const response = await fetch(url, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      if (response.ok) {
        return parseReleaseInfo(await response.json());
      }
    } catch (e) {
      console.warn('latest.json fetch failed, falling back to 3-tier discovery:', e);
    }

    // TIER 1: GitHub API Releases Endpoint
    try {
      const apiRes = await fetch(GITHUB_API_URL, {
        cache: 'no-store',
        headers: { Accept: 'application/vnd.github.v3+json' },
        signal: controller.signal
      });
      if (apiRes.ok) {
        const data = await apiRes.json();
        const tag = (data.tag_name || data.name || '').replace(/^v/i, '').trim();
        if (tag) {
          const assets: ReleaseAssets = {};
          if (Array.isArray(data.assets)) {
            for (const asset of data.assets) {
              const name: string = asset.name || '';
              const downloadUrl: string = asset.browser_download_url || '';
              if (name.endsWith('.exe')) assets.windowsInstaller = { url: downloadUrl, size: asset.size };
              else if (name.endsWith('.zip')) assets.windowsPortable = { url: downloadUrl, size: asset.size };
              else if (name.endsWith('.apk')) assets.androidApk = { url: downloadUrl, size: asset.size };
            }
          }
          return {
            version: tag,
            notes: typeof data.body === 'string' ? data.body : '',
            pubDate: data.published_at || '',
            assets
          };
        }
      }
    } catch (e) {
      console.warn('Tier 1 GitHub API failed, proceeding to Tier 2:', e);
    }

    // TIER 2: GitHub Web Releases Redirect (0 rate limit)
    try {
      const webRes = await fetch(OTIUM_RELEASES_URL, {
        redirect: 'manual',
        signal: controller.signal
      });
      const location = webRes.headers.get('location') || webRes.url;
      const match = location?.match(/tag\/v?([0-9]+\.[0-9]+\.[0-9]+)/i);
      if (match && match[1]) {
        return {
          version: match[1].trim(),
          notes: 'New version available on GitHub Releases.',
          pubDate: '',
          assets: {
            windowsInstaller: { url: OTIUM_RELEASES_URL },
            androidApk: { url: OTIUM_RELEASES_URL }
          }
        };
      }
    } catch (e) {
      console.warn('Tier 2 Web redirect failed, proceeding to Tier 3:', e);
    }

    // TIER 3: Raw Git package.json (0 rate limit)
    const rawRes = await fetch(RAW_PKG_URL, {
      cache: 'no-store',
      signal: controller.signal
    });
    if (rawRes.ok) {
      const pkg = await rawRes.json();
      if (typeof pkg.version === 'string' && pkg.version.trim()) {
        return {
          version: normalizeVersion(pkg.version),
          notes: 'New version available.',
          pubDate: '',
          assets: {
            windowsInstaller: { url: OTIUM_RELEASES_URL },
            androidApk: { url: OTIUM_RELEASES_URL }
          }
        };
      }
    }

    throw new Error('All update discovery tiers exhausted.');
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
