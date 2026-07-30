export interface IcecatConfig {
  username?: string;
  password?: string;
}

export interface IcecatDatasheet {
  title: string;
  pdfUrl: string;
  version: number;
  fileSizeBytes: number;
  language: string;
}

const ICECAT_API_BASE = 'https://live.icecat.biz/api';

export function createIcecatClient(config?: IcecatConfig) {
  const username = config?.username ?? '***REMOVED***';
  const password = config?.password ?? '***REMOVED***';

  async function fetchDatasheets(
    brand: string,
    mpn: string,
  ): Promise<IcecatDatasheet[]> {
    try {
      const url = `${ICECAT_API_BASE}?UserName=${encodeURIComponent(username)}&Password=${encodeURIComponent(password)}&Language=fr&BrandName=${encodeURIComponent(brand)}&ProductCode=${encodeURIComponent(mpn)}&Content=datasheet`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) return [];

      const data = await res.json();
      const datasheets: IcecatDatasheet[] = [];

      if (data?.data?.Product?.ProductSheet) {
        const sheets = data.data.Product.ProductSheet;
        const list = Array.isArray(sheets) ? sheets : [sheets];
        for (const sheet of list) {
          if (sheet?.URL && sheet?.name) {
            datasheets.push({
              title: sheet.name ?? 'Fiche technique',
              pdfUrl: sheet.URL,
              version: sheet.version ?? 1,
              fileSizeBytes: sheet.file_size ?? 0,
              language: sheet.Language ?? 'fr',
            });
          }
        }
      }

      return datasheets;
    } catch {
      return [];
    }
  }

  return { fetchDatasheets };
}
