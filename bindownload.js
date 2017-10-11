var fs = require("fs");
var request = require('request');
var unzip = require("./unzip");
module.exports = function(url, fileName, tname, odir, onDone) {
	console.log("Downloading "+url);
	if (!fs.existsSync(tname)) {
		var oss = fs.createWriteStream(tname);
		request(url).pipe(oss);
		var dn = false;
		oss.on("close", function() {
			if (dn) return; dn = true;
			doExtract();
		});
		oss.on("error", function(err) {
			if (dn) return; dn = true;
			try {oss.close();} catch(e) {}			
			try { fs.unlinkSync(tname); } catch(e) {};
			onDone(err);
		});
	} else {
		doExtract();
	}
	function doExtract() 
	{
		console.log("Extracting...");
		unzip(tname,odir,function(res) {
			if (res < 0) {
				try { fs.unlinkSync(tname); } catch(e) {};
			}
			onDone(res);
		});
	}
};
