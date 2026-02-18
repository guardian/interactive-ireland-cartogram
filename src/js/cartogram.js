import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as topojson from 'topojson'

//import seatsMap from '../assets/ireland-hex-4326.json'
import seatsMap from '../assets/ireland-2017-seats-hex.json'
//import constituenciesMap from '../assets/ireland-constituencies-hex.json'
import constituenciesMap from '../assets/ireland-2017-constituencies-hex.json'
import dublinBorderMap from '../assets/dublin-border.json'
import { $ } from "./util"
import { $$ } from "./util"

import { highlightGeo, deleteGeoHighlight } from './geographical.js'

// d3-geo-projection removed; geoIdentity is in d3-geo (included in main d3 bundle)
const d3 = Object.assign({}, d3B, d3Select)

let results;

const parties = ["FF","FG","IO","LAB","SF","Green","SD"];

let isMobile = window.matchMedia('(max-width: 400px)').matches;

const atomEl = $('#gv-cartogram')

let width = atomEl.getBoundingClientRect().width;
let height = width;

d3.select('.tooltip').style('width', width)

let svg = d3.select('#gv-cartogram').append('svg')
  .attr('width', width)
  .attr('height', height);

let seats = svg.append('g');
let constituencies = svg.append('g');
let dublin = svg.append('g');
let highlightStrokes = svg.append('g');

let tooltip = d3.select(".tooltip")

let projection = d3.geoIdentity()
  .reflectY(true);

let path = d3.geoPath().projection(projection)

// Fit the cartogram to your SVG the same way as before
projection.fitExtent(
  [[0, 0], [width, height]],
  topojson.feature(seatsMap, seatsMap.objects['ireland-2017-seats-hex'])
);

export default (data) => {

  seats.selectAll('path')
    .data(topojson.feature(seatsMap, seatsMap.objects['ireland-2017-seats-hex']).features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", d => 's' + d.properties.con_id + '_' + d.properties.seat_id)
    .attr('fill', '#f6f6f6')

  results = data.sheets.results;

  results.map(constituency => {
    for (let i = 1; i <= 5; i++) {
      let partyRaw = constituency['party_' + i];
      let party = parties.indexOf(partyRaw) > -1 ? partyRaw : 'Others';
      let seat = svg.select('#s' + constituency.con_id + '_' + i)
      seat.attr('class', party)
    }
  })

  constituencies.selectAll("path")
    .data(topojson.feature(constituenciesMap, constituenciesMap.objects['ireland-2017-constituencies-hex']).features)
    .enter()
    .append('path')
    .attr('id', d => 'c' + d.properties.con_id)
    .attr('class', 'constituency-hex')
    .attr("d", path)
    .on('mouseover', d => {
      printResult(d.properties.con_id);
      highlightCartoStroke(d)
      highlightGeo(d.properties.con_id)
    })
    .on('mouseout', d => {
      cleanResult();
      deleteCartoHighlight();
      deleteGeoHighlight();
    })
    .on('mousemove', d => mousemove('carto', d.properties.con_id))

  dublin.append('path')
    .datum(topojson.feature(dublinBorderMap, dublinBorderMap.objects['dublin-border']))
    .attr("d", path)
    .attr('fill', 'none')
    .style('stroke', '#333333')
    .style('stroke-width', 4 + 'px');
}

const printResult = (id) => {
  cleanResult()

  let result = results.find(constituency => constituency.con_id === id);

  if (result) {
    d3.select('.tooltip-constituency').html(result.con_name);

    for (let i = 1; i <= 5; i++) {
      if (result['party_' + i]) {
        let partyRaw = result['party_' + i];
        let party = parties.indexOf(partyRaw) > -1 ? partyRaw : 'Others';
        let percentage = result['percentage_' + i];

        let row = tooltip.select('.tooltip-results')
          .append('div')
          .attr('class', 'tooltip-row')

        row.append('div')
          .attr('id', 'tooltip-color')
          .attr('class', party)

        row.append('div')
          .attr('class', 'tooltip-party')
          .html(partyRaw)

        row.append('div')
          .attr('class', 'tooltip-deputies')
          .html(percentage)
      }
    }

    tooltip.classed(" over", true);
  }
}

const mousemove = (env, id) => {
  if (env != 'dropdown') {
    let here = d3.mouse(d3.select('.interactive-wrapper').node());
    let left = here[0];
    let top = here[1];
    let tHeight = $('.tooltip').getBoundingClientRect().height;
    let tWidth = $('.tooltip').getBoundingClientRect().width

    if (!isMobile) {
      let posY = (top * tHeight) / height
      tooltip.style('top', posY + 'px');

      if (env == 'carto') {
        tooltip.style('left', (left - tWidth) - 20 + 'px')
      } else {
        tooltip.style('left', left + 40 + 'px')
      }
    } else {
      if (env == 'carto') {
        tooltip.style('top', top - tHeight - 40 + 'px')
      } else {
        tooltip.style('top', top + 20 + 'px')
      }
    }
  } else {
    tooltip.style('top', $$('.gv-dropdown-menu').clientHeight)
    tooltip.style('left', 0 + 'px')
  }
}

function cleanResult() {
  tooltip.classed(" over", false)
  tooltip.select('.tooltip-results').html('')
}

const deleteCartoHighlight = () => {
  highlightStrokes.selectAll('path').remove()
}

const highlightCartoStroke = (d) => {
  highlightStrokes.selectAll('path').remove()

  highlightStrokes
    .append('path')
    .datum(d)
    .attr("d", path)
    .attr('class', 'carto-highlighted')
}

const highlightCarto = (ref) => {
  let feature = topojson.feature(constituenciesMap, constituenciesMap.objects['ireland-2017-constituencies-hex'])
    .features.find(f => f.properties.con_id === ref);

  if (feature) highlightCartoStroke(feature)
}

window.onscroll = () => {
  cleanResult();
}

export { highlightCarto, deleteCartoHighlight, mousemove, printResult, cleanResult };
