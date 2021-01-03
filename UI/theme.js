hy("html>head").add({$:"link",$rel:"stylesheet",$href:"./FontAwesome/styles.min.css"})
hy("html>head").add({$:"link",$rel:"stylesheet",$href:"./Ubuntu/style.css"})
hy("html>head").add({$:"link",$rel:"stylesheet",$href:"./Icomoon/styles.css"})
hy.css.insertRule("html,body{width:100%;margin:0;height:100%;font-family:Ubuntu;overflow:hidden;font-size:14px}*{box-sizing:border-box}body{display:flex;flex-direction:row}");

const ipcRenderer = require("electron").ipcRenderer;
hy.load(function(){
    ipcRenderer.invoke("loaded");
})
async function com(chnl)
{
    let channel = await ipcRenderer.invoke("invokable-channel",chnl);
    var o = {
        reply:(func)=> o._reply = func,
        _reply:null,
        send:function(...args){
            ipcRenderer.send(channel,...args)
        }
    };
    let _listener = function(event,...args){
        if(args.length == 1 && args[0]=="end-"+channel){
            return ipcRenderer.removeListener(channel,_listener);
        }
        o._reply.apply(null,args)
    };
    ipcRenderer.on(channel,_listener);
    return o
};

let dark = "#e2e2e2";
hy.css.add("texttip",{
    style:{
        overflow:"hidden",
        textOverflow:"ellipsis",
        maxWidth:"100%"
    }
})
hy.css.add("fcol",{
    style:{
        "#flex":"flex column nowrap"
    }
})
hy.css.add("frow",{
    style:{
        "#flex":"flex row nowrap"
    }
})
hy.css.add("ffill",{
    style:{
        "#flex":"fill"
    }
})
hy.css.add("btn",{
    style:{
        border: "none",
        padding: "10px 10px",
        cursor: "pointer"
    },
    ':hover':{
        backgroundColor:"rgba(0,0,0,0.1)"
    },
    ':active':{
        backgroundColor:"rgba(0,0,0,0.2)"
    },
    '.right':{
        marginRight:"10px"
    }
})
hy.css.add("fitem",{
    style:{
        '#flex':"flex column nowrap",
        padding:"10px 5px",
        color:"black",
        textShadow:"0 0 1px black",
        cursor:"pointer",
        userSelect:"none",
        border:{
            right:{
                width:"3px",
                style:"solid",
                color:"transparent"
            }
        }
    },
    ':hover':{
        backgroundColor:"rgba(0,0,0,0.1)"
    },
    '.active':{
        borderRightColor:"#00cc00"
    },
    ':active':{
        backgroundColor:"rgba(0,0,0,0.2)"
    },
    ' :first-child':{
        margin:"auto"
    },
    ' :last-child':{
        margin:"auto",
        display:"block",
        textAlign:"center"
    }
})
hy.css.add("tooltip",{
    style:{
        '#flex':"flex column min nowrap",
        width:"100px",
        background:dark
    }
})
hy.css.add("bottombuttons",{
    style:{
        '#flex':"flex row min",
        width:"100%",
        marginBottom:"auto",
        background:dark,
        whiteSpace:"nowrap"
    },
    '>*':{
        flex:"1 1 auto",
        minWidth:"20%"
    }
})
hy.css.add("content",{
    style:{
        '#flex':"flex nowrap fill",
        overflow: "hidden",
        maxWidth: "100%"
    },
    '>:not(.active)':{
        display:"none"
    },
    '>.active':{
        '#flex':"flex column fill",
        overflow: "hidden",
        maxWidth: "100%"
    }
})
hy.css.add("project-panel",{
    style:{
        '#flex':"flex column",
        padding: "10px",
        color:"white",
        backgroundColor: "#50a541",
        marginBottom:"10px",
        width:"100%"
    },
    '>.title':{
        '#flex':"flex row",
    },
    '>.content':{
        '#flex':"flex column",
    }
});
hy.css.add("rightmauto",{
    style:{
        marginRight:"auto"
    }
})
function tab(text,icon,num,click)
{
    return {
        $:"tab",
        uicss:"fitem",
        $tab:num,
        onclick:!click?num:click,
        xin:[{
            $:"div",
            $class:icon
        },{
            $:"div",
            uicss:"texttip",
            xin:[text]
        }]
    }
}
function tabTitle(title)
{
    return {
        $:"div",
        $title:title,
        uicss:{
            style:{
                borderBottom: "solid 1px black",
                backgroundColor: "rgba(0,0,0,.05)",
                padding: "5px",
                textAlign: "center"
            }
        },
        xin:[title]
    }
}
let filledFlex = {
    $:"div",
    uicss:{
        style:{
            '#flex':"flex fill nowrap",
            overflow:"hidden auto",
            padding:"10px"
        }
    }
}
let filledColumnFlex = {
    $:"div",
    uicss:{
        style:{
            '#flex':"flex fill column nowrap",
            overflow:"hidden auto",
            padding:"10px"
        }
    }
}
let filledRowFlex = {
    $:"div",
    uicss:{
        style:{
            '#flex':"flex fill column nowrap",
            overflow:"hidden auto",
            padding:"10px"
        }
    }
}
function urlSelect(asing)
{
    let t = hy.Element(Object.assign({
        $:"div",
        uicss:{
            style:{
                '#flex':"flex column nowrap",
                width:"100%"
            },
            " input":{
                '#flex':"fill",
                width:"100%",
                padding: "5px 10px"
            },
            " input, select":{
                padding: "5px 10px",
                letterSpacing:"1px"
            },
            '>*':{
                '#flex':"flex row nowrap",
                width:"100%"
            }
        },
        xin:[{
            $:"div",
            xin:[{
                $:"select",
                xin:[{
                    $:"option",
                    html:"https://"
                },{
                    $:"option",
                    html:"http://"
                }]
            },{
                $:"input",
                $type:"url",
                $name:"domain",
                $placeholder:"www.domain.com"
            },{
                $:"input",
                $name:"path",
                $type:"text",
                $placeholder:"/path/name?search#hash"
            }]
        },{
            $:"div",
            style:{
                padding:"5px 10px"
            },
            xin:[]
        }]
    },asing));
    let _content = t.childs("div:last-child");
    let _domain = t.find("[name='domain']");
    let _path = t.find("[name='path']");
    let _protocol = t.find("select");
    t.find("input,select").on("change,keyup",function(){
        var domain = _domain.val();
        var path = _path.val();
        path = path.charAt(0) == "/" ? path : "/"+path
        var protocol = _protocol.val();
        try{
            var url = new URL(protocol+domain+path);
        }catch(i){
            _content.html("Geçersiz URL")
            return;
        };
        t.attr("url",url.toString());
        _content.truncate().add([{
            $:"span",
            style:{color:"#00cc00"},
            html:url.protocol+"//"
        },{
            $:"span",
            style:{color:"#000000"},
            html:url.hostname
        },{
            $:"span",
            style:{color:"#cc5500"},
            html:url.pathname
        },{
            $:"span",
            style:{color:"#0000cc"},
            html:url.search
        },{
            $:"span",
            style:{color:"#cc0000"},
            html:url.hash
        }])
    });
    return t;
}