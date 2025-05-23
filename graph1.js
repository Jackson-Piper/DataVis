

        Promise.all([
        d3.text("data/OECDcountries.csv"),
        d3.text("data/nonOECD.csv")
    ]).then(([oecdText, nonOecdText]) => {
        const OECDCountry = oecdText.split(',').map(d => d.trim()).filter(d => d);
        const nonOECD = nonOecdText.split(',').map(d => d.trim()).filter(d => d);


        const width = window.innerWidth * 2 / 3;
        const height = width * 0.55;

        const svg = d3.select("#graph1")
            .attr("width", width)
            .attr("height", height);

        // Set up prjoection and path
        //geoNatural earth > geoMercator as countries are less distored making 
        // smaller size displays easier to read
        const projection = d3.geoNaturalEarth1()
            .scale((width / 1.4 / Math.PI)*0.8)
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        console.log('OECDCountry:', OECDCountry);
console.log('nonOECD:', nonOECD);

        // Load GeoJSON directly
        d3.json("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
            .then(geojson => {
                        console.log('Example GeoJSON country:', geojson.features[0].properties.name);
                svg.selectAll(".country")
                    .data(geojson.features)
                    .join("path")
                    .attr("class", d => {
                         console.log(d.properties.name, OECDCountry.includes(d.properties.name), nonOECD.includes(d.properties.name));
                        if (OECDCountry.includes(d.properties.name)) return "country oecd";
                        if (nonOECD.includes(d.properties.name)) return "country non-oecd";
                        return "country no-data";
                    })
                    .attr("d", path);
            });
             });