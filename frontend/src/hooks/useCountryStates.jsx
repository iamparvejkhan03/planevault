function useCountryStates() {
    // utils/countryService.js
    const fetchCountriesWithStates = async () => {
        try {
            // First, get all countries
            const countriesResponse = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
            const countriesData = await countriesResponse.json();

            const countries = countriesData.map(country => ({
                name: country.name.common,
                code: country.cca2,
                states: []
            })).sort((a, b) => a.name.localeCompare(b.name));

            return countries;

        } catch (error) {
            console.error('Error fetching countries:', error);
            return [];
        }
    };

    // For states, you might need a different API or database
    // const fetchStatesByCountry = async (countryCode) => {
    //     try {
    //         // This is a placeholder - you'll need to find a reliable states API
    //         const response = await fetch(`https://api.example.com/states/${countryCode}`);
    //         const states = await response.json();
    //         return states;
    //     } catch (error) {
    //         console.error('Error fetching states:', error);
    //         return [];
    //     }
    // };
    
    return fetchCountriesWithStates;
}

export default useCountryStates;