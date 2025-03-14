export interface UserProfile {
    userId: number | null;
    userName: string | null;
    cityName: string | null;
    countryName: string | null;
    resumeUrl?: string | null;
    companyName?: string | null;
}