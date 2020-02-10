
import cartogram from './cartogram.js'
import geographical from './geographical.js'
import loadJson from '../components/load-json'
import { $ } from "./util"
import { $$ } from "./util"
import { highlightGeo } from './geographical.js'
import { highlightCarto, printResult, mousemove } from './cartogram.js'

loadJson('https://interactive.guim.co.uk/docsdata-test/18lIPHjQVSoLRqRstoPkh60MyibOBpbs8M0LyqKPgWXI.json')
.then( fileRaw => {

	$('.gv-chart-title').innerHTML = fileRaw.sheets.furniture.find( f => f.div === 'heading').text
	$('.gv-chart-standfirst').innerHTML = fileRaw.sheets.furniture.find( f => f.div === 'standfirst').text
	$('.gv-source').innerHTML = fileRaw.sheets.furniture.find( f => f.div === 'source').text

	let gvOption =`<option selected="selected">Jump to a county</option>`

	fileRaw.sheets.results.map(r => {
		let entry = `<option class='option' value="${r.con_id}">${r.con_name}</option>`;
		gvOption += entry;
	})
	
	$(".gv-county-filter").innerHTML = gvOption;

	$(".gv-county-filter").addEventListener('change', handleOptionSelected)

	const dropdownOptions = document.querySelectorAll('.gv-dropdown-menu .option');

	function handleOptionSelected(event)
	{

		
		const el = $$('.gv-dropdown-menu .option')
		.find( option => option.selected )

		printResult(el.value)
		highlightCarto(el.value)
		highlightGeo(el.value)
		mousemove('dropdown', el.value)

	}

	fileRaw.sheets.furniture.find( f => console.log(f.div))
	cartogram(fileRaw);
	geographical();

	window.resize();
})
