export const actionGetCurrent = async props => {
    const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${process.env.REACT_APP_WEATHER_API}&q=singapore&aqi=yes`);
    return await response.json();
}
