/**
 * Portland Maps API Client
 * Provides access to property, zoning, and permit data from portlandmaps.com
 */

export interface PropertySuggestion {
  label: string;
  value: string;
  type: string;
  city?: string;
  county?: string;
}

export interface PropertyDetails {
  address: string;
  propertyId: string;
  taxlot?: string;
  owner?: string;
  zoning?: string;
  zoningDescription?: string;
  landUse?: string;
  yearBuilt?: string;
  squareFeet?: string;
  acreage?: string;
  taxMapNumber?: string;
  propertyClass?: string;
}

export interface ZoningInfo {
  zone: string;
  description: string;
  overlay?: string;
  planDistrict?: string;
  additionalInfo?: string;
}

/**
 * Client for interacting with Portland Maps APIs
 */
export class PortlandMapsClient {
  private readonly baseUrl = 'https://www.portlandmaps.com';
  private readonly apiUrl = `${this.baseUrl}/api`;
  private readonly odUrl = `${this.baseUrl}/od/rest/services`;

  /**
   * Add disclaimer to all results
   */
  private addDisclaimer(data: string): string {
    const disclaimer = 
      '\n\n---\n' +
      '**Disclaimer:** This is an unofficial use of Portland Maps data. ' +
      'For official information, please visit https://www.portlandmaps.com. ' +
      'Consider supporting the City of Portland\'s mapping services.\n' +
      'Data provided by the City of Portland - https://www.portlandmaps.com';
    return data + disclaimer;
  }

  /**
   * Search for properties by address
   */
  async searchAddress(address: string): Promise<PropertySuggestion[]> {
    try {
      const url = `${this.apiUrl}/suggest/?query=${encodeURIComponent(address)}&city=Portland&count=10`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates || [];
    } catch (error) {
      throw new Error(`Failed to search address: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get property details by taxlot or property ID
   */
  async getPropertyDetails(propertyId: string): Promise<string> {
    try {
      // The property ID format is typically like "R123456" or a taxlot number
      const url = `${this.baseUrl}/detail.cfm?propertyid=${encodeURIComponent(propertyId)}`;
      
      // Note: This would need to be scraped or use their OpenData API
      // For now, we'll return information about how to access it
      const info = 
        `Property Details for ID: ${propertyId}\n\n` +
        `To view full property details, visit:\n${url}\n\n` +
        `For programmatic access, use the Portland Maps OpenData API:\n` +
        `${this.odUrl}/COP_OpenData_Property/MapServer\n\n` +
        `This can be queried for specific property information including:\n` +
        `- Property boundaries\n` +
        `- Zoning information\n` +
        `- Tax lot details\n` +
        `- Property characteristics`;

      return this.addDisclaimer(info);
    } catch (error) {
      throw new Error(`Failed to get property details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Query zoning information for a location
   */
  async getZoningInfo(address: string): Promise<string> {
    try {
      // Search for the address first
      const suggestions = await this.searchAddress(address);
      
      if (suggestions.length === 0) {
        return this.addDisclaimer(`No results found for address: ${address}`);
      }

      let result = `Zoning Information Search Results for: ${address}\n\n`;
      result += `Found ${suggestions.length} matching locations:\n\n`;

      for (let i = 0; i < Math.min(suggestions.length, 5); i++) {
        const suggestion = suggestions[i];
        result += `${i + 1}. ${suggestion.label}\n`;
        result += `   Type: ${suggestion.type}\n`;
        if (suggestion.value) {
          result += `   Property ID: ${suggestion.value}\n`;
          result += `   View details: ${this.baseUrl}/detail.cfm?propertyid=${encodeURIComponent(suggestion.value)}\n`;
        }
        result += '\n';
      }

      result += `\nTo view zoning regulations and maps, visit:\n`;
      result += `https://www.portlandmaps.com/bps/zoning/\n\n`;
      result += `For zoning code details, see:\n`;
      result += `https://www.portland.gov/bps/zoning\n`;

      return this.addDisclaimer(result);
    } catch (error) {
      throw new Error(`Failed to get zoning info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get permit history information
   */
  async getPermitHistory(address: string): Promise<string> {
    try {
      const suggestions = await this.searchAddress(address);
      
      if (suggestions.length === 0) {
        return this.addDisclaimer(`No results found for address: ${address}`);
      }

      const topMatch = suggestions[0];
      
      let result = `Permit History Information for: ${address}\n\n`;
      result += `Best Match: ${topMatch.label}\n`;
      result += `Type: ${topMatch.type}\n\n`;

      if (topMatch.value) {
        result += `To view permit history, visit:\n`;
        result += `${this.baseUrl}/detail.cfm?propertyid=${encodeURIComponent(topMatch.value)}\n\n`;
        result += `Then select the "Permits" tab to view:\n`;
        result += `- Building permits\n`;
        result += `- Land use reviews\n`;
        result += `- Environmental reviews\n`;
        result += `- Historic permits\n\n`;
      }

      result += `For general permit information search:\n`;
      result += `https://www.portlandmaps.com/permits/\n`;

      return this.addDisclaimer(result);
    } catch (error) {
      throw new Error(`Failed to get permit history: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get property tax information
   */
  async getPropertyTaxInfo(address: string): Promise<string> {
    try {
      const suggestions = await this.searchAddress(address);
      
      if (suggestions.length === 0) {
        return this.addDisclaimer(`No results found for address: ${address}`);
      }

      const topMatch = suggestions[0];
      
      let result = `Property Tax Information for: ${address}\n\n`;
      result += `Best Match: ${topMatch.label}\n`;
      result += `Type: ${topMatch.type}\n\n`;

      if (topMatch.value) {
        result += `To view property tax information, visit:\n`;
        result += `${this.baseUrl}/detail.cfm?propertyid=${encodeURIComponent(topMatch.value)}\n\n`;
        result += `Then select the "Assessment & Taxation" tab to view:\n`;
        result += `- Assessed value\n`;
        result += `- Real market value\n`;
        result += `- Property tax amount\n`;
        result += `- Tax account information\n\n`;
      }

      result += `For property tax assessment information:\n`;
      result += `https://multco.us/assessment-taxation\n`;

      return this.addDisclaimer(result);
    } catch (error) {
      throw new Error(`Failed to get property tax info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get comprehensive property information
   */
  async getPropertyInfo(address: string): Promise<string> {
    try {
      const suggestions = await this.searchAddress(address);
      
      if (suggestions.length === 0) {
        return this.addDisclaimer(`No results found for address: ${address}`);
      }

      let result = `Property Information for: ${address}\n\n`;
      result += `Search Results (${suggestions.length} found):\n\n`;

      for (let i = 0; i < Math.min(suggestions.length, 3); i++) {
        const suggestion = suggestions[i];
        result += `${i + 1}. ${suggestion.label}\n`;
        result += `   Type: ${suggestion.type}\n`;
        
        if (suggestion.value) {
          result += `   Property ID: ${suggestion.value}\n`;
          const detailUrl = `${this.baseUrl}/detail.cfm?propertyid=${encodeURIComponent(suggestion.value)}`;
          result += `   View full details: ${detailUrl}\n\n`;
          result += `   Available information at this URL includes:\n`;
          result += `   - Property details (owner, lot size, year built)\n`;
          result += `   - Zoning information\n`;
          result += `   - Assessment & taxation data\n`;
          result += `   - Permit history\n`;
          result += `   - Sales history\n`;
          result += `   - Aerial photos and maps\n`;
        }
        result += '\n';
      }

      result += `\nAdditional Resources:\n`;
      result += `- Zoning Maps: https://www.portlandmaps.com/bps/zoning/\n`;
      result += `- Permit Search: https://www.portlandmaps.com/permits/\n`;
      result += `- GIS Data: https://gis-pdx.opendata.arcgis.com/\n`;

      return this.addDisclaimer(result);
    } catch (error) {
      throw new Error(`Failed to get property info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
