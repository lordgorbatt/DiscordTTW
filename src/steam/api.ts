export interface SteamFileDetails {
  publishedfileid: string;
  title: string;
  tags?: Array<{ tag: string }>;
  time_updated: number;
}

export interface SteamApiResponse {
  response?: {
    result?: number;
    resultcount?: number;
    publishedfiledetails?: SteamFileDetails[];
  };
}

/**
 * Fetch Steam Workshop file details in batch
 */
export async function fetchSteamWorkshopDetails(
  workshopIds: string[]
): Promise<Map<string, SteamFileDetails>> {
  if (workshopIds.length === 0) {
    return new Map();
  }

  const url = 'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/';
  
  // Build form data
  const formData = new URLSearchParams();
  formData.append('itemcount', workshopIds.length.toString());
  workshopIds.forEach((id, index) => {
    formData.append(`publishedfileids[${index}]`, id);
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as SteamApiResponse;
    
    if (!data.response?.publishedfiledetails) {
      return new Map();
    }

    const result = new Map<string, SteamFileDetails>();
    for (const detail of data.response.publishedfiledetails) {
      result.set(detail.publishedfileid, detail);
    }

    return result;
  } catch (error) {
    console.error('Error fetching Steam Workshop details:', error);
    return new Map();
  }
}
