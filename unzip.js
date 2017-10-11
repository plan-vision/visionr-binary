var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var StreamZip = require('node-stream-zip');

module.exports = function(file,odir,onDone) 
{
	var zip = new StreamZip({
		file : file,
		storeEntries : true
	});
	zip.on('error', function(err) {
		if (zip.errd) return; zip.errd = 1;
		try { zip.close(); } catch (e) { console.error(e); }
		console.error("Error reading from zip file " + file + " : " + err);
		onDone(-1);
	});
	zip.on("ready", function() 
	{
		var x = zip.entries();
		for (var i in x) 
		{
			if (fs.existsSync(odir+"/"+i)) {
				var ss = fs.lstatSync(odir+"/"+i);
				if (ss.isSymbolicLink()) {
					console.error("Overriding symbolic links NOT ALLOWED because of possible file damage!");
					return onDone(-1);
				}
			}
			if (x[i].isDirectory) 
				mkdirp.sync(odir+"/"+i);
		}
		zip.extract(null, odir, function(err, count) 
		{
			if (err) 
			{
				if (zip.errd) return; zip.errd = 1;
				console.error("Error reading from zip file " + file + " : " + err);
				try { zip.close(); } catch (e) { console.error(e); }
				return onDone(-1);
			}
			console.warn('Extracted ' + count + ' entries from ' + file + ' to ' + odir);
			try { zip.close(); } catch (e) { console.error(e); }
			onDone(0);
		});
	});
};