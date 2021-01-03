const {
    app,
    BrowserWindow,
    Tray,
    Menu
} = require("electron");
const child_process = require("child_process");

app.on("ready",function(){
    var t = new Tray("UI/icon.png");
    t.focus();
    t.setTitle("CopyWeb");
    t.setToolTip("CopyWeb");
    let menu = Menu.buildFromTemplate([{
        label:"Göster",
        click:()=>{
            exports.mainWindow.show()
        }
    },{
        label:"Gizle",
        click:()=>{
            exports.mainWindow.hide()
        }
    },{
        label:"Yeniden başlat",
        click:()=>{
            child_process.spawn(process.execPath,process.argv.slice(1),{
                detached:true
            })
            app.exit(1);
        }
    },{
        label:"Çık",
        click:()=>{
            app.exit(1);
        }
    }])
    t.setContextMenu(menu);
})
/**
 * @type {BrowserWindow}
 */
exports.mainWindow = null;