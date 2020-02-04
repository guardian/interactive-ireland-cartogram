
import cartogram from './cartogram.js'
import geographical from './geographical.js'
import loadJson from '../components/load-json'

loadJson('https://interactive.guim.co.uk/docsdata-test/18lIPHjQVSoLRqRstoPkh60MyibOBpbs8M0LyqKPgWXI.json')
.then( fileRaw => {


	cartogram(fileRaw)
	geographical(fileRaw)

	window.resize();
})
