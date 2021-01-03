const EventEmitter = require("events").EventEmitter;
const utils = require("util")


const cssparser = require("../httrack/cssparser");
const downloader = require("../httrack/download");
const htmlparser = require("../httrack/htmlparser");
const httrack = require("../httrack/httrack");
/**
 * 
 * @return {httrack}
 */
exports.inspectPage = async function(options){
    let project = new httrack(options.url);
    await project.downloadPage();
    return project;
}
exports.methods = {};
exports.methods.inspectPage = function(){
    let _response = null;
    let _end = null;
    this.response = (e) => _response = e;
    this.end = (e) => _end = e;
    this.request = async function(url){
        let project = new httrack(url);
        if(await project.inspectPage(log=>{
            _response(log)
        })){
            _response(
                Object.assign(Object.assign({},project.scanPaths),project.downloadFiles)
            );
        }
        _end();
    };
}   