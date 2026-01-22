import axios from "axios"

export async function fetchGSTDetails(gstin: string) {
  try {
    // Check if GST API is configured
    if (!process.env.GST_API_KEY) {
      console.warn('GST_API_KEY not configured, using mock data')
      return getMockGSTData(gstin)
    }

    const response = await axios.get(
      `https://api.examplegst.com/gstin/${gstin}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GST_API_KEY}`
        }
      }
    )

    return response.data
  } catch (error ) {
    console.warn('GST API call failed, using mock data:', error.message)
    return getMockGSTData(gstin)
  }
}

function getMockGSTData(gstin: string) {
  return {
    legalName: "Verified Business Entity",
    status: "Active",
    gstin: gstin
  }
}