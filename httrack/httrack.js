const {downloadData,downloadFile, saveFile} = require("./download");
const path = require("path");
const fs = require("fs");
const htmlparser = require("./htmlparser");
const cssparser = require("./cssparser");
const { Worker,isMainThread,workerData } = require("worker_threads");

function Project(url){
    this.url = new URL(url);
    this.scannedPaths = {};
    this.scanPaths = {};
    this.downloadedFiles = {};
    this.downloadFiles = {};
    this.redirected = {};
    this.errors = {};
    this.projectDir = path.resolve(__dirname+"/../projects/"+safeName(this.url.origin));
    this.log = null;
    this.logFile = this.projectDir+"/filelist.log";

    this.scanPaths[this.url.toString()] = new Page(this.url,this);
};
Project.prototype.load = async function(log)
{
    var t = this.projectDir+"/filelist.log",project = this;
    await new Promise(ok => {
        fs.exists(t,(exists)=>{
            ok(exists)
        })
    }) && await new Promise(ok => {
        log("Loading last session");
        fs.readFile(t,"utf8",async (err,logx)=>{
            if(err) return ok();
            var files = logx.split('\n\n');
            var _pr = 0,_ins = 0,_down = 0;
            for(let path of files)
            {
                var t = path.split('\n');
                if(t.length == 1) break;
                var k = false;
                if(t[3] == "STORAGED") k = true;
                var linkObject,i;
                if(t[0] == "PARSE"){
                    linkObject = k ? this.scannedPaths : this.scanPaths;
                    if(k) _pr++;
                    i = Css;
                }else if(t[0] == "INSPECT"){
                    linkObject = k ? this.scannedPaths : this.scanPaths;
                    if(k) _ins++;
                    i = Page;
                }else if(t[0] == "DOWNLOAD"){
                    linkObject = k ? this.downloadedFiles : this.downloadFiles;
                    if(k) _down++;
                    i = File;
                };
                var e = linkObject[
                    t[2]
                ] = new i;
                e.path = t[1];
                e.downloaded = k;
                try{
                    e.url = new URL(t[2]);
                }catch(i){
                   console.log("Böyle url mi olur la\n",t[0],"\n",t[1],"\n",t[2],"\n",t[3]);
                   debugger;
                   throw i;
                };
                e.project = project;
            };
            if(_pr != 0) log(_pr+" stylesheet already parsed");
            if(_ins != 0) log(_ins+" page already inspected");
            if(_down != 0) log(_down+" file already downloaded");
            
            ok();
        })
    })
};

Project.prototype.savePoint = async function(appendt)
{
    await createUnexistsDir(this.projectDir);
    this.log = fs.createWriteStream(this.logFile,{flags:appendt?"a":"w"});
};
Project.prototype.saveEnd = async function()
{
    await new Promise(ok => {
        this.log.end(()=>{
            ok()
        })
    })
};
Project.prototype.allSave = async function()
{
    await new Promise((ok,rej)=>{
        new Worker(__filename,{
            workerData:this
        }).on("message",()=>{

        }).on("exit",()=>{
            ok()
        }).on("error",(err)=>{
            throw err;
        })
    })
};
(async function(){
    if(!isMainThread)
    {
        await createUnexistsDir(workerData.projectDir);
        var log = fs.createWriteStream(workerData.logFile);
        for(var g in workerData.scannedPaths) Project.addSave(log,g,workerData.scannedPaths[g]);
        for(var g in workerData.scanPaths) Project.addSave(log,g,workerData.scanPaths[g]);
        for(var g in workerData.downloadedFiles) Project.addSave(log,g,workerData.downloadedFiles[g]);
        for(var g in workerData.downloadFiles) Project.addSave(log,g,workerData.downloadFiles[g]);
        log.close();
    }
})()


Project.prototype.addSave = function(obj)
{
    var ins;
    if(obj instanceof Page)
    {
        ins = "INSPECT\n";
    }else if(obj instanceof Css){
        ins = "PARSE\n";
    }else if(obj instanceof File){
        ins = "DOWNLOAD\n";
    }
    this.log.write(ins);
    this.log.write(obj.path+"\n");
    this.log.write(obj.url.toString()+"\n");
    this.log.write(obj.downloaded?"STORAGED":"NO-STORAGE");
    this.log.write("\n\n");
}
Project.addSave = function(file,url,obj)
{
    var ins;
    if(obj.type == "Page")
    {
        ins = "INSPECT\n";
    }else if(obj.type == "Css"){
        ins = "PARSE\n";
    }else if(obj.type == "File"){
        ins = "DOWNLOAD\n";
    }
    file.write(ins);
    file.write(obj.path+"\n");
    file.write(url+"\n");
    file.write(obj.downloaded?"STORAGED":"NO-STORAGE");
    file.write("\n\n");
}

/**
 * @returns {Page}
 */
Project.allPages = [];
Project.prototype.nextScanPage = function()
{
    var res = null;
    if(Project.allPages.length == 0)
    {
        for(var page in this.scanPaths)
        {
            if(this.scanPaths[page] instanceof Page)
            {
                Project.allPages.push(this.scanPaths[page]);
            }
        }
    };
    res = Project.allPages.pop();
    if(!res) return;
    res.scanned = true;
    res.downloaded = true;
    delete this.scanPaths[res.url.toString()];
    return this.scannedPaths[res.url.toString()] = res;
}
/**
 * @returns {Css}
 */
Project.allCss = [];
Project.prototype.nextScanCss = function()
{
    var res = null;
    if(Project.allCss.length == 0)
    {
        for(var css in this.scanPaths)
        {
            if(this.scanPaths[css] instanceof Css)
            {
                Project.allCss.push(this.scanPaths[css])
            }
        }
    }
    res = Project.allCss.pop();
    if(!res) return;
    res.scanned = true;
    res.downloaded = true;
    delete this.scanPaths[res.url.toString()];
    return this.scannedPaths[res.url.toString()] = res;
}
/**
 * @returns {File}
 */
Project.allFiles = [];
Project.prototype.nextDownloadFile = function()
{
    var res = null;
    if(Project.allFiles.length == 0)
    {
        for(var file in this.downloadFiles)
        {
            if(this.downloadFiles[file] instanceof File)
            {
                Project.allFiles.push(this.downloadFiles[file]);
            }
        }
    };
    res = Project.allFiles.pop();
    if(!res) return;
    res.downloaded = true;
    delete this.downloadFiles[res.url.toString()];
    return this.downloadedFiles[res.url.toString()] = res;
};

Project.prototype.sendStatus = function(f)
{
    var total = Object.keys(this.downloadedFiles).length+Object.keys(this.scannedPaths).length;
    var remain = Object.keys(this.downloadFiles).length+Object.keys(this.scanPaths).length;
    f(total,remain);
}
Project.prototype.inspectPage = async function(step)
{
    let page = this.nextScanPage();
    var htmlContent = await downloadData(page.url,null,step);
    if(!htmlContent){
        return false;
    }
    step("Ayıklanıyor...");
    await htmlparser(htmlContent.toString("utf8"),page);
    return true;
}
Project.prototype.downloadPage = async function()
{
    let page = this.nextScanPage();
    var htmlContent = await downloadData(page.url);
    if(!htmlContent) return true;
    var newContent = await htmlparser(htmlContent.toString("utf8"),page);
    await saveFile(newContent,page.path);
}
Project.prototype.nextJob = async function(log,stat)
{
    var end = false;
    var maxtr = 0;
    var css,file,page,str;
    while(file = this.nextDownloadFile())
    {
        log("Downloading File : "+file.url);
        try{
            await downloadFile(file.url,null,file.path);
        }catch(i){
            continue;
        };
        end = true;
        if(maxtr++ >= 20){maxtr=0;break};
    }
    while(css = this.nextScanCss())
    {
        var cssContent = await downloadData(css.url);
        if(!cssContent) continue;
        log("Parsing css File : "+css.url);
        var newContent = cssparser(cssContent.toString("utf8"),(a,b)=> css[a](b));
        await saveFile(newContent,css.path);
        end = true;
        if(maxtr++ >= 20){maxtr=0;break};
    } 
    while(page = this.nextScanPage())
    {
        var htmlContent = await downloadData(page.url);
        if(!htmlContent) return true;
        log("Parsing Page : "+page.url);
        var newContent = await htmlparser(htmlContent.toString("utf8"),page);
        await saveFile(newContent,page.path);
        end = true;
        if(maxtr++ >= 20){maxtr=0;break};
    };
    return end
}

function Page(url,project)
{
    this.type = 'Page';
    this.url = url;
    this.downloaded = false;
    this.scanned = false;
    this.dir = "";
    this.path = "";
    this.project = null;
    this.referrer = null;

    if(url)
    {
        this.dir = project.projectDir;
        var _path = project.projectDir + project.url.pathname;
        if(_path.endsWith("/"))
        {
            _path += "index.html";
        }
        if(_path.split('/').slice(-1).indexOf('.') != -1)
        {
            _path += ".html";
        }
        this.path = _path;
        this.project = project;
    }
};
function Css(url)
{
    this.type = 'Css';
    this.url = url;
    this.downloaded = false;
    this.scanned = false;
    this.dir = "";
    this.path = "";
    this.project = null;
    this.referrer = null;
}
function File(url)
{
    this.type = 'File';
    this.url = url;
    this.downloaded = false;
    this.dir = "";
    this.path = "";
    this.project = null;
    this.referrer = null;
}


Project.prototype.isThere = function(url)
{
    var t = new URL(url,this.url).toString();
    return (
        this.scannedPaths[t] ||
        this.scanPaths[t] || 
        this.downloadedFiles[t] ||
        this.downloadFiles[t] ||
        this.redirected[t] ||
        this.errors[t]
    )
}
Project.prototype.isOrigin = function(url)
{
    var t = new URL(url,this.url);
    return t.origin == this.url.origin;
}
function _debug(arr)
{
    var t = /undefined/;
    arr.map((i)=>{
        if(t.test(i)) debugger;
    })
}
Page.prototype.addFile = function(url){
    var absoluteURL = new URL(url,this.url),
    absolutePath,absolutePath2,relativePath;
    absoluteURL.hash = "";
    if(absoluteURL.origin == this.url.origin)
    {
        absolutePath = this.project.projectDir + absoluteURL.pathname;
    }else{
        absolutePath = this.project.projectDir+"/"+safeName(absoluteURL.host) + absoluteURL.pathname;
    };
    if(absolutePath.endsWith("/"))
    {
        absolutePath += "index.html";
    }
    if(absolutePath.split('/').slice(-1).join('').indexOf('.') == -1)
    {
        absolutePath += ".html";
    }
    relativePath = path.relative(path.dirname(this.path),absolutePath.toString())
    if(relativePath == '') relativePath = '.';
    var file = new File(absoluteURL);
    file.project = this.project;
    file.dir = path.dirname(absolutePath);
    file.path = absolutePath;
    file.referrer = this;
    if(!this.project.isThere(absoluteURL))
    {
        this.project.downloadFiles[absoluteURL.toString()] = file;
        //this.project.addSave(file);
    }
    _debug([
        file.url,
        file.path,
        file.dir
    ])
    return relativePath;
}
Page.prototype.addCss = function(url){
    var absoluteURL = new URL(url,this.url),
    absolutePath,absolutePath2,relativePath;
    absoluteURL.hash = "";
    if(absoluteURL.origin == this.url.origin)
    {
        absolutePath = this.project.projectDir + absoluteURL.pathname;
    }else{
        absolutePath = this.project.projectDir+"/"+safeName(absoluteURL.host) + absoluteURL.pathname;
    };
    relativePath = path.relative(path.dirname(this.path),absolutePath.toString())
    if(relativePath == '') relativePath = '.';
    var file = new Css(absoluteURL);;
    file.project = this.project;
    file.dir = path.dirname(absolutePath);
    file.path = absolutePath;
    file.referrer = this;
    if(!this.project.isThere(absoluteURL))
    {
        this.project.scanPaths[absoluteURL.toString()] = file;
        //this.project.addSave(file);
    }
    _debug([
        file.url,
        file.path,
        file.dir
    ])
    return relativePath;
}
Page.prototype.addPage = function(url){
    var absoluteURL = new URL(url,this.url),
    absolutePath,absolutePath2,relativePath;
    absoluteURL.hash = "";
    if(absoluteURL.origin == this.url.origin)
    {
        absolutePath = this.project.projectDir + absoluteURL.pathname;
    }else{
        absolutePath = this.project.projectDir+"/"+safeName(absoluteURL.host) + absoluteURL.pathname;
    };
    if(absolutePath.endsWith("/"))
    {
        absolutePath += "index.html";
    }
    if(absolutePath.split('/').slice(-1).join('').indexOf('.') == -1)
    {
        absolutePath += ".html";
    }
    relativePath = path.relative(path.dirname(this.path),absolutePath.toString())
    if(relativePath == '') relativePath = '.';
    var file = new Page(absoluteURL,this.project);
    file.project = this.project;
    file.dir = path.dirname(absolutePath);
    file.path = absolutePath;
    file.referrer = this;
    if(!this.project.isThere(absoluteURL))
    {
        this.project.scanPaths[absoluteURL.toString()] = file;
        //this.project.addSave(file);
    }
    _debug([
        file.url,
        file.path,
        file.dir
    ])
    return relativePath;
}
Object.assign(Css.prototype,Page.prototype);
Object.assign(File.prototype,File.prototype);
Project.Page = Page;
Project.Css = Css;
Project.File = File;

module.exports = Project;

Project.createUnexistsDir = createUnexistsDir;

function safeName(name)
{
    return name.replace(/[\:\*\\\/\?\#\|]/g,'');
}
async function createUnexistsDir(dir)
{
    return await new Promise(ok=>{
        fs.mkdir(dir,{
            recursive:true
        },()=>{
            ok()
        })
    })
};