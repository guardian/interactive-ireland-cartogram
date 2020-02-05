import * as d3B from 'd3'
import * as topojson from 'topojson'
import * as geo from 'd3-geo-projection'
import seatsMap from '../assets/ireland-4326.json'
import { $ } from "./util"
import { highlightCarto, deleteCartoHighlight, mousemove, printResult } from './cartogram.js'

const d3 = Object.assign({}, d3B, topojson, geo);

let isMobile = window.matchMedia('(max-width: 320px)').matches;

const atomEl = $('#gv-geographical')

let width = atomEl.getBoundingClientRect().width;
let height = width;

let svg = d3.select('#gv-geographical').append('svg')
.attr('width', width)
.attr('height', height)

let seats = svg.append('g')

let borders = svg.append('g')

let dublinBorder = svg.append('g')

let highlightStrokes = svg.append('g')

let projection = d3.geoMercator()

let path = d3.geoPath()
.projection(projection)

projection.fitExtent([[0, 0], [width, height]], topojson.feature(seatsMap, seatsMap.objects['ireland-4326']));

const dublinGeo =  topojson.merge(seatsMap, seatsMap.objects['ireland-4326'].geometries.filter(f => f.properties.MAX_CON_NA.indexOf('Dublin') > -1 || f.properties.MAX_CON_NA === 'Dún Laoghaire (4)'))

const dublinFeatures = topojson.feature(seatsMap, seatsMap.objects['ireland-4326']).features.filter(f => f.properties.MAX_CON_NA.indexOf('Dublin') > -1 || f.properties.MAX_CON_NA === 'Dún Laoghaire (4)')

seats.selectAll('path')
.data(topojson.feature(seatsMap, seatsMap.objects['ireland-4326']).features)
.enter()
.append("path")
.attr("d", path)
.attr("class", d => 'constituency ' + d.properties.MAX_CON_NA)
.on('mouseover', d => {
	highlightGeoStroke(d);
	highlightCarto(d.properties.CON_ID);
	printResult(d.properties.CON_ID,name);
})
.on('mouseout', d => {
	deleteGeoHighlight()
	deleteCartoHighlight();
})
.on('mousemove', d => mousemove())

borders.append("path")
.datum(topojson.feature(seatsMap, seatsMap.objects['ireland-4326']))
.attr('d', path(topojson.mesh(seatsMap, seatsMap.objects['ireland-4326'], (a, b) => a !== b)))
.style('fill', 'none')
.attr('class', 'geo-border')
.style('pointer-events', 'none')

dublinBorder.append("path")
.datum(dublinGeo)
.attr("d", path)
.attr('class', 'dublin-border')
.style('pointer-events', 'none')


let texts = svg.append('g').selectAll("hello")
.data(topojson.feature(seatsMap, seatsMap.objects['ireland-4326']).features)
.enter()
.filter(d => d.properties.MAX_CON_NA.indexOf('Dublin') < 0 && d.properties.MAX_CON_NA.indexOf('Dún Laoghaire') < 0)
.append('text')
.attr('x',d=> path.centroid(d)[0])
.attr('y',d=>path.centroid(d)[1])
.text(d => d.properties.deputies)
.style('pointer-events', 'none')


let dublinSeats = topojson.feature(seatsMap, seatsMap.objects['ireland-4326']).features
.filter(d => d.properties.MAX_CON_NA.indexOf('Dublin') > -1 || d.properties.MAX_CON_NA.indexOf('Dún Laoghaire') > -1)
.map( s => s.properties.deputies)
.reduce((a, b) => a + b, 0)

let dublinText = svg.append('g')
.append('text')
.attr('x', projection([-5.7502727,53.3672042])[0])
.attr('y', projection([-5.7502727,53.3672042])[1])
.text(dublinSeats)

let paths = [

{"from":[-5.8,53.4], "to":[-6,53.4]}
]

svg.append('g').selectAll('path')
.data(paths)
.enter()
.append('path')
.attr('class', 'dublin-line')
.attr('d', d => lngLatToArc(d, 'from', 'to', 100))


function lngLatToArc(d, sourceName, targetName, bend){

		bend = bend || 1;

		let sourceLngLat = d[sourceName],
				targetLngLat = d[targetName];

		if (targetLngLat && sourceLngLat) {
			let sourceXY = projection( sourceLngLat )
			let targetXY = projection( targetLngLat );

			let sourceX = sourceXY[0]
			let sourceY = sourceXY[1];

			let targetX = targetXY[0];
			let targetY = targetXY[1];

			let dx = targetX - sourceX;
			let dy = targetY - sourceY;
			let dr = Math.sqrt(dx * dx + dy * dy)*bend;

			// To avoid a whirlpool effect, make the bend direction consistent regardless of whether the source is east or west of the target
			let west_of_source = (targetX - sourceX) < 0;
			if (west_of_source) return "M" + targetX + "," + targetY + "A" + dr + "," + dr + " 0 0,1 " + sourceX + "," + sourceY;
			return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
			
		} else {
			return "M0,0,l0,0z";
		}
	}


const deleteGeoHighlight = () => {
	highlightStrokes.selectAll('path').remove()
}

const highlightGeoStroke = (d) => {

	highlightStrokes.selectAll('path').remove()

	highlightStrokes
	.append('path')
	.datum(d)
	.attr("d", path)
	.attr('class', 'highlighted')
}


const highlightGeo = (ref) => {
	let feature = topojson.feature(seatsMap, seatsMap.objects['ireland-4326']).features.find(f => f.properties.CON_ID === ref);

	highlightGeoStroke(feature)
}

export { highlightGeo, deleteGeoHighlight};