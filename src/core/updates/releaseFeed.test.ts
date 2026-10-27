import { describe, it, expect } from 'vitest';
import {
  compareVersions,
  isNewerVersion,
  parseReleaseInfo
} from './releaseFeed';

describe('Otium Docs 3-Tier Updater Core', () => {
  it('correctly compares semantic versions', () => {
    expect(compareVersions('1.0.1', '1.0.0')).toBeGreaterThan(0);
    expect(compareVersions('1.1.0', '1.0.5')).toBeGreaterThan(0);
    expect(compareVersions('2.0.0', '1.9.9')).toBeGreaterThan(0);
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
    expect(compareVersions('0.9.9', '1.0.0')).toBeLessThan(0);
  });

  it('evaluates isNewerVersion with various prefixes and whitespace', () => {
    expect(isNewerVersion('v1.0.1', 'v1.0.0')).toBe(true);
    expect(isNewerVersion(' 1.0.2 ', '1.0.1')).toBe(true);
    expect(isNewerVersion('v1.0.0', 'v1.0.0')).toBe(false);
    expect(isNewerVersion('0.9.9', '1.0.0')).toBe(false);
  });

  it('parses valid release feed object', () => {
    const raw = {
      version: 'v1.0.0',
      notes: 'Initial release of Otium Docs',
      pub_date: '2026-10-27T20:00:00Z',
      assets: {
        windowsInstaller: {
          url: 'https://github.com/XRTM8/Otium-Docs/releases/download/v1.0.0/Otium_Docs_1.0.0_x64-setup.exe',
          size: 15000000
        },
        androidApk: {
          url: 'https://github.com/XRTM8/Otium-Docs/releases/download/v1.0.0/Otium_Docs_1.0.0_arm64-v8a.apk',
          size: 18000000
        }
      }
    };

    const parsed = parseReleaseInfo(raw);
    expect(parsed.version).toBe('1.0.0');
    expect(parsed.notes).toBe('Initial release of Otium Docs');
    expect(parsed.assets.windowsInstaller?.url).toContain('setup.exe');
    expect(parsed.assets.androidApk?.url).toContain('arm64-v8a.apk');
  });

  it('throws on invalid release feed payload', () => {
    expect(() => parseReleaseInfo(null)).toThrow();
    expect(() => parseReleaseInfo({})).toThrow();
    expect(() => parseReleaseInfo({ version: '' })).toThrow();
  });
});
