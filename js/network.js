
//read node and link files
d3.tsv("data/refseq93.color.tsv").then(nodeData=>{
    d3.tsv("data/test.tsv").then(linkData=>{
        // console.log(nodeData);
        // console.log(linkData);
        let nest = d3.nest().key(d=>d["tax_species"]).entries(nodeData);
        let nodes = nest.map(d=>d.key);
        let linkNest = d3.nest().key(d=>d.source).entries(linkData);
        let linkNodes = linkNest.map(d=>d.key);
        // let nodes = nest.map((d,i)=>{
        //     return{
        //         node:d.key,
        //         degree:
        //
        //
        //     }
        //
        //
        // });
        let links = linkData.map(d=>d);
        console.log(nest);
        console.log(links);
        console.log(linkNest);
        console.log(linkNodes);
    drawHive(nest,links);

    })
})


const width = 960,
    height = 500,
    innerRadius = 40,
    outerRadius = 240;

const angle = d3.scalePoint().domain(d3.range(20)).range([0, 2 * Math.PI]),
    radius = d3.scaleLinear().range([innerRadius, outerRadius]);
    color = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(20));


function drawHive(nodes,links){


    // var nodes = [
    //     {x: 0, y: .1},
    //     {x: 0, y: .9},
    //     {x: 1, y: .2},
    //     {x: 1, y: .3},
    //     {x: 2, y: .1},
    //     {x: 2, y: .8}
    // ];
    //
    // var links = [
    //     {source: nodes[0], target: nodes[2]},
    //     {source: nodes[1], target: nodes[3]},
    //     {source: nodes[2], target: nodes[4]},
    //     {source: nodes[2], target: nodes[5]},
    //     {source: nodes[3], target: nodes[5]},
    //     {source: nodes[4], target: nodes[0]},
    //     {source: nodes[5], target: nodes[1]}
    // ];

    var svgHive = d3.select("#hiveChart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svgHive.selectAll(".axis")
        .data(d3.range(3))
        .enter().append("line")
        .attr("class", "axis")
        .attr("transform", function(d) { return "rotate(" + degrees(angle(d)) + ")"; })
        .attr("x1", radius.range()[0])
        .attr("x2", radius.range()[1]);
debugger
    svgHive.selectAll(".link")
        .data(links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.hive.link()
            .angle(function(d,i) { return angle(i); })
            .radius(function(d,i) { return radius(i); }))
        .style("stroke", function(d) { return color(d.source); });

    svgHive.selectAll(".node")
        .data(nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("transform", function(d,i) { return "rotate(" + degrees(angle(i)/145832) + ")"; })
        .attr("cx", function(d,i) { return radius(i/145832); })
        .attr("r", 3)
        .style("fill", function(d) { return d.color; });

    function degrees(radians) {
        return radians / Math.PI * 180 - 90;
    }



}