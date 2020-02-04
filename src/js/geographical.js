import * as d3B from 'd3'
import * as topojson from 'topojson'
import * as geo from 'd3-geo-projection'
import seatsMap from '../assets/ireland-4326.json'
import { $ } from "./util"

const d3 = Object.assign({}, d3B, topojson, geo);



let isMobile = window.matchMedia('(max-width: 320px)').matches;

const atomEl = $('#gv-geographical')

let width = atomEl.getBoundingClientRect().width;
let height = width;

let svg = d3.select('#gv-geographical').append('svg')
.attr('width', width)
.attr('height', height)

let projection = d3.geoMercator()


let path = d3.geoPath()
.projection(projection)

projection.fitExtent([[0, 0], [width, height]], topojson.feature(seatsMap, seatsMap.objects['ireland-4326']));

//topojson.merge(us, us.objects.states.geometries.filter(function(d) { return selected.has(d.id); }))

const dublinGeo =  topojson.merge(seatsMap, seatsMap.objects['ireland-4326'].geometries.filter(f => f.properties.MAX_CON_NA.indexOf('Dublin') > -1 || f.properties.MAX_CON_NA === 'Dún Laoghaire (4)'))


/*const dublinGeo = topojson.feature(seatsMap, {
	type: "GeometryCollection",
	geometries: seatsMap.objects['ireland-4326'].geometries.filter(f => f.properties.MAX_CON_NA.indexOf('Dublin') > -1 || f.properties.MAX_CON_NA === 'Dún Laoghaire (4)')
});
*/
//console.log(seatsMap.objects['ireland-4326'])

const dublinFeatures = topojson.feature(seatsMap, seatsMap.objects['ireland-4326']).features.filter(f => f.properties.MAX_CON_NA.indexOf('Dublin') > -1 || f.properties.MAX_CON_NA === 'Dún Laoghaire (4)')

let seats = svg.selectAll('path')
.data(topojson.feature(seatsMap, seatsMap.objects['ireland-4326']).features)
.enter()
.append("path")
.attr("d", path)
.attr("class", d => 'constituency ' + d.properties.MAX_CON_NA)

let borders = svg.append("path")
.datum(topojson.feature(seatsMap, seatsMap.objects['ireland-4326']))
.attr('d', path(topojson.mesh(seatsMap, seatsMap.objects['ireland-4326'], (a, b) => a !== b)))
.style('fill', 'none')
.attr('class', 'geo-border')

let dublin = svg.append('path')
.datum(dublinGeo)
.attr("d", path)
.attr('class', 'constituency')

let dublinBorder = svg.append("path")
.datum(dublinGeo)
.attr("d", path)
.attr('class', 'dublin-border')


let texts = svg.selectAll("text")
.data(topojson.feature(seatsMap, seatsMap.objects['ireland-4326']).features)
.enter()
.filter(d => d.properties.MAX_CON_NA.indexOf('Dublin') < 0 && d.properties.MAX_CON_NA.indexOf('Dún Laoghaire') < 0)
.append('text')
.attr('x',d=> path.centroid(d)[0])
.attr('y',d=>path.centroid(d)[1])
.text(d => d.properties.deputies)

export default function(data){

	//console.log('geo', data)



}

/*


const parties = ["FF","FG","IO","LAB","SP","","SF","GP","Daly, Clare","PBP", "SD", "WUA"];


results.map( r => {

	const cons = r.con_id;

	for(let i = 1; i <= 5; i++)
	{
		//console.log('.p' + cons + '_' + i);

		d3.select('#p' + cons + '_' + i)
		.attr('class', r['party_' + i]);
	}
})

//console.log(d3.select('#p10001C_1'))
*/