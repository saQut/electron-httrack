const {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} = require("electron");
const fs = require("fs");
const ProjectManager = require("./ProjectManager");

try{fs.mkdirSync(__dirname+"/profile")}catch(i){};
app.setPath("userData",__dirname+"/profile");

const Tray = require("./Tray");

global.Projects = {};

app.on("ready",function(){
    const win = new BrowserWindow({
        width:900,
        height:600,
        icon:"UI/icon.png",
        center:true,
        webPreferences:{
            nodeIntegration:true
        },
        fullscreenable:false,
        title:"Web Crawler",
        show:false
    });
    win.loadFile("UI/main.html");
})

ipcMain.handle("openmodal",async function(event,name){
    var parentWin = BrowserWindow.fromWebContents(event.sender);
    switch(name)
    {
        case "inspectpage":{
            return await inspectPageModal(parentWin);
        }
    }
})
ipcMain.handle("loaded",function(event){
    var parentWin = BrowserWindow.fromWebContents(event.sender);
    parentWin.show();
})


async function inspectPageModal(parent)
{
    return await new Promise(ok=>{
        const win = new BrowserWindow({
            width:500,
            height:200,
            icon:"UI/icon.png",
            center:true,
            webPreferences:{
                nodeIntegration:true
            },
            parent:parent,
            modal:true,
            minimizable:false,
            fullscreenable:false,
            maximizable:false,
            resizable:false,
            title:"Siteyi İncele",
            show:false
        });
        win.loadFile("UI/modal.inspectpage.html");
        win.on("close",function(){
            ipcMain.removeHandler("reply-ok");
            ipcMain.removeHandler("reply-cancel");
            ok&&ok(false);
        })
        let multipled = false;
        ipcMain.handle("reply-ok",function(event,url){
            try{
                new URL(url);
                ok(url);
                ok=null;
                win.close()
            }catch(i){}
        });
        ipcMain.handle("reply-cancel",function(){
            win.close()
            ok(false)
            ok=null;
        });
    })
}
function createComId()
{
    return "CID-"+(createComId.id++);
};
createComId.id = 0;
ipcMain.handle("invokable-channel",async function(event,method){
    let channelid = createComId();
    var u = new ProjectManager.methods[method]();
    if(u == null){
        return false;
    };
    let _listener = (event,...args) => {
        u.request(...args)
    }
    ipcMain.on(channelid,_listener)
    u.response(function(...args){
        event.sender.send(channelid,...args)
    });
    u.end(function(...args){
        event.sender.send(channelid,"end-"+channelid);
        ipcMain.removeListener(channelid,_listener);
    });
    return channelid;
});