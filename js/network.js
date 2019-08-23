let paths = ['data/t.tsv','test.tsv'];
const width = 2000,
      height = 2000;
const format = d3.format(',d');
const pack = d3.pack()
    .size([width,height])
    .padding(1);
let svgPack = d3.select('#chart')
    .append('svg')
    .attr('class','packChart')
    .attr('width', width)
    .attr('height', height);

// Read files
Promise.all(paths.map(path=>d3.tsv(path))).then(files=>{
    let nodeData = files[0];
    let linkData = files[1];
    let colors = nodeData.map(d=>d.color);
    // console.log(colors);
    let links = linkData.map(d=>d);
    let linkNodes = d3.nest().key(d=>d.source).entries(linkData);
    // console.log(linkNodes);
// debugger
    // Make data hierarchical
    let newData = makeHierarchy({
        data:nodeData,
        groupByFns:[d=>+d['tax_species'], d=>d['desc'], d=>d['#node']],
        reduceFn:v=>v.length,
    });
    debugger
    drawCirclePack(newData);
});

function drawCirclePack(data) {
    // Initialize root node
    let root = pack(data);
    pack(data);

    // Draw nodes on svg
    const node = svgPack.append("g")
        .attr("pointer-events", "all")
        .selectAll("g")
        .data(root.descendants())
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" + d.x/2 + "," + d.y/2 + ")"; })
        .attr("class", function(d) { return "node" + (!d.children ? " node--leaf" : d.depth ? "" : " node--root"); })
        .each(function(d) { d.node = this; })
        .on("mouseover", hovered(true))
        .on("mouseout", hovered(false));

    node.append("circle")
        .attr('id', d=>'node-'+ d.data[0])
        .attr("r", d => d.r/2)
        .attr("stroke", d => d.children ? "#bbb" : "none")
        .attr("fill", d => d.children ? "none" : "#ddd");

    const leaf = node.filter(d => !d.children);
debugger
    leaf.append("clipPath")
        .attr("id", d => 'clip-' + d.data[0])
        .append("use")
        .attr("xlink:href", d => '#node-' + d.data[0]);

    // leaf.append("text")
    //     .attr("clip-path", d => 'url(#clip-)' + d.data[0])
    //     .selectAll("tspan")
    //     .data(d => d.data[0].split(/(?=[A-Z][^A-Z])/g))
    //     .join("tspan")
    //     .attr("x", 0)
    //     .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
    //     .text(d => d);

    node.append("title")
        .text(d => `${d.ancestors().map(d => d.data[0]).reverse().join("/")}
${d.value.toLocaleString()}`);


//     svgPack.append("g")
//         // .attr("fill", "#ccc")
//         .selectAll("circle")
//         .data(root.leaves())
//         .join("circle")
//         .attr("transform", d => `translate(${d.x},${d.y})`)
//         .attr("r", d => d.r)
//         .append("title")
//         .text(d => `${d.ancestors().map(d => d.data[0]).reverse().join("/")}\n${format(d.value)}`);
// debugger
//     svgPack.append("g")
//         .attr("pointer-events", "none")
//         .attr("text-anchor", "middle")
//         .selectAll("text")
//         .data(root.leaves().filter(d => d.r > 0.1))
//         .join("text")
//         .attr("transform", d => `translate(${d.x},${d.y}) scale(${d.r / 30})`)
//         .selectAll("tspan")
//         .data(d => (d.data[0] + "").split(/\s+/g))
//         .join("tspan")
//         .attr("x", 0)
//         .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
//         .text(d => d);

}
function hovered(hover) {
    return function(d) {
        d3.selectAll(d.ancestors().map(function(d) { return d.node; })).classed("node--hover", hover);
    };
}
// function to make data nested for hierarchical layout
function makeHierarchy(config) {
    const defaultConfig = {
        childrenAccessorFn: ([key, value]) => value.size && Array.from(value),
        sumFn: ([key, value]) => value,
        sortFn: (a, b) => b.value - a.value,
    };
    const { data,
        reduceFn,
        groupByFns,
        childrenAccessorFn,
        sumFn,
        sortFn
    } = { ...defaultConfig, ...config };
    const rollupData = d3.rollup(data, reduceFn, ...groupByFns);
    // const groupData = d3.group(data,...groupByFns);
    const hierarchyData = d3.hierarchy([null,rollupData], childrenAccessorFn)
    // const hierarchyData = d3.hierarchy(groupData, childrenAccessorFn)
        .sum(sumFn)
        .sort(sortFn);
    return hierarchyData;
}

