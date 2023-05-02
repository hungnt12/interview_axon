import Chart from 'react-apexcharts'
import {useEffect, useState} from 'react'
import {Space, Spin, Form, Input, AutoComplete, Statistic} from 'antd'

const Index = props => {
    const [resultCurrent, setResultCurrent] = useState(),
        [resultForecast, setResultForecast] = useState(),
        [chartOptions, setChartOptions] = useState({}),
        [addresses, setAddress] = useState([]),
        [addressSelected, setAddressSelected] = useState(),
        [positionSelected, setPositionSelected] = useState(0),
        [reloadTime, setReloadTime] = useState(Date.now() + 60000),
        [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        callAPIWeather();
        const interval = setInterval(() => {
            resetAction()
        }, 60000);

        return () => {
            clearInterval(interval)
            setAddressSelected("")
        }
    }, [])
    const resetAction = () => {
        setIsFetching(true)
        callAPIWeather(addressSelected);
        setReloadTime(Date.now() + 60000)
    }
    useEffect(() => {
        if (!window.google) {
            const script = document.createElement("script");

            script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyA3rR123Sl0Gxp2c5OHLOgLbvUvyH64gLw&libraries=places';
            script.async = true;
            if (typeof onGGLoad === "function") {
                script.onload = onGGLoad;
            }

            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        }
    }, []);

    const onGGLoad = () => {

        window.dispatchEvent(new Event('google-map-api-loaded'))
    }

    useEffect(() => {
        if (Object?.keys(resultForecast || {}).length > 0) {
            let dataChart = [],
                hourCategories = new Array(24).fill(".").map((i, k) => `${k}: 00`);
            if (resultForecast?.forecast) {
                if ((resultForecast?.forecast?.forecastday || []).length > 0) {
                    dataChart = resultForecast?.forecast?.forecastday[0]?.hour.map(i => i?.temp_c)
                }
            }
            setChartOptions({
                "series": [{"name": "t °C", "data": dataChart}],
                "options": {
                    "chart": {
                        "type": "area",
                        "height": "auto",
                        "parentHeightOffset": 0,
                        "zoom": {"enabled": false},
                        "toolbar": {"show": false}
                    },
                    "fill": {"colors": ["#fff"], "type": "gradient"},
                    "dataLabels": {
                        "enabled": true,
                        "textAnchor": "middle",
                        "offsetY": -5,
                        "style": {"fontSize": "12px", "colors": ["#333", "#999"]},
                        "background": {"enabled": false}
                    },
                    "stroke": {"curve": "smooth", "colors": ["#46c2ff"], "width": 2},
                    "legend": {"show": false},
                    "grid": {"show": true},
                    "tooltip": {"x": {"show": false}, "fixed": {"enabled": true}},
                    "xaxis": {
                        "type": "numeric ",
                        "categories": hourCategories,
                        "crosshairs": {"show": false},
                        "tooltip": {"enabled": false}
                    },
                    "yaxis": {"show": true, "labels": {"offsetX": -10}}
                }
            })
        }

    }, [resultForecast])

    const actionGetCurrent = async address => {
        const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${process.env.REACT_APP_WEATHER_API}&q=${address || "singapore"}&aqi=yes`);
        let result = await response.json();
        setResultCurrent(result)
        return result
    }
    const actionGetForeCast = async address => {
        const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${process.env.REACT_APP_WEATHER_API}&q=${address || "singapore"}&days=4&aqi=yes&alerts=yes`);
        let result = await response.json();
        setResultForecast(result)
        return result
    }

    const callAPIWeather = address => {
        setIsFetching(true)
        return new Promise((resolve, reject) => {
            return Promise.all([
                actionGetCurrent(address),
                actionGetForeCast(address),
            ]).then((responses) => {
                const current = responses[0] || {},
                    forecast = responses[1] || {};
                const result = {
                    current, forecast
                };
                setIsFetching(false)
                return resolve(result);
            }).catch((e) => {
                console.log('===== Get all common filters service error', e);
                resolve({})
            })
        })
    }


    const onFinish = val => {

    }

    const handleSearch = (address) => {
        if (window.getPredictions) clearTimeout(window.getPredictions);
        if (address) {
            window.getPredictions = setTimeout(() => {
                // if (lookup.status !== 'idle') {
                //     resetLookUpField();
                // }
                const service = new window.google.maps.places.AutocompleteService();
                service.getPlacePredictions({
                    input: address
                }, displaySuggestion)
                window.getPredictions = false;
            }, 500);
        } else {
            // setLookupAddress(false)
            setAddress([])
        }
    };

    const displaySuggestion = (predictions, status) => {
        // console.log({predictions, status})
        if (window.google && status != window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
            setAddress([])
            return;
        }
        // setAddress(predictions)
        setAddress(predictions.map(addr => {
            return {
                value: addr.description,
                terms: addr.terms,
                place_id: addr.place_id
            }
        }))
    }
    const onSelect = (address, all) => {
        setAddressSelected(address)
        callAPIWeather(address);
    };

    const onChoose = (item, position) => {
        setIsFetching(true)
        setPositionSelected(position);
        let dataChart = [],
            hourCategories = new Array(24).fill(".").map((i, k) => `${k}: 00`);
        if (resultForecast?.forecast) {
            dataChart = item?.hour.map(i => i?.temp_c)
        }
        setChartOptions({
            "series": [{"name": "t °C", "data": dataChart}],
            "options": {
                "chart": {
                    "type": "area",
                    "height": "auto",
                    "parentHeightOffset": 0,
                    "zoom": {"enabled": false},
                    "toolbar": {"show": false}
                },
                "fill": {"colors": ["#fff"], "type": "gradient"},
                "dataLabels": {
                    "enabled": true,
                    "textAnchor": "middle",
                    "offsetY": -5,
                    "style": {"fontSize": "12px", "colors": ["#333", "#999"]},
                    "background": {"enabled": false}
                },
                "stroke": {"curve": "smooth", "colors": ["#46c2ff"], "width": 2},
                "legend": {"show": false},
                "grid": {"show": true},
                "tooltip": {"x": {"show": false}, "fixed": {"enabled": true}},
                "xaxis": {
                    "type": "numeric ",
                    "categories": hourCategories,
                    "crosshairs": {"show": false},
                    "tooltip": {"enabled": false}
                },
                "yaxis": {"show": true, "labels": {"offsetX": -10}}
            }
        })
        setIsFetching(false)
    };

    return (
        <div className="container py-5">
            <Spin spinning={isFetching}>
                <Form
                    style={{width: "40%", margin: "auto"}}
                    // name="basic"
                    onFinish={onFinish}
                    // onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <AutoComplete
                        dropdownMatchSelectWidth={252}
                        style={{
                            width: "100%",
                        }}
                        options={addresses}
                        onSelect={onSelect}
                        onSearch={handleSearch}
                    >
                        <Input.Search size="large" placeholder="Input your location" enterButton/>
                    </AutoComplete>
                </Form>
                <div className="row mt-5">
                    <div className="col-4"/>
                    <div className="col-4">
                        <div className="card box--shadow">
                            <div className="card-body p-4">
                                <h5 className="card-title">
                                    <div className="row">
                                        <div className="col-6">
                                            {resultCurrent?.location?.name || ""}
                                        </div>
                                        <div className="col-6 text-end">
                                            {resultCurrent?.location?.localtime || ""}
                                        </div>
                                    </div>
                                </h5>
                                <div className="text-center">
                                    <p className="card-text mb-1 fs--50px fw-bold">{resultCurrent?.current?.temp_c || 0} °C</p>
                                    <img className="my-3" src={resultCurrent?.current?.condition?.icon}/>
                                    <p className="fw-bold">{resultCurrent?.current?.condition?.text || ""}</p>
                                </div>
                                <div className="row">
                                    <div className="col-6">
                                        <Space>
                                            <div style={{width: "30px"}}>
                                                <i className="fa fa-wind"></i>
                                            </div>
                                            <p className="mb-0">{resultCurrent?.current?.wind_kph} km/h</p>
                                        </Space>
                                        <div className="my-2"/>
                                        <Space>
                                            <div style={{width: "30px"}}>
                                                <i className="fa fa-tint"></i>
                                            </div>
                                            <p className="mb-0">{resultCurrent?.current?.humidity}</p>
                                        </Space>
                                        {/*<div className="my-2"/>*/}
                                        {/*<Space>*/}
                                        {/*    <div style={{width: "30px"}}>*/}
                                        {/*        <i className="fa fa-sun"></i>*/}
                                        {/*    </div>*/}
                                        {/*    <p className="mb-0">80%</p>*/}
                                        {/*</Space>*/}
                                    </div>
                                    <div className="col-6 text-end">
                                        <Statistic.Countdown
                                            title="Reload time"
                                            value={reloadTime}
                                            format="ss"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-4"/>
                </div>
                <div className="row mt-5 mb-3">
                    <p className="h3">Temperatures</p>
                    <div className="col-12">
                        {
                            Object?.keys(chartOptions).length > 0 ? (
                                <Chart
                                    options={chartOptions.options}
                                    series={chartOptions.series}
                                    type='area'
                                    height={350}/>
                            ) : null
                        }
                    </div>
                </div>
                <div className="row mt-5 align-items-center">
                    {
                        ((resultForecast?.forecast?.forecastday || []).length > 0) ? (resultForecast?.forecast?.forecastday || []).map((i, k) => {
                            return (
                                <div className="col-3" key={k} style={{cursor: "pointer"}}
                                     onClick={e => onChoose(i, k)}>
                                    <div
                                        className={`text-center hn__weather-day--item ${k === positionSelected ? "hn__weather-day--item-active" : ""}`}>
                                        <p className="mb-1">{i?.date}</p>
                                        <div>
                                            <img src={i?.day?.condition?.icon} width={80}/>
                                        </div>
                                        <p className="mb-1">{i?.day?.avgtemp_c}</p>
                                        <p className="mb-1">{i?.day?.condition?.text}</p>
                                    </div>
                                </div>
                            )
                        }) : null
                    }

                </div>
            </Spin>
        </div>
    )
}

export default Index;
