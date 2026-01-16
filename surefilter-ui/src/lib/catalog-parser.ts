import { JSDOM } from 'jsdom';

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Application {
  manufacturer: string;
  model: string;
  engineSeries: string;
  year: string;
  cc: string;
  fuel: string;
}

export interface PrimaryApplication {
  referenceNumber: string;
  manufacturer: string;
}

export interface CatalogData {
  title: string;
  imageUrl?: string; // Product image from manufacturer
  specifications: ProductSpec[];
  primaryApplications: PrimaryApplication[];
  applications: Application[];
}

/**
 * Fetch and parse HTML catalog from manufacturer's website
 */
export async function fetchAndParseCatalog(catalogUrl: string): Promise<CatalogData> {
  try {
    // 1. Fetch HTML
    const response = await fetch(catalogUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch catalog: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // 2. Parse data
    const catalogData: CatalogData = {
      title: '',
      imageUrl: undefined,
      specifications: [],
      primaryApplications: [],
      applications: [],
    };
    
    // Extract title (product name)
    const h1 = document.querySelector('h1');
    if (h1) {
      catalogData.title = h1.textContent?.trim() || '';
    }
    
    // Extract product image
    const img = document.querySelector('img[src*="products"], img[alt*="product"], img.product-image, .product-image img');
    if (img) {
      const imgSrc = img.getAttribute('src');
      if (imgSrc) {
        // Convert relative URLs to absolute
        if (imgSrc.startsWith('/')) {
          const url = new URL(catalogUrl);
          catalogData.imageUrl = `${url.origin}${imgSrc}`;
        } else if (imgSrc.startsWith('http')) {
          catalogData.imageUrl = imgSrc;
        } else {
          const url = new URL(catalogUrl);
          catalogData.imageUrl = `${url.origin}/${imgSrc}`;
        }
      }
    }
    
    // Fallback: try to find any image in the document
    if (!catalogData.imageUrl) {
      const anyImg = document.querySelector('img[src]');
      if (anyImg) {
        const imgSrc = anyImg.getAttribute('src');
        if (imgSrc && !imgSrc.includes('logo') && !imgSrc.includes('icon')) {
          if (imgSrc.startsWith('/')) {
            const url = new URL(catalogUrl);
            catalogData.imageUrl = `${url.origin}${imgSrc}`;
          } else if (imgSrc.startsWith('http')) {
            catalogData.imageUrl = imgSrc;
          }
        }
      }
    }
    
    // Extract all tables
    const tables = document.querySelectorAll('table');
    
    // First table - specifications
    if (tables[0]) {
      const rows = tables[0].querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
          const label = cells[0].textContent?.trim() || '';
          const value = cells[2].textContent?.trim() || '';
          if (label && value && label !== 'Status') {
            catalogData.specifications.push({ label, value });
          }
        }
      });
    }
    
    // Second table - Primary Applications
    if (tables[1]) {
      const rows = tables[1].querySelectorAll('tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const refNum = cells[0].textContent?.trim() || '';
          const manufacturer = cells[1].textContent?.trim() || '';
          if (refNum && manufacturer) {
            catalogData.primaryApplications.push({
              referenceNumber: refNum,
              manufacturer: manufacturer,
            });
          }
        }
      });
    }
    
    // Third table - Applications
    if (tables[2]) {
      const rows = tables[2].querySelectorAll('tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 6) {
          const manufacturer = cells[0].textContent?.trim() || '';
          const model = cells[1].textContent?.trim() || '';
          const engineSeries = cells[2].textContent?.trim() || '';
          const year = cells[3].textContent?.trim() || '';
          const cc = cells[4].textContent?.trim() || '';
          const fuel = cells[5].textContent?.trim() || '';
          
          if (manufacturer) {
            catalogData.applications.push({
              manufacturer,
              model,
              engineSeries,
              year,
              cc,
              fuel,
            });
          }
        }
      });
    }
    
    return catalogData;
  } catch (error) {
    console.error('Error fetching/parsing catalog:', error);
    throw error;
  }
}
