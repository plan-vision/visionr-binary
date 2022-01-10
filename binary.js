var fs = require("fs");
var os = require("os");

var bindownload = require("./bindownload.js");
var mkdirp = require("mkdirp");
exports.bindownload = bindownload;
exports.installJREBin = installJREBin;
exports.installLibreOfficeBin = installLibreOfficeBin;
exports.downloadServerBinary = downloadServerBinary;
exports.extractZIP = require("./unzip");

function installJREBin(onDone,root) {
	var homedir = root || (require("homedir")()+"/.visionr");
	if (fs.existsSync(homedir + "/jre"))
		return onDone(homedir + "/jre");
	var platform = os.platform();
	var arch = os.arch();
	console.log("Searching for OS specific jre distribition in visionr-binary");
	var found = null;
	
	var vrbinaries = require("./index");
	
	for (var e of vrbinaries.jre) {
		if (e.platform == platform && (!e.arch || e.arch == arch)) {
			found = e;
			break;
		} }
	if (!found) {
		console.error("Unable to find binary java distribution for platform=" + platform + " arch=" + arch);
		console.log("Possible candidates : ");
		console.log(vrbinaries.jre);
		return onDone(-1);
	}
	console.log("Downloading binary java installation with version : " + e.version);
	var tname;
	if (root) {
		if (!fs.existsSync(homedir+"/.visionr"))
			fs.mkdirSync(homedir+"/.visionr");
		tname = homedir + "/.visionr/" + found.file;
	} else {
		if (!fs.existsSync(homedir))
			fs.mkdirSync(homedir);
		tname = homedir + "/" + found.file;
	}
	bindownload(found.url, found.file, tname, homedir, function() {
		/* since version 17 direct openjdk download and no different jre distribution */
		setTimeout(function(){
			if (found.version >= "17.") 
				fs.renameSync(homedir + "/jdk-"+found.version, homedir + "/jre");
			onDone(homedir + "/jre");
		},0); // wait file close
	});
}

function installLibreOfficeBin(onDone,root) {
	var homedir = root || (require("homedir")()+"/.visionr");
	if (fs.existsSync(homedir + "/libreoffice"))
		return onDone(homedir + "/libreoffice");
	var platform = os.platform();
	var arch = os.arch();
	console.log("Searching for OS specific libreoffice distribition in visionr-binary");
	var found = null;
	var vrbinaries = require("./index");
	for (var e of vrbinaries.libreoffice) {
		if (e.platform == platform && (!e.arch || e.arch == arch)) {
			found = e;
			break;
		} }
	if (!found) {
		console.error("Unable to find binary LibreOffice distribution for platform=" + platform + " arch=" + arch);
		console.info("Possible candidates : ");
		console.log(vrbinaries.libreoffice);
		return onDone(-1);
	}
	console.log("Downloading binary LibreOffice installation with version : " + e.version);
	if (!fs.existsSync(homedir))
		fs.mkdirSync(homedir);
	
	var tname;
	if (root) {
		if (!fs.existsSync(homedir+"/.visionr"))
			fs.mkdirSync(homedir+"/.visionr");
		tname = homedir + "/.visionr/" + found.file;
	} else {
		if (!fs.existsSync(homedir))
			fs.mkdirSync(homedir);
		tname = homedir + "/" + found.file;
	}
	bindownload(found.url, found.file, tname, homedir, function() {
		onDone(homedir + "/libreoffice");
	});
}

function downloadServerBinary(serverDir,file, url, version, onDone,root) {
	var homedir = root || (require("homedir")()+"/.visionr");
	console.log("Downloading binary server installation with version : " + version);
	var tname;
	if (root) {
		if (!fs.existsSync(homedir+"/.visionr"))
			fs.mkdirSync(homedir+"/.visionr");
		tname = homedir + "/.visionr/" + file;
	} else {
		if (!fs.existsSync(homedir))
			fs.mkdirSync(homedir);
		tname = homedir + "/" + file;
	}
	var tdir = serverDir;
	mkdirp.sync(tdir);
	bindownload(url, file, tname, tdir, function() {
		onDone(tdir);
	});
}

 
