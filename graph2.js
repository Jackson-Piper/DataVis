
    const nameMap = {
      "United States": "United States of America",
      "Russia": "Russian Federation",
      "Korea": "Korea, Republic of",
      "South Korea": "Korea, Republic of",
      "Slovak Republic": "Slovakia",
      "Turkey": "Türkiye",
      "China (People’s Republic of)": "China",
      // add more as needed
    };

    const width = window.innerWidth * 2 / 3;
    const height = width * 0.55;

    const svg = d3.select("#graph2")
      .attr("width", width)
      .attr("height", height);

    const tooltip = d3.select("#tooltip");

    // Load both map and CSV in parallel
    Promise.all([
      d3.json("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"),
      d3.csv("data/perceived health by csv.csv", d => ({
        country: d["Reference area"],          // Use exact header as in your CSV
        value: +d.OBS_VALUE,                   // Number
        year: +d.TIME_PERIOD,                  // Number
        ecoStatus: d.SOCIO_ECON_STATUS         // String (like "q1", "q2", etc)
      })),
    ]).then(([geojson, data]) => {
      // Draw map
      console.log("Raw loaded data:", data);
      const projection = d3.geoNaturalEarth1()
        .fitSize([width, height], geojson);
      const path = d3.geoPath().projection(projection);



      // Filter CSV for q1 and the first year
      const q1data = data.filter(d => d.ecoStatus.toLowerCase() === "q1" && d.country);
      //to fimnd the first year
     // const years = [...new Set(q1data.map(d => d.year))];
      //const firstYear = Math.min(...years);
      //const yearData = q1data.filter(d => d.year === firstYear);

      //hard coded year
      const yearData = q1data.filter(d => d.year === 2020);

      // Create a lookup for country value (for fast coloring)
      const valueLookup = {};
      yearData.forEach(d => {
        const mappedName = nameMap[d.country] || d.country;
        valueLookup[mappedName] = d.value;
      });

      console.log("valueLookup keys:", Object.keys(valueLookup));
console.log("valueLookup:", valueLookup);

      // Set up a color scale for the heat map
      const colorScale = d3.scaleSequential()
        .domain([d3.min(yearData, d => d.value), d3.max(yearData, d => d.value)])
        .interpolator(d3.interpolateYlOrRd);

      // Draw the heat map
      svg.selectAll(".country")
        .data(geojson.features)
        .join("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", d => {
          const val = valueLookup[d.properties.name];
    return (val != null && !isNaN(val)) ? colorScale(val) : "#eee";
        })
        .on("mousemove", function (event, d) {
          const val = valueLookup[d.properties.name];
          tooltip
            .style("opacity", 1)
            .html(`<b>${d.properties.name}</b><br>
        Value: ${val !== undefined ? val : "No data"}`)
            .style("left", (event.pageX + 12) + "px")
            .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseleave", function () {
          tooltip.style("opacity", 0);
        });

    });