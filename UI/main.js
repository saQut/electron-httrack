let main = hy("body").add({
    $:"div",
    uicss:{
        style:{
            maxWidth:"100%",
            width:"100%",
            '#flex':"flex row nowrap"
        }
    }
})
let tooltip = hy(main).add({
    $:"div",
    uicss:"tooltip",
    xin:[
        tab("Monitör","fa fa-2x fa-television",0,function(){
            let tab = content.childs().classes("-active").is("[tab='0']");
            hy(tab).classes("+active");
            tooltip.childs(".active").classes("-active");
            hy(this).classes("+active");
        }),
        tab("Projeler","fa fa-2x fa-bug",1,function(){
            let tab = content.childs().classes("-active").is("[tab='1']");
            hy(tab).classes("+active");
            tooltip.childs(".active").classes("-active");
            hy(this).classes("+active");
        }),
        tab("Ayarlar","fa fa-2x fa-cog",2,function(){
            let tab = content.childs().classes("-active").is("[tab='2']");
            hy(tab).classes("+active");
            tooltip.childs(".active").classes("-active");
            hy(this).classes("+active");
        })
    ]
});
let content = hy(main).add({
    $:"div",
    uicss:"content"
})
let monitorTab = content.add({
    $:"div",
    $class:"active",
    $tab:0,
    $title:"Monitör"
});
let projectTab = content.add({
    $:"div",
    $title:"Projeler",
    $tab:1
});
let settingsTab = content.add({
    $:"div",
    $title:"Ayarlar",
    $tab:2
});

monitorTab.add(tabTitle("Monitör"));
projectTab.add(tabTitle("Projeler"));
settingsTab.add(tabTitle("Ayarlar"));
let monitorContent = monitorTab.add(filledColumnFlex);
let projectContent = projectTab.add(filledColumnFlex);
let settingsContent = settingsTab.add(filledColumnFlex);

addNewProjectItem();
function addNewProjectItem()
{
    projectContent.add({
        $:"div",
        uicss:"bottombuttons",
        xin:[
            tab("Siteyi İndir","fa fa-2x fa-camera",downloadsite),
            tab("Sayfa İncele","icon-2x icon-target2",inspectPage),
            tab("Dosya İndir","fa fa-2x fa-download",function(){
                openModal("downloadfile")
            }),
            tab("Yazı İçeriği Al","fa fa-2x fa-align-left",function(){
                openModal("getcontent")
            }),
            tab("Sitemap Oluştur","fa fa-2x fa-sitemap",function(){
                openModal("createsitemap")
            }),
            tab("Site İndexi Oluştur","fa fa-2x fa-flash",function(){
                openModal("createindex")
            })
        ]
    });
};
async function openModal(arg)
{
    return await ipcRenderer.invoke("openmodal",arg);
}
async function downloadsite(){
    let opt = await openModal("downloadsite");
    if(opt)
    {
        let tab = content.childs().classes("-active").is("[tab='0']");
        hy(tab).classes("+active")
        tooltip.childs(".active").classes("-active");
        tooltip.childs("[tab='0']").classes("+active");
        addProjectPanel({
            type:"downloadsite",
            url:opt.url,
            settings:opt
        })
    }
}
async function inspectPage()
{
    let url = await openModal("inspectpage");
    if(url)
    {
        let tab = content.childs().classes("-active").is("[tab='0']");
        hy(tab).classes("+active")
        tooltip.childs(".active").classes("-active");
        tooltip.childs("[tab='0']").classes("+active");
        addProjectPanel({
            type:"inspectPage",
            url:url
        })
    }
}
function addProjectPanel(o)
{
    let item = monitorContent.add({
        $:"div",
        uicss:"project-panel",
        xin:[{
            $:"div",
            $class:"title",
            xin:[{
                $:"div",
                uicss:"rightmauto",
                html:"Tür: "+o.type
            },{
                $:"div",
                uicss:"rightmauto",
                html:"Site: "+o.url
            },{
                $:"div",
                uicss:"rightmauto",
                html:ixir.now().toDateTime()
            },{
                $:"div",
                uicss:"frow",
                $class:"buttons",
                xin:[{
                    $:"i",
                    style:{
                        margin:"0px 5px",
                        cursor:"pointer"
                    },
                    onclick:()=>execute(),
                    $class:"icon-play4"
                },{
                    $:"i",
                    style:{
                        margin:"0px 5px",
                        cursor:"pointer"
                    },
                    onclick:()=>removeProject(),
                    $class:"icon-trash-alt"
                }]
            }]
        },{
            $:"div",
            $class:"content"
        }]
    });
    function removeProject()
    {
        item.remove();
    }
    function execute()
    {
        var t = item.find(".content"),hide=false;
        item.find(".buttons").truncate().add({
            $:"button",
            uicss:"btn",
            html:"Gizle",
            onclick:function(){
                if(hide){
                    hy(this).html("Gizle")
                    t.show()
                }else{
                    hy(this).html("Göster")
                    t.hide()
                };
                hide=!hide;
            }
        });
        addProjectPanel.methods[o.type](t,o)

    }
}
addProjectPanel.methods = {};
addProjectPanel.methods.inspectPage = async function(content,options){
    let t = await com("inspectPage");
    var log = [];
    t.reply(function(i){
        if(typeof i == "string"){
            log.push(`<span style="margin-bottom:5px">${i}</span>`);
            return content.html(log.join('<br>'));
        }
        content.truncate().add({
            $:"div",
            style:{
                '#flex':"flex column"
            },
            xin:[{
                $:"div",
                uicss:"frow",
                xin:[{
                    $:"div",
                    uicss:{
                        $name:"textlik",
                        extends:"text",
                        style:{
                            '#flex':"min",
                            width:"50px"
                        }
                    },
                    html:"Tür"
                },{
                    $:"div",
                    uicss:"ffill",
                    html:"Link"
                }]
            }].concat(Object.entries(i).map(function([url,obj]){
                return {
                    $:"div",
                    uicss:"frow",
                    xin:[{
                        $:"div",
                        uicss:{
                            $name:"textlik",
                            extends:"texttip",
                            style:{
                                '#flex':"min",
                                width:"50px"
                            }
                        },
                        html:obj.type
                    },{
                        $:"div",
                        uicss:{
                            extends:"texttip ffill",
                            style:{
                                whiteSpace:"nowrap",
                                textOverflow:"ellipsis",
                                overflow:"hidden",
                                maxWidth:"100%"
                            }
                        },
                        html:url
                    }]
                }
            }))
        })
    });
    t.send(options.url);
}

addProjectPanel.methods.downloadsite = async function(content,options){
    let t = await com("downloadsite");
    var log = [];
    t.reply(function(i){
        if(typeof i == "string"){
            log.push(`<span style="margin-bottom:5px">${i}</span>`);
            return content.html(log.join('<br>'));
        }
    });
    t.send(options)
}