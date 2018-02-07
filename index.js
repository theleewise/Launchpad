/*
	- Create new package.json
	- Create folder structure
	- Download default node modules
*/

var fs = require('fs');
var prompt = require('prompt');
var bitbucket = require('bitbucket-rest'); 
var simpleGit = require('simple-git');
var ncp = require('ncp').ncp;

var explitives = ["fuck","hell","shit","fuckin"];
var affirmatives = ["yeah","yea","yes","yup","y","fuckyeah","fuckyea","fuckyes","fuckyup","fucky","shityeah","shityea","shityes","shityup","shity","hellyeah","hellyea","hellyes","hellyup","helly","fuck yeah","fuck yea","fuck yes","fuck yup","fuck y","shit yeah","shit yea","shit yes","shit yup","shit y","hell yeah","hell yea","hell yes","hell yup","hell y"];
var negatives = ["naw","na","no","nope","n","fucknaw","fuckna","fuckno","fucknope","fuckn","shitnaw","shitna","shitno","shitnope","shitn","hellnaw","hellna","hellno","hellnope","helln","fuck naw","fuck na","fuck no","fuck nope","fuck n","shit naw","shit na","shit no","shit nope","shit n","hell naw","hell na","hell no","hell nope","hell n"];
var msgColor = "\x1b[34m%s\x1b[0m";
var successColor = "\x1b[32m%s\x1b[0m";
var errColor = "\x1b[31m%s\x1b[0m";
var errMsg = "Well now ya done fucked up!\n";
var logo = "                                                \n                   `.-                          \n                 .NMMMs      `ys/.              \n                 -MMMMMs    +NMMMM-             \n         :s/`    :MMMMMMdhydMMMMMm              \n       .hMMMMmsodMMMMMMMMMMMMMMMMo              \n        oMMMMMMMMMMMMMMMMMMMMMMMMMh:/oydNo      \n         :NMMMMMMMms/-````-/smMMMMMMMMMMMMs     \n         `dMMMMMd:            :hMMMMMMMMNo`     \n   `-:/+odMMMMMo                +MMMMMN+`       \n   /MMMMMMMMMMs                  sMMMMM-        \n   oMMMMMMMMMM.                  .MMMMMmy+:`    \n    `-/sdMMMMM-                  .MMMMMMMMMMy   \n        .MMMMMy                  sMMMMMMMMMMo   \n       .sMMMMMMo                oMMMMMho+/:-`   \n     .yMMMMMMMMMd:            :dMMMMMh          \n     sMMMMMMMMMMMMNy+-.``.-+yNMMMMMMMN:         \n      odyo/--yMMMMMMMMMMMMMMMMMMMMMMMMMs        \n              mMMMMMMMMMMMMMMMNh+sdMMMMh.       \n             -MMMMMNssydMMMMMM-    `/s:         \n             oMMMMh.    yMMMMM.                 \n              ./s/       hMMMN`                 \n                          -.`                   \n                                                \n";

// var config = JSON.parse(fs.readFileSync("launchpad.config.json"));
var config = require('./launchpad.config.js');


var start =  {
	description: 'Do you want me to start this shit?',
	type: 'string',
	default: 'fuckyea',
	required: true,
	responses:{
		affirmative:'Damn Straight! Lets get this mother fucker going...',
		negative:'The fuck you doing here then?'
	}
}

var questions = {
	name: {
		description: 'What do you want to call this piece of shit?',
		type: 'string',
		required: true
	},
	cms: {
		description: 'Are you gonna be a lazy piece of shit and use a CMS?',
		type: 'string',
		default: 'yes',
		required: true,
		responses:{
			affirmative:'I fucking knew it',
			negative:'Watch Out! We got a bad ass over here.'
		},
		conform: function (cms) {
			showResponse(questions.cms.responses, cms);
			return true;
      	}
	},
	dnn: {
		description: 'Is this gonna be a shitty theme for DNN?',
		type: 'string',
		default: 'yes',
		required: true,
		responses:{
			affirmative:'Shoulda gone with Drupal',
			negative:'Thank God! I can\'t believe people still use that shit.'
		},
		ask: function() {
          return didYaSayYes(prompt.history('cms').value) == true;
        },
		conform: function (dnn) {
			showResponse(questions.dnn.responses, dnn);
        	return true;
      	}
	},
	useTemplate: {
		description: 'You gonna use a template?',
		type: 'string',
		default: 'shit yea',
		required: true,
		responses:{
			affirmative:'You un-original mother fucker',
			negative:'What, you think that makes you better than me?'
		},
		conform: function (useTemplate) {
			showResponse(questions.useTemplate.responses, useTemplate);
        	return true;
      	}
	},
	remoteRepo: {
		description: 'Do you want to create a remote repo?',
		type: 'string',
		default: 'yes',
		required: true,
		responses:{
			negative:'Fine, see if I give a fuck. But don\'t come to me when you have a major cock up.'
		}/*,
		conform: function (remoteRepo) {
			showResponse(questions.remoteRepo.responses, remoteRepo);
        	return true;
      	}*/
	}/*,
	bbUser: {
		description: 'What\'s your damn BitBucket Username / Email address?',
		type: 'string',
		required: true,
		ask: function() {
          return didYaSayYes(prompt.history('remoteRepo').value) == true;
        }
	},
	bbPass: {
		description: 'The fuck is your password?',
		type: 'string',
		required: true,
		hidden: true,
		replace: '*',
		ask: function() {
          return didYaSayYes(prompt.history('remoteRepo').value) == true;
        }
	}*/
}





// Show Logo
console.log('\x1b[34m%s\x1b[0m', logo);

prompt.start();
prompt.get(start, function(err,result){
	showResponse(start.responses,result.question);
	if( didYaSayYes(result.question) ){
		var schema = { properties: questions }
		prompt.get(schema, function(err,result){

			// Make Final Dir for all this stuff
			if (!fs.existsSync(config.dirNames.final)) {
				fs.mkdirSync(config.dirNames.final);
			}

			config.dirNames.final += '/'+cleanString(result.name);

			if (!fs.existsSync(config.dirNames.final)) {
				fs.mkdirSync(config.dirNames.final);
			}

			// NO CMS
			if(!didYaSayYes(result.cms)){
				
				// Use CSS Template
				if(didYaSayYes(result.useTemplate)){					
					cssTemplate();
				}

				// Create Directories
				else {
					createDirs();
				}
			}

			// CMS - DNN
			else if(didYaSayYes(result.dnn)){
				newDNNSkin(result);
			}

			// Repo
			if(didYaSayYes(result.remoteRepo)){
				createRepo(config.bitbucketUsername, config.bitbucketPassword, result.name,function(test){
					console.log(test);
				});
			}

			console.log( successColor, 'All done. Now fuck off.');

		});
	}
});






/*------------------------------------*\
	#CSSTEMPLATE
\*------------------------------------*/

function cssTemplate(path){
	var path = ( typeof path != 'undefined') ? path : config.dirNames.final;

	// Clone CSS Starter Repo
	console.log(msgColor, 'Cloning Starter CSS');
	simpleGit().silent(true).clone(config.cssStarterRepo, path, function(err,data){
		if(err === null){
			console.log(successColor, 'Cloned');
			// TO DO - remove git folder & files for template repo
		} else {
			console.log(errColor, errMsg+err);
		}
	});
}





/*------------------------------------*\
	#DNN
\*------------------------------------*/

function newDNNSkin(result){

	var nameSanitized = cleanString(result.name);

	// Directory Name (removes specials charaters and spaces)
	var dirName = result.name.replace(/[^0-9a-zA-Z ]/g,"").trim().replace(/\s/g,"");
	var dir = config.dirNames.final+'/Portals/_default';
	
	// Create directory tree
	fs.mkdirSync(config.dirNames.final+'/Portals/');
	fs.mkdirSync(config.dirNames.final+'/Portals/_default/');


	if ( didYaSayYes(result.useTemplate) ){

		// Copy DNN Template
		ncp('./_templates/dnn/', config.dirNames.final+'/Portals/_default/', function (err) {
			if (err) {
				return console.error(err);
			}

			// Rename Theme Directories
			fs.rename( dir+'/'+config.dirNames.dnnThemes+'/Theme-Name', dir+'/'+config.dirNames.dnnThemes+'/'+dirName );
			fs.rename( dir+'/'+config.dirNames.dnnContainers+'/Theme-Name', dir+'/'+config.dirNames.dnnContainers+'/'+dirName );
			
			// Loop through directories & files
			var walk = function (dir, done) {
				fs.readdir(dir, function (error, list) {
				    if (error) {
				        return done(error);
				    }

				    var i = 0;

				    (function next () {
				        var file = list[i++];

				        if (!file) {
				            return done(null);
				        }
				        
				        file = dir + '/' + file;
				        
				        fs.stat(file, function (error, stat) {
				    
				            if (stat && stat.isDirectory()) {
				                walk(file, function (error) {
				                    next();
				                });
				            } else {
				                // Open file and replace token with sanitized project name
				                replaceTokens( file, /(\[Theme-Name\])/g, nameSanitized);
				                next();
				            }
				        });
				    })();
				});
			};

			walk(dir, function(error) {
				if (error) {
					throw error;
				}
			});

		});
		


	} else {
		fs.mkdirSync(config.dirNames.final+'/Portals/_default/'+config.dirNames.dnnThemes);
		fs.mkdirSync(config.dirNames.final+'/Portals/_default/'+config.dirNames.dnnContainers);
		fs.mkdirSync(config.dirNames.final+'/Portals/_default/'+config.dirNames.dnnThemes+'/'+dirName);
		fs.mkdirSync(config.dirNames.final+'/Portals/_default/'+config.dirNames.dnnContainers+'/'+dirName);
		fs.mkdirSync(config.dirNames.final+'/Portals/_default/'+config.dirNames.dnnThemes+'/'+dirName);
	}


	// Create package.json
	// TO DO
	// packageFile(name, './'+config.dirNames.final+'/'+config.dirNames.dnnThemes+'/'+dirName);
}





/*------------------------------------*\
	#CREATEREPO
\*------------------------------------*/

function createRepo(user,pass,name,callback){
	var nameSanitized = cleanString(name);
	var client = bitbucket.connectClient({username : user, password : pass});
	var repoSettings = config.repoSettings;
	repoSettings.repo_slug = nameSanitized;
	repoSettings.name = name;
	
	client.createRepo(config.repoSettings, function(result){

		if (result.status === 200){
			console.log(successColor, "Repo Created");
			var repoUrl = 'https://bitbucket.org/'+result.data.full_name;
			callback(repoUrl);
		} else {
			console.log(errColor, errMsg);
			console.log(result);
		}
	});

}





/*------------------------------------*\
	#SECTION
\*------------------------------------*/

function createDirs(path){
	var path = ( typeof path != 'undefined') ? path : config.dirNames.final;
	
	// TO DO
	// Check if dir exists first

	// Create directories
	fs.mkdirSync(path+'/'+config.dirNames.compiled);
	fs.mkdirSync(path+'/'+config.dirNames.compiled+'/'+config.dirNames.styles);
	fs.mkdirSync(path+'/'+config.dirNames.compiled+'/'+config.dirNames.scripts);

	fs.mkdirSync(path+'/'+config.dirNames.source);
	fs.mkdirSync(path+'/'+config.dirNames.source+'/'+config.dirNames.styles);
	fs.mkdirSync(path+'/'+config.dirNames.source+'/'+config.dirNames.scripts);
	fs.mkdirSync(path+'/'+config.dirNames.source+'/svg-sprites');
	fs.mkdirSync(path+'/'+config.dirNames.source+'/svg-shapes');
}





/*------------------------------------*\
	#TOKENS
\*------------------------------------*/

function replaceTokens(file,pattern,text){

	fs.readFile(file, 'utf8', function(err2,data) {
		if (err2) {
			return console.log(errColor, errMsg+err2);
		}

		var result = data.replace(pattern, text);

		fs.writeFile(file, result, 'utf8', function (err3) {
			if (err3) return console.log(errColor, errMsg+err2);
		});
	});
}




function onErr(err) {
	console.log(err);
	return 1;
}





/*------------------------------------*\
	#ANSWERTOBOOLEAN
\*------------------------------------*/

function didYaSayYes(answer){
	if( affirmatives.indexOf( answer.replace(/\s/g,"") ) > -1 ){
		return true;
	} else if( negatives.indexOf( answer.replace(/\s/g,"") ) > -1 ){
		return false;
	}
	return null;
}





/*------------------------------------*\
	#SHOWRESPONSE
\*------------------------------------*/

function showResponse(responses,result){
	if(responses !== undefined){
		if(responses.affirmative !== undefined && didYaSayYes(result) ){
			console.log(responses.affirmative);
		} else if (responses.negative !== undefined && !didYaSayYes(result) ) {
			console.log(responses.negative);
		}
	}

}





/*------------------------------------*\
	#CLEANSTRING
\*------------------------------------*/

function cleanString(str){
	return str.toLowerCase().replace(/[^0-9a-zA-Z ]/g,"").trim().replace(/\s/g,"-");
}






















function packageFile(name,path){
	var path = ( typeof path != 'undefined') ? path : config.dirNames.final;
	var nameSanitized = cleanString(name);
	
	// Open package.json file to copy and change
	fs.readFileSync('./files/package.json', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}

		// Search file & replace [NAME] token with sanitized project named
		var result = data.replace(/(\[NAME\])/g, nameSanitized).replace(/(\[AUTHOR\])/g, config.author);

		// TO DO
		// inserting remote repo url or remove that portion from file
		/*
		if( affirmatives.indexOf(result.remoteRepo) > -1 ){
			result = result.replace(/(\[REPOURL\])/g, 'PUTSOMETHINGHERE');
		} else {
			// Remove "repository" property from package.json
			result = result.replace(\,(\s|\n)+?(\"repository"\: \{)(.|\n)+?(\}), '');
		}
		*/

		fs.writeFile(path+'/package.json', result, 'utf8', function (err) {
			if (err) return console.log(err);
		});

	});

}